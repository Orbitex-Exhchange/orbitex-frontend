import { WebSocketMessage, RangerEvent, TickerEvent, OrderEvent, TradeEvent } from '@/types';

// ===== WEBSOCKET CONFIGURATION =====

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  heartbeatTimeout: number;
  messageQueueSize: number;
  enableLogging: boolean;
}

export interface WebSocketConnection {
  connected: boolean;
  connecting: boolean;
  reconnectAttempts: number;
  lastHeartbeat: number;
  subscriptions: string[];
}

export interface WebSocketMessage {
  event: string;
  data: any;
  timestamp: number;
}

// ===== MESSAGE QUEUE FOR HIGH-FREQUENCY TRADING =====

interface QueuedMessage {
  id: string;
  message: any;
  priority: number;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

class MessageQueue {
  private queue: QueuedMessage[] = [];
  private processing = false;
  private readonly maxSize: number;
  private readonly maxRetries: number;

  constructor(maxSize: number = 1000, maxRetries: number = 3) {
    this.maxSize = maxSize;
    this.maxRetries = maxRetries;
  }

  add(message: any, priority: number = 1, maxRetries?: number): string {
    const id = this.generateId();
    
    if (this.queue.length >= this.maxSize) {
      // Remove lowest priority message
      this.queue.sort((a, b) => b.priority - a.priority);
      this.queue.pop();
    }

    this.queue.push({
      id,
      message,
      priority,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: maxRetries || this.maxRetries,
    });

    this.queue.sort((a, b) => b.priority - a.priority);
    return id;
  }

  getNext(): QueuedMessage | null {
    return this.queue.shift() || null;
  }

  remove(id: string): void {
    const index = this.queue.findIndex(item => item.id === id);
    if (index !== -1) {
      this.queue.splice(index, 1);
    }
  }

  clear(): void {
    this.queue = [];
  }

  size(): number {
    return this.queue.length;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ===== HEARTBEAT MANAGER =====

class HeartbeatManager {
  private heartbeatInterval: number;
  private heartbeatTimeout: number;
  private lastHeartbeat: number = 0;
  private heartbeatTimer?: NodeJS.Timeout;
  private timeoutTimer?: NodeJS.Timeout;
  private onHeartbeat?: () => void;
  private onTimeout?: () => void;

  constructor(interval: number = 30000, timeout: number = 10000) {
    this.heartbeatInterval = interval;
    this.heartbeatTimeout = timeout;
  }

  start(onHeartbeat: () => void, onTimeout: () => void): void {
    this.onHeartbeat = onHeartbeat;
    this.onTimeout = onTimeout;
    this.scheduleHeartbeat();
  }

  stop(): void {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = undefined;
    }
  }

  received(): void {
    this.lastHeartbeat = Date.now();
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = undefined;
    }
  }

  private scheduleHeartbeat(): void {
    this.heartbeatTimer = setTimeout(() => {
      this.sendHeartbeat();
      this.scheduleHeartbeat();
    }, this.heartbeatInterval);
  }

  private sendHeartbeat(): void {
    this.onHeartbeat?.();
    
    // Set timeout for heartbeat response
    this.timeoutTimer = setTimeout(() => {
      this.onTimeout?.();
    }, this.heartbeatTimeout);
  }
}

// ===== MAIN WEBSOCKET CLIENT =====

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private connection: WebSocketConnection;
  private messageQueue: MessageQueue;
  private heartbeatManager: HeartbeatManager;
  private reconnectTimer?: NodeJS.Timeout;
  private eventListeners = new Map<string, Set<(data: any) => void>>();
  private messageListeners = new Set<(message: WebSocketMessage) => void>();
  private connectionListeners = new Set<(connected: boolean) => void>();

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: 'ws://localhost:3001/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      heartbeatTimeout: 10000,
      messageQueueSize: 1000,
      enableLogging: process.env.NODE_ENV === 'development',
      ...config,
    };

    this.connection = {
      connected: false,
      connecting: false,
      reconnectAttempts: 0,
      lastHeartbeat: 0,
      subscriptions: [],
    };

    this.messageQueue = new MessageQueue(this.config.messageQueueSize);
    this.heartbeatManager = new HeartbeatManager(
      this.config.heartbeatInterval,
      this.config.heartbeatTimeout
    );
  }

  // ===== CONNECTION MANAGEMENT =====

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connection.connected || this.connection.connecting) {
        resolve();
        return;
      }

      this.connection.connecting = true;
      this.log('Connecting to WebSocket', { url: this.config.url });

      try {
        this.ws = new WebSocket(this.config.url);
        this.setupEventHandlers(resolve, reject);
      } catch (error) {
        this.connection.connecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.log('Disconnecting from WebSocket');
    
    this.heartbeatManager.stop();
    this.messageQueue.clear();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.connection.connected = false;
    this.connection.connecting = false;
    this.connection.reconnectAttempts = 0;
    
    this.notifyConnectionChange(false);
  }

  // ===== MESSAGE SENDING =====

  send(message: any, priority: number = 1): string {
    if (!this.connection.connected) {
      return this.messageQueue.add(message, priority);
    }

    try {
      const messageStr = JSON.stringify(message);
      this.ws!.send(messageStr);
      this.log('Message sent', { message, priority });
      return 'sent';
    } catch (error) {
      this.log('Failed to send message', { error, message });
      return this.messageQueue.add(message, priority);
    }
  }

  subscribe(channel: string, params?: any): void {
    const message = {
      event: 'subscribe',
      channel,
      ...params,
    };

    this.send(message, 2); // High priority for subscriptions
    this.connection.subscriptions.push(channel);
  }

  unsubscribe(channel: string): void {
    const message = {
      event: 'unsubscribe',
      channel,
    };

    this.send(message, 2);
    this.connection.subscriptions = this.connection.subscriptions.filter(
      sub => sub !== channel
    );
  }

  // ===== EVENT LISTENERS =====

  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  onMessage(callback: (message: WebSocketMessage) => void): void {
    this.messageListeners.add(callback);
  }

  onConnection(callback: (connected: boolean) => void): void {
    this.connectionListeners.add(callback);
  }

  // ===== TRADING-SPECIFIC METHODS =====

  subscribeToTicker(market: string): void {
    this.subscribe('ticker', { market });
  }

  subscribeToOrderBook(market: string): void {
    this.subscribe('orderbook', { market });
  }

  subscribeToTrades(market: string): void {
    this.subscribe('trades', { market });
  }

  subscribeToKlines(market: string, interval: string): void {
    this.subscribe('klines', { market, interval });
  }

  subscribeToOrders(): void {
    this.subscribe('orders');
  }

  subscribeToWallets(): void {
    this.subscribe('wallets');
  }

  // ===== UTILITY METHODS =====

  isConnected(): boolean {
    return this.connection.connected;
  }

  getConnectionState(): WebSocketConnection {
    return { ...this.connection };
  }

  getQueueSize(): number {
    return this.messageQueue.size();
  }

  // ===== PRIVATE METHODS =====

  private setupEventHandlers(
    resolve: () => void,
    reject: (error: any) => void
  ): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.log('WebSocket connected');
      this.connection.connected = true;
      this.connection.connecting = false;
      this.connection.reconnectAttempts = 0;
      this.connection.lastHeartbeat = Date.now();
      
      this.heartbeatManager.start(
        () => this.sendHeartbeat(),
        () => this.handleHeartbeatTimeout()
      );

      this.processQueuedMessages();
      this.resubscribe();
      
      this.notifyConnectionChange(true);
      resolve();
    };

    this.ws.onclose = (event) => {
      this.log('WebSocket disconnected', { code: event.code, reason: event.reason });
      this.connection.connected = false;
      this.connection.connecting = false;
      
      this.heartbeatManager.stop();
      this.notifyConnectionChange(false);

      if (event.code !== 1000) { // Not a normal closure
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      this.log('WebSocket error', { error });
      reject(error);
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event.data);
    };
  }

  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      message.timestamp = Date.now();

      this.log('Message received', { message });

      // Handle heartbeat
      if (message.event === 'pong') {
        this.heartbeatManager.received();
        return;
      }

      // Notify message listeners
      this.messageListeners.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          this.log('Error in message listener', { error, message });
        }
      });

      // Notify event listeners
      const listeners = this.eventListeners.get(message.event);
      if (listeners) {
        listeners.forEach(callback => {
          try {
            callback(message.data);
          } catch (error) {
            this.log('Error in event listener', { error, message });
          }
        });
      }

      // Handle specific trading events
      this.handleTradingEvent(message);

    } catch (error) {
      this.log('Failed to parse message', { error, data });
    }
  }

  private handleTradingEvent(message: WebSocketMessage): void {
    switch (message.event) {
      case 'ticker':
        this.handleTickerEvent(message.data as TickerEvent);
        break;
      case 'order':
        this.handleOrderEvent(message.data as OrderEvent);
        break;
      case 'trade':
        this.handleTradeEvent(message.data as TradeEvent);
        break;
      case 'orderbook':
        this.handleOrderBookUpdate(message.data);
        break;
      case 'klines':
        this.handleKlinesUpdate(message.data);
        break;
    }
  }

  private handleTickerEvent(data: TickerEvent): void {
    // Handle ticker updates
    this.log('Ticker update', { data });
  }

  private handleOrderEvent(data: OrderEvent): void {
    // Handle order updates
    this.log('Order update', { data });
  }

  private handleTradeEvent(data: TradeEvent): void {
    // Handle trade updates
    this.log('Trade update', { data });
  }

  private handleOrderBookUpdate(data: any): void {
    // Handle order book updates
    this.log('Order book update', { data });
  }

  private handleKlinesUpdate(data: any): void {
    // Handle k-lines updates
    this.log('K-lines update', { data });
  }

  private sendHeartbeat(): void {
    this.send({ event: 'ping' }, 3); // Highest priority
  }

  private handleHeartbeatTimeout(): void {
    this.log('Heartbeat timeout, reconnecting');
    this.disconnect();
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.connection.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log('Max reconnection attempts reached');
      return;
    }

    this.connection.reconnectAttempts++;
    const delay = this.config.reconnectInterval * Math.pow(2, this.connection.reconnectAttempts - 1);

    this.log('Scheduling reconnection', { 
      attempt: this.connection.reconnectAttempts, 
      delay 
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        this.log('Reconnection failed', { error });
        this.scheduleReconnect();
      });
    }, delay);
  }

  private processQueuedMessages(): void {
    while (this.messageQueue.size() > 0) {
      const queuedMessage = this.messageQueue.getNext();
      if (!queuedMessage) break;

      try {
        this.send(queuedMessage.message, queuedMessage.priority);
      } catch (error) {
        if (queuedMessage.retries < queuedMessage.maxRetries) {
          queuedMessage.retries++;
          this.messageQueue.add(queuedMessage.message, queuedMessage.priority, queuedMessage.maxRetries);
        }
      }
    }
  }

  private resubscribe(): void {
    this.connection.subscriptions.forEach(channel => {
      this.subscribe(channel);
    });
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        this.log('Error in connection listener', { error });
      }
    });
  }

  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[WebSocket] ${message}`, data);
    }
  }
}

// ===== SPECIALIZED TRADING WEBSOCKET CLIENT =====

export class TradingWebSocketClient extends WebSocketClient {
  constructor() {
    super({
      url: 'ws://localhost:3001/ws/trading',
      reconnectInterval: 1000, // Faster reconnection for trading
      maxReconnectAttempts: 20, // More attempts for trading
      heartbeatInterval: 15000, // More frequent heartbeat for trading
      heartbeatTimeout: 5000, // Shorter timeout for trading
      messageQueueSize: 5000, // Larger queue for high-frequency trading
    });
  }

  // Trading-specific methods
  subscribeToMarketData(market: string): void {
    this.subscribeToTicker(market);
    this.subscribeToOrderBook(market);
    this.subscribeToTrades(market);
  }

  subscribeToUserData(): void {
    this.subscribeToOrders();
    this.subscribeToWallets();
  }

  sendOrder(orderData: any): void {
    this.send({
      event: 'order',
      data: orderData,
    }, 3); // Highest priority for orders
  }

  cancelOrder(orderId: number): void {
    this.send({
      event: 'cancel_order',
      data: { order_id: orderId },
    }, 3); // Highest priority for cancellations
  }
}

// ===== SINGLETON INSTANCES =====

export const wsClient = new WebSocketClient();
export const tradingWsClient = new TradingWebSocketClient();
