import { socketeerClient } from './socketeer-client';
import { sseClient } from './sse-client';

// High-frequency trading optimized WebSocket client (Socketeer Adapter)
class SocketIOTradingClient {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnected = false;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private messageQueue: any[] = [];
  private useSSEFallback = false;
  private performanceMetrics = {
    latency: 0,
    messagesPerSecond: 0,
    lastMessageTime: 0,
    messageCount: 0,
    startTime: Date.now()
  };

  constructor() {
    this.connect();
    this.startPerformanceMonitoring();
  }

  private connect() {
    try {
      console.log('Connecting to Socketeer WebSocket server');
      
      // Connect to socketeer
      socketeerClient.connectPublic().then(() => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.subscribeToDefaultChannels();
        this.flushMessageQueue();
        this.setupSocketeerListeners();
      }).catch((error) => {
        console.error('Failed to connect to Socketeer:', error);
        this.scheduleReconnect();
      });

    } catch (error) {
      console.error('Failed to initialize Socketeer connection:', error);
      this.scheduleReconnect();
    }
  }

  private setupSocketeerListeners() {
    // Set up listeners for different event types
    socketeerClient.on('ticker', (data) => {
      this.handleMessage('ticker', data);
      this.updatePerformanceMetrics();
    });

    socketeerClient.on('orderbook', (data) => {
      this.handleMessage('orderbook', data);
      this.updatePerformanceMetrics();
    });

    socketeerClient.on('ob-inc', (data) => {
      this.handleMessage('orderbook', data);
      this.updatePerformanceMetrics();
    });

    socketeerClient.on('trades', (data) => {
      this.handleMessage('trades', data);
      this.updatePerformanceMetrics();
    });

    socketeerClient.on('kline', (data) => {
      this.handleMessage('kline', data);
      this.updatePerformanceMetrics();
    });
  }

  // Removed old Socket.IO event handlers - now using Socketeer

  private handleMessage(channel: string, data: any) {
    const fullChannel = data.market ? `${data.market}.${channel}` : channel;
    
    if (this.subscribers.has(fullChannel)) {
      const callbacks = this.subscribers.get(fullChannel);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in Socket.IO callback for ${fullChannel}:`, error);
          }
        });
      }
    }

    // Also trigger global channel listeners
    if (this.subscribers.has(channel)) {
      const callbacks = this.subscribers.get(channel);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in global Socket.IO callback for ${channel}:`, error);
          }
        });
      }
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && socketeerClient.isPublicConnected()) {
        // Send ping via socketeer client
        try {
          socketeerClient.sendMessage({ type: 'ping', timestamp: Date.now() });
        } catch (error) {
          console.error('Failed to send ping:', error);
        }
      }
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect Socket.IO (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('Max Socket.IO reconnection attempts reached, falling back to SSE');
      this.useSSEFallback = true;
      this.setupSSEFallback();
    }
  }

  private setupSSEFallback() {
    console.log('Setting up SSE fallback connection');
    this.isConnected = true; // SSE client manages its own connection
    
    // Redirect all subscribers to SSE client
    this.subscribers.forEach((callbacks, channel) => {
      callbacks.forEach(callback => {
        sseClient.subscribe(channel, callback);
      });
    });
  }

  private subscribeToDefaultChannels() {
    // Subscribe to global market data for all markets via Socketeer
    const defaultStreams = ['global.tickers', 'global.orderbook', 'global.trades', 'system'];
    socketeerClient.subscribe(defaultStreams);
  }

  private flushMessageQueue() {
    const internalEvents = ['unsubscribe', 'unsubscribe_market', 'subscribe_user'];
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.isConnected && socketeerClient.isPublicConnected()) {
        // Skip internal events
        if (internalEvents.includes(message.event)) {
          console.debug(`Skipping internal event from queue: ${message.event}`, message.data);
          continue;
        }
        
        try {
          // Send queued message in the format socketeer expects
          const socketeerMessage = { type: message.event };
          if (message.data && typeof message.data === 'object') {
            Object.assign(socketeerMessage, message.data);
          }
          socketeerClient.sendMessage(socketeerMessage);
        } catch (error) {
          console.error('Failed to send queued message:', error);
        }
      }
    }
  }

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  private updatePerformanceMetrics() {
    const now = Date.now();
    this.performanceMetrics.messageCount++;
    this.performanceMetrics.lastMessageTime = now;
    
    // Calculate messages per second over the last 10 seconds
    const timeWindow = 10000; // 10 seconds
    const elapsed = now - this.performanceMetrics.startTime;
    if (elapsed >= timeWindow) {
      this.performanceMetrics.messagesPerSecond = 
        (this.performanceMetrics.messageCount / elapsed) * 1000;
      
      // Reset counters
      this.performanceMetrics.messageCount = 0;
      this.performanceMetrics.startTime = now;
    }
  }

  private startPerformanceMonitoring() {
    setInterval(() => {
      if (this.isConnected) {
        console.log('Socket.IO Performance:', {
          latency: `${this.performanceMetrics.latency}ms`,
          messagesPerSecond: this.performanceMetrics.messagesPerSecond.toFixed(2),
          connected: this.isConnected,
          transport: 'websocket'
        });
      }
    }, 30000); // Log every 30 seconds
  }

  // Public API methods
  public subscribe(channel: string, callback: (data: any) => void) {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);

    if (this.useSSEFallback) {
      sseClient.subscribe(channel, callback);
    } else {
      // Subscribe via Socketeer
      socketeerClient.subscribe([channel]);
      socketeerClient.on(channel, callback);
    }
  }

  public unsubscribe(channel: string, callback?: (data: any) => void) {
    if (callback && this.subscribers.has(channel)) {
      this.subscribers.get(channel)!.delete(callback);
      
      if (this.subscribers.get(channel)!.size === 0) {
        this.subscribers.delete(channel);
        this.emit('unsubscribe', { channel });
      }
    }
  }

  public subscribeToMarket(market: string, callback: (data: any) => void) {
    if (this.useSSEFallback) {
      sseClient.subscribeToMarket(market, callback);
    } else {
      // Use socketeer's market subscription
      socketeerClient.subscribeToMarket(market, callback);
    }
  }

  public unsubscribeFromMarket(market: string, callback: (data: any) => void) {
    const channels = [
      `${market}.ticker`,
      `${market}.orderbook`,
      `${market}.trades`,
      `${market}.kline`
    ];

    channels.forEach(channel => {
      this.unsubscribe(channel, callback);
    });

    this.emit('unsubscribe_market', { market });
  }

  public subscribeToUserData(userId: string, callback: (data: any) => void) {
    const channels = ['user_orders', 'user_trades', 'user_balances'];
    
    channels.forEach(channel => {
      this.subscribe(channel, callback);
    });

    this.emit('subscribe_user', { userId, channels });
  }

  public placeOrder(orderData: any) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Order placement timeout'));
      }, 5000);

      if (!this.isConnected || !socketeerClient.isPublicConnected()) {
        clearTimeout(timeout);
        reject(new Error('WebSocket not connected'));
        return;
      }

      try {
        // For now, just resolve with mock data since we don't have order placement implemented
        clearTimeout(timeout);
        resolve({ success: true, orderId: Date.now().toString() });
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error('Order placement failed'));
      }
    });
  }

  public cancelOrder(orderId: string) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Order cancellation timeout'));
      }, 5000);

      if (!this.isConnected || !socketeerClient.isPublicConnected()) {
        clearTimeout(timeout);
        reject(new Error('WebSocket not connected'));
        return;
      }

      try {
        // For now, just resolve with mock data since we don't have order cancellation implemented
        clearTimeout(timeout);
        resolve({ success: true, orderId });
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error('Order cancellation failed'));
      }
    });
  }

  public emit(event: string, data?: any) {
    // These events should not be sent to socketeer as they are handled by the socketeer-client directly
    const internalEvents = ['unsubscribe', 'unsubscribe_market', 'subscribe_user'];
    
    if (internalEvents.includes(event)) {
      // These are internal events, just log them for debugging
      console.debug(`Internal event: ${event}`, data);
      return;
    }

    if (this.isConnected && socketeerClient.isPublicConnected()) {
      try {
        // Send message in the format socketeer expects (for other events like ping)
        const message = { type: event };
        if (data && typeof data === 'object') {
          Object.assign(message, data);
        }
        socketeerClient.sendMessage(message);
      } catch (error) {
        console.error('Failed to emit message:', error);
      }
    } else {
      // Queue message for when connection is restored (only non-internal events)
      this.messageQueue.push({ event, data });
    }
  }

  public disconnect() {
    this.stopHeartbeat();
    try {
      socketeerClient.disconnect();
    } catch (error) {
      console.error('Error disconnecting socketeer client:', error);
    }
    this.subscribers.clear();
    this.messageQueue.length = 0;
    this.isConnected = false;
  }

  public getConnectionState(): boolean {
    if (this.useSSEFallback) {
      return sseClient.getConnectionState();
    }
    return socketeerClient.isPublicConnected();
  }

  public getPerformanceMetrics() {
    if (this.useSSEFallback) {
      return sseClient.getPerformanceMetrics();
    }
    return { ...this.performanceMetrics };
  }

  public getTransportType(): string {
    if (this.useSSEFallback) {
      return sseClient.getTransportType();
    }
    return 'websocket';
  }
}

// Singleton instance
export const socketIOClient = new SocketIOTradingClient();

export default socketIOClient;
