import { env } from '../env';

// Server-Sent Events client optimized for high-frequency trading
class SSETradingClient {
  private eventSources: Map<string, EventSource> = new Map();
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private maxReconnectAttempts = 10;
  private reconnectInterval = 1000;
  private isConnected = false;
  private performanceMetrics = {
    latency: 0,
    messagesPerSecond: 0,
    lastMessageTime: 0,
    messageCount: 0,
    startTime: Date.now()
  };

  constructor() {
    this.startPerformanceMonitoring();
  }

  private connect(endpoint: string = '/ws') {
    try {
      const url = `${env.NEXT_PUBLIC_API_URL}${endpoint}`;
      console.log('Connecting to SSE endpoint:', url);

      const eventSource = new EventSource(url);
      this.eventSources.set(endpoint, eventSource);

      eventSource.onopen = () => {
        console.log('SSE connected to:', endpoint);
        this.isConnected = true;
        this.reconnectAttempts.set(endpoint, 0);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
          this.updatePerformanceMetrics();
        } catch (error) {
          console.error('Failed to parse SSE message:', error, event.data);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error for:', endpoint, error);
        this.isConnected = false;
        this.scheduleReconnect(endpoint);
      };

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      this.scheduleReconnect(endpoint);
    }
  }

  private handleMessage(data: any) {
    // Handle different message types
    switch (data.type) {
      case 'heartbeat':
        // Update connection status
        this.isConnected = true;
        break;

      case 'market_data':
        this.handleMarketData(data);
        break;

      case 'connection':
        console.log('SSE connection established:', data.connection_id);
        break;

      default:
        console.log('Unknown SSE message type:', data.type);
    }
  }

  private handleMarketData(data: any) {
    const { market, ticker, order_book, trades } = data;

    // Emit ticker updates
    if (ticker) {
      this.emitToSubscribers(`${market}.ticker`, {
        type: 'ticker',
        market,
        ...ticker
      });
      this.emitToSubscribers('ticker', {
        type: 'ticker',
        market,
        ...ticker
      });
    }

    // Emit order book updates
    if (order_book) {
      this.emitToSubscribers(`${market}.orderbook`, {
        type: 'orderbook',
        market,
        ...order_book
      });
      this.emitToSubscribers('orderbook', {
        type: 'orderbook',
        market,
        ...order_book
      });
    }

    // Emit trade updates
    if (trades && trades.length > 0) {
      trades.forEach((trade: any) => {
        this.emitToSubscribers(`${market}.trades`, {
          type: 'trade',
          market,
          ...trade
        });
        this.emitToSubscribers('trades', {
          type: 'trade',
          market,
          ...trade
        });
      });
    }
  }

  private emitToSubscribers(channel: string, data: any) {
    if (this.subscribers.has(channel)) {
      const callbacks = this.subscribers.get(channel);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error(`Error in SSE callback for ${channel}:`, error);
          }
        });
      }
    }
  }

  private scheduleReconnect(endpoint: string) {
    const attempts = this.reconnectAttempts.get(endpoint) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      this.reconnectAttempts.set(endpoint, attempts + 1);
      const delay = Math.min(this.reconnectInterval * Math.pow(2, attempts), 30000);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect SSE (${attempts + 1}/${this.maxReconnectAttempts})`);
        this.connect(endpoint);
      }, delay);
    } else {
      console.error('Max SSE reconnection attempts reached for:', endpoint);
    }
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
        console.log('SSE Performance:', {
          messagesPerSecond: this.performanceMetrics.messagesPerSecond.toFixed(2),
          connected: this.isConnected,
          activeConnections: this.eventSources.size
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

    // Start main connection if not already connected
    if (!this.eventSources.has('/ws')) {
      this.connect('/ws');
    }
  }

  public unsubscribe(channel: string, callback?: (data: any) => void) {
    if (callback && this.subscribers.has(channel)) {
      this.subscribers.get(channel)!.delete(callback);
      
      if (this.subscribers.get(channel)!.size === 0) {
        this.subscribers.delete(channel);
      }
    }
  }

  public subscribeToMarket(market: string, callback: (data: any) => void) {
    const channels = [
      `${market}.ticker`,
      `${market}.orderbook`, 
      `${market}.trades`
    ];

    channels.forEach(channel => {
      this.subscribe(channel, callback);
    });

    // Connect to market-specific SSE endpoint
    const marketEndpoint = `/ws/market/${market.toLowerCase()}`;
    if (!this.eventSources.has(marketEndpoint)) {
      this.connect(marketEndpoint);
    }
  }

  public unsubscribeFromMarket(market: string, callback: (data: any) => void) {
    const channels = [
      `${market}.ticker`,
      `${market}.orderbook`,
      `${market}.trades`
    ];

    channels.forEach(channel => {
      this.unsubscribe(channel, callback);
    });
  }

  public subscribeToUserData(userId: string, callback: (data: any) => void) {
    // User data would require authentication and separate endpoints
    console.log('User data subscription not implemented for SSE');
  }

  public async placeOrder(orderData: any): Promise<any> {
    // Orders would go through REST API, not SSE
    throw new Error('Order placement should use REST API, not SSE');
  }

  public async cancelOrder(orderId: string): Promise<any> {
    // Orders would go through REST API, not SSE
    throw new Error('Order cancellation should use REST API, not SSE');
  }

  public disconnect() {
    this.eventSources.forEach((eventSource, endpoint) => {
      eventSource.close();
    });
    this.eventSources.clear();
    this.subscribers.clear();
    this.isConnected = false;
  }

  public getConnectionState(): boolean {
    return this.isConnected;
  }

  public getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  public getTransportType(): string {
    return 'server-sent-events';
  }
}

// Singleton instance
export const sseClient = new SSETradingClient();
export default sseClient;
