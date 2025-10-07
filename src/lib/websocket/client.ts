import { WebSocketMessage, RangerEvent, TickerEvent, OrderEvent, TradeEvent } from '@/types';
import { socketeerClient } from './socketeer-client';
import { env } from '@/lib/env';

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

// ===== MAIN WEBSOCKET CLIENT (Socketeer Adapter) =====

export class WebSocketClient {
  private config: WebSocketConfig;
  private connection: WebSocketConnection;
  private eventListeners = new Map<string, Set<(data: any) => void>>();
  private messageListeners = new Set<(message: WebSocketMessage) => void>();
  private connectionListeners = new Set<(connected: boolean) => void>();

  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = {
      url: env.NEXT_PUBLIC_WS_URL, // Use environment variable for socketeer
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

    // Set up socketeer client listeners
    this.setupSocketeerListeners();
  }

  // ===== SOCKETEER INTEGRATION =====

  private setupSocketeerListeners(): void {
    // Listen to all socketeer messages and forward them
    socketeerClient.on('*', (data: any) => {
      this.handleMessage(data);
    });
  }

  // ===== CONNECTION MANAGEMENT =====

  connect(): Promise<void> {
    this.connection.connecting = true;
    this.log('Connecting via Socketeer');

    return socketeerClient.connectPublic().then(() => {
      this.connection.connected = true;
      this.connection.connecting = false;
      this.connection.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);
    }).catch((error) => {
      this.connection.connecting = false;
      throw error;
    });
  }

  disconnect(): void {
    this.log('Disconnecting from Socketeer');
    socketeerClient.disconnect();
    this.connection.connected = false;
    this.connection.connecting = false;
    this.notifyConnectionListeners(false);
  }

  // ===== EVENT HANDLERS =====

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
    socketeerClient.subscribe([channel]);
    this.connection.subscriptions.push(channel);
    this.log('Subscribed to channel via Socketeer', { channel });
  }

  unsubscribe(channel: string): void {
    socketeerClient.unsubscribe([channel]);
    this.connection.subscriptions = this.connection.subscriptions.filter(s => s !== channel);
    this.log('Unsubscribed from channel via Socketeer', { channel });
  }

  // ===== EVENT LISTENERS =====

  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
    
    // Also register with socketeer client
    socketeerClient.on(event, listener);
  }

  off(event: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
    
    // Also unregister from socketeer client
    socketeerClient.off(event, listener);
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
    return socketeerClient.isPublicConnected();
  }

  isConnecting(): boolean {
    return this.connection.connecting;
  }

  getSubscriptions(): string[] {
    return [...this.connection.subscriptions];
  }

  getConnectionStatus(): WebSocketConnection {
    return { 
      ...this.connection,
      connected: this.isConnected()
    };
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
