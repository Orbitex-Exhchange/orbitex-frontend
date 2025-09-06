import { WebSocketMessage, RangerEvent, TickerEvent, OrderEvent, TradeEvent } from '@/types';

// ===== WEBSOCKET CONFIGURATION =====

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  enableLogging: boolean;
}

export interface WebSocketConnection {
  connected: boolean;
  connecting: boolean;
  reconnectAttempts: number;
  subscriptions: string[];
}

// ===== MAIN WEBSOCKET CLIENT =====

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private connection: WebSocketConnection;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventListeners = new Map<string, Set<(data: any) => void>>();
  private messageListeners = new Set<(message: WebSocketMessage) => void>();
  private connectionListeners = new Set<(connected: boolean) => void>();

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: 'ws://localhost:3001/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      enableLogging: process.env.NODE_ENV === 'development',
      ...config,
    };

    this.connection = {
      connected: false,
      connecting: false,
      reconnectAttempts: 0,
      subscriptions: [],
    };
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
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connection.connected = false;
    this.connection.connecting = false;
    this.notifyConnectionListeners(false);
  }

  // ===== EVENT HANDLERS =====

  private setupEventHandlers(resolve: () => void, reject: (error: any) => void): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.log('WebSocket connected');
      this.connection.connected = true;
      this.connection.connecting = false;
      this.connection.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);
      resolve();
    };

    this.ws.onclose = (event) => {
      this.log('WebSocket disconnected', { code: event.code, reason: event.reason });
      this.connection.connected = false;
      this.connection.connecting = false;
      this.notifyConnectionListeners(false);
      
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = (error) => {
      this.log('WebSocket error', { error });
      this.connection.connecting = false;
      reject(error);
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        this.log('Failed to parse message', { error, data: event.data });
      }
    };
  }

  // ===== MESSAGE HANDLING =====

  private handleMessage(message: any): void {
    this.log('Received message', { message });

    // Notify message listeners
    this.messageListeners.forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        this.log('Error in message listener', { error });
      }
    });

    // Handle specific event types
    if (message.event) {
      const listeners = this.eventListeners.get(message.event);
      if (listeners) {
        listeners.forEach(listener => {
          try {
            listener(message.data);
          } catch (error) {
            this.log('Error in event listener', { error, event: message.event });
          }
        });
      }
    }
  }

  // ===== MESSAGE SENDING =====

  send(message: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.log('WebSocket not connected, cannot send message');
      return;
    }

    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      this.ws.send(messageStr);
      this.log('Sent message', { message });
    } catch (error) {
      this.log('Failed to send message', { error, message });
    }
  }

  // ===== SUBSCRIPTION MANAGEMENT =====

  subscribe(channel: string, params?: any): void {
    const message = {
      event: 'subscribe',
      stream: channel,
      ...params,
    };

    this.send(message);
    this.connection.subscriptions.push(channel);
  }

  unsubscribe(channel: string): void {
    const message = {
      event: 'unsubscribe',
      stream: channel,
    };

    this.send(message);
    this.connection.subscriptions = this.connection.subscriptions.filter(s => s !== channel);
  }

  // ===== EVENT LISTENERS =====

  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  onMessage(listener: (message: WebSocketMessage) => void): void {
    this.messageListeners.add(listener);
  }

  offMessage(listener: (message: WebSocketMessage) => void): void {
    this.messageListeners.delete(listener);
  }

  onConnection(listener: (connected: boolean) => void): void {
    this.connectionListeners.add(listener);
  }

  offConnection(listener: (connected: boolean) => void): void {
    this.connectionListeners.delete(listener);
  }

  // ===== RECONNECTION =====

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

  // ===== UTILITY METHODS =====

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener(connected);
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

  // ===== STATUS =====

  isConnected(): boolean {
    return this.connection.connected;
  }

  isConnecting(): boolean {
    return this.connection.connecting;
  }

  getSubscriptions(): string[] {
    return [...this.connection.subscriptions];
  }

  getConnectionStatus(): WebSocketConnection {
    return { ...this.connection };
  }
}

// ===== SINGLETON INSTANCE =====

export const websocketClient = new WebSocketClient();

// ===== CONVENIENCE EXPORTS =====

export const ws = {
  connect: () => websocketClient.connect(),
  disconnect: () => websocketClient.disconnect(),
  send: (message: any) => websocketClient.send(message),
  subscribe: (channel: string, params?: any) => websocketClient.subscribe(channel, params),
  unsubscribe: (channel: string) => websocketClient.unsubscribe(channel),
  on: (event: string, listener: (data: any) => void) => websocketClient.on(event, listener),
  off: (event: string, listener: (data: any) => void) => websocketClient.off(event, listener),
  onMessage: (listener: (message: WebSocketMessage) => void) => websocketClient.onMessage(listener),
  offMessage: (listener: (message: WebSocketMessage) => void) => websocketClient.offMessage(listener),
  onConnection: (listener: (connected: boolean) => void) => websocketClient.onConnection(listener),
  offConnection: (listener: (connected: boolean) => void) => websocketClient.offConnection(listener),
  isConnected: () => websocketClient.isConnected(),
  isConnecting: () => websocketClient.isConnecting(),
  getSubscriptions: () => websocketClient.getSubscriptions(),
  getConnectionStatus: () => websocketClient.getConnectionStatus(),
};
