import { env } from '../env';

// Socketeer WebSocket client for Orbitex integration
export interface SocketeerMessage {
  event: 'subscribe' | 'unsubscribe';
  streams: string[];
}

export interface SocketeerResponse {
  message: string;
  streams?: string[];
  error?: string;
}

export interface SocketeerConfig {
  publicUrl: string;
  privateUrl: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  enableLogging: boolean;
}

export class SocketeerClient {
  private publicWs: WebSocket | null = null;
  private privateWs: WebSocket | null = null;
  private config: SocketeerConfig;
  private reconnectAttempts = { public: 0, private: 0 };
  private reconnectTimers = { public: null as NodeJS.Timeout | null, private: null as NodeJS.Timeout | null };
  private subscribers = new Map<string, Set<(data: any) => void>>();
  private isConnected = { public: false, private: false };
  private authToken: string | null = null;

  constructor(config?: Partial<SocketeerConfig>) {
    this.config = {
      publicUrl: env.NEXT_PUBLIC_WS_URL,
      privateUrl: env.NEXT_PUBLIC_WS_URL.replace('/public', '/private'),
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      enableLogging: process.env.NODE_ENV === 'development',
      ...config,
    };

    // Get auth token from localStorage
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('access_token');
    }
  }

  // ===== CONNECTION MANAGEMENT =====

  public async connectPublic(): Promise<void> {
    return this.connect('public');
  }

  public async connectPrivate(): Promise<void> {
    if (!this.authToken) {
      throw new Error('Authentication token required for private connection');
    }
    return this.connect('private');
  }

  private async connect(type: 'public' | 'private'): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = type === 'public' ? this.config.publicUrl : this.config.privateUrl;
      
      this.log(`Connecting to ${type} WebSocket: ${url}`);

      try {
        const ws = new WebSocket(url);

        if (type === 'public') {
          this.publicWs = ws;
        } else {
          this.privateWs = ws;
        }

        ws.onopen = () => {
          this.log(`${type} WebSocket connected`);
          this.isConnected[type] = true;
          this.reconnectAttempts[type] = 0;
          resolve();
        };

        ws.onclose = (event) => {
          this.log(`${type} WebSocket disconnected`, { code: event.code, reason: event.reason });
          this.isConnected[type] = false;
          
          if (event.code !== 1000) {
            this.scheduleReconnect(type);
          }
        };

        ws.onerror = (error) => {
          this.log(`${type} WebSocket error`, { error });
          this.isConnected[type] = false;
          reject(error);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data, type);
          } catch (error) {
            this.log(`Failed to parse ${type} message`, { error, data: event.data });
          }
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  public disconnect(): void {
    this.log('Disconnecting from all WebSocket connections');
    
    // Clear reconnect timers
    Object.values(this.reconnectTimers).forEach(timer => {
      if (timer) clearTimeout(timer);
    });

    // Close connections
    if (this.publicWs) {
      this.publicWs.close();
      this.publicWs = null;
    }
    
    if (this.privateWs) {
      this.privateWs.close();
      this.privateWs = null;
    }

    this.isConnected = { public: false, private: false };
  }

  // ===== MESSAGE HANDLING =====

  private handleMessage(data: any, source: 'public' | 'private'): void {
    this.log(`Received ${source} message`, { data });

    // Handle subscription responses
    if (data.message === 'subscribed' || data.message === 'unsubscribed') {
      this.log(`Subscription ${data.message}`, { streams: data.streams });
      return;
    }

    // Handle market data messages
    // Socketeer sends messages in format: { "btcusd.trades": { ... } }
    Object.keys(data).forEach(stream => {
      const streamData = data[stream];
      this.emitToSubscribers(stream, streamData);
      
      // Also emit to market-specific subscribers
      const [market, eventType] = stream.split('.');
      if (market && eventType) {
        this.emitToSubscribers(eventType, { market, ...streamData });
        this.emitToSubscribers(`${market}.${eventType}`, streamData);
      }
    });
  }

  private emitToSubscribers(channel: string, data: any): void {
    const callbacks = this.subscribers.get(channel);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          this.log(`Error in callback for ${channel}`, { error });
        }
      });
    }
  }

  // ===== SUBSCRIPTION MANAGEMENT =====

  public subscribe(streams: string[], usePrivate = false): void {
    const ws = usePrivate ? this.privateWs : this.publicWs;
    const connectionType = usePrivate ? 'private' : 'public';

    if (!ws || !this.isConnected[connectionType]) {
      this.log(`Cannot subscribe: ${connectionType} WebSocket not connected`);
      return;
    }

    // Send subscription message in Rango/Ranger format
    const message = {
      event: 'subscribe',
      streams: streams
    };

    this.send(message, usePrivate);
    this.log(`Subscribed to streams`, { streams, connection: connectionType });
  }

  public unsubscribe(streams: string[], usePrivate = false): void {
    const ws = usePrivate ? this.privateWs : this.publicWs;
    const connectionType = usePrivate ? 'private' : 'public';

    if (!ws || !this.isConnected[connectionType]) {
      this.log(`Cannot unsubscribe: ${connectionType} WebSocket not connected`);
      return;
    }

    // Send unsubscription message in Rango/Ranger format
    const message = {
      event: 'unsubscribe',
      streams: streams
    };

    this.send(message, usePrivate);
    this.log(`Unsubscribed from streams`, { streams, connection: connectionType });
  }

  // ===== EVENT LISTENERS =====

  public on(channel: string, callback: (data: any) => void): void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);
  }

  public off(channel: string, callback: (data: any) => void): void {
    const callbacks = this.subscribers.get(channel);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.subscribers.delete(channel);
      }
    }
  }

  // ===== CONVENIENCE METHODS =====

  public subscribeToMarket(market: string, callback: (data: any) => void): void {
    const streams = [
      `${market}.trades`,
      `${market}.ob-inc`,  // Incremental orderbook updates
      `${market}.ticker`
    ];

    // Subscribe to individual streams
    streams.forEach(stream => {
      this.on(stream, callback);
    });

    this.subscribe(streams);
  }

  public subscribeToUserData(callback: (data: any) => void): void {
    if (!this.authToken) {
      this.log('Cannot subscribe to user data: no auth token');
      return;
    }

    const streams = ['order', 'trade', 'balance'];
    
    streams.forEach(stream => {
      this.on(stream, callback);
    });

    this.subscribe(streams, true); // Use private connection
  }

  // ===== UTILITY METHODS =====

  private send(message: any, usePrivate = false): void {
    const ws = usePrivate ? this.privateWs : this.publicWs;
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    } else {
      this.log(`Cannot send message: WebSocket not ready`, { usePrivate, message });
    }
  }

  public sendMessage(message: any, usePrivate = false): void {
    this.send(message, usePrivate);
  }

  private scheduleReconnect(type: 'public' | 'private'): void {
    if (this.reconnectAttempts[type] >= this.config.maxReconnectAttempts) {
      this.log(`Max reconnection attempts reached for ${type} connection`);
      return;
    }

    this.reconnectAttempts[type]++;
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts[type] - 1);

    this.log(`Scheduling ${type} reconnection`, { 
      attempt: this.reconnectAttempts[type], 
      delay 
    });

    this.reconnectTimers[type] = setTimeout(() => {
      this.connect(type).catch(error => {
        this.log(`${type} reconnection failed`, { error });
        this.scheduleReconnect(type);
      });
    }, delay);
  }

  private log(message: string, data?: any): void {
    if (this.config.enableLogging) {
      console.log(`[SocketeerClient] ${message}`, data);
    }
  }

  // ===== STATUS METHODS =====

  public isPublicConnected(): boolean {
    return this.isConnected.public;
  }

  public isPrivateConnected(): boolean {
    return this.isConnected.private;
  }

  public getConnectionStatus() {
    return {
      public: this.isConnected.public,
      private: this.isConnected.private,
      hasAuthToken: !!this.authToken
    };
  }

  public updateAuthToken(token: string | null): void {
    this.authToken = token;
    
    // Reconnect private connection if token changed
    if (this.privateWs && this.isConnected.private) {
      this.privateWs.close();
      if (token) {
        this.connectPrivate().catch(error => {
          this.log('Failed to reconnect private connection with new token', { error });
        });
      }
    }
  }
}

// Singleton instance
export const socketeerClient = new SocketeerClient();

// Auto-connect to public endpoint
socketeerClient.connectPublic().catch(error => {
  console.error('Failed to connect to Socketeer public endpoint:', error);
});

export default socketeerClient;
