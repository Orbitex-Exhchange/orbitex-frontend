import { getApiBaseUrl } from '@/lib/api-client/config';

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private config: WebSocketConfig;

  constructor(config?: Partial<WebSocketConfig>) {
    const baseUrl = getApiBaseUrl().replace('https://', 'wss://').replace('http://', 'ws://');
    
    this.config = {
      url: `${baseUrl}/ws`,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.stopHeartbeat();
          this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.stopHeartbeat();
    this.clearReconnectTimer();
  }

  subscribe(channel: string, handler: (data: any) => void): void {
    if (!this.messageHandlers.has(channel)) {
      this.messageHandlers.set(channel, []);
    }
    this.messageHandlers.get(channel)!.push(handler);

    // Send subscription message
    this.send({
      type: 'subscribe',
      channel,
      timestamp: Date.now(),
    });
  }

  unsubscribe(channel: string, handler?: (data: any) => void): void {
    if (handler) {
      const handlers = this.messageHandlers.get(channel);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    } else {
      this.messageHandlers.delete(channel);
    }

    // Send unsubscription message
    this.send({
      type: 'unsubscribe',
      channel,
      timestamp: Date.now(),
    });
  }

  send(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected, message not sent:', message);
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message.data);
        } catch (error) {
          console.error('Error in WebSocket message handler:', error);
        }
      });
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      this.send({
        type: 'ping',
        timestamp: Date.now(),
      });
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
      this.clearReconnectTimer();
      this.reconnectTimer = setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.config.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  // Convenience methods for common trading channels
  subscribeToTicker(market: string, handler: (data: any) => void): void {
    this.subscribe(`ticker.${market}`, handler);
  }

  subscribeToOrderBook(market: string, handler: (data: any) => void): void {
    this.subscribe(`orderbook.${market}`, handler);
  }

  subscribeToTrades(market: string, handler: (data: any) => void): void {
    this.subscribe(`trades.${market}`, handler);
  }

  subscribeToOrders(handler: (data: any) => void): void {
    this.subscribe('orders', handler);
  }

  subscribeToBalances(handler: (data: any) => void): void {
    this.subscribe('balances', handler);
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

// React hook for WebSocket service
export const useWebSocket = () => {
  return websocketService;
};
