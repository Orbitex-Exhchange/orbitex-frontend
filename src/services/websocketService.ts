import { io, Socket } from 'socket.io-client';
import { useTradingStore } from '@/store/tradingStore';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private subscriptions = new Set<string>();

  constructor() {
    // Only attempt to connect if we have a WebSocket URL configured
    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (wsUrl) {
      this.connect();
    } else {
      console.log('WebSocket URL not configured, running in mock mode');
    }
  }

  private connect() {
    if (this.isConnecting || this.socket?.connected) return;

    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
    if (!wsUrl) {
      console.log('WebSocket URL not configured, skipping connection');
      return;
    }

    this.isConnecting = true;
    console.log('Attempting to connect to WebSocket:', wsUrl);

    try {
      this.socket = io(wsUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.isConnecting = false;
      this.handleReconnect();
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      useTradingStore.getState().setConnectionStatus(true);
      
      // Resubscribe to all previous subscriptions
      this.subscriptions.forEach(symbol => {
        this.subscribeToMarket(symbol);
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      useTradingStore.getState().setConnectionStatus(false);
      this.isConnecting = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      useTradingStore.getState().setConnectionStatus(false);
      this.handleReconnect();
    });

    // Market data events
    this.socket.on('market_data', (data: any) => {
      useTradingStore.getState().updateMarketData(data.symbol, {
        price: data.price,
        change24h: data.change24h,
        volume: data.volume,
        high24h: data.high24h,
        low24h: data.low24h,
      });
    });

    this.socket.on('order_book', (data: any) => {
      useTradingStore.getState().updateOrderBook(data.symbol, {
        asks: data.asks,
        bids: data.bids,
        spread: data.spread,
        spreadPercentage: data.spreadPercentage,
        lastUpdate: new Date(),
      });
    });

    this.socket.on('trade', (data: any) => {
      useTradingStore.getState().addTrade(data.symbol, {
        id: data.id,
        price: data.price,
        size: data.size,
        side: data.side,
        timestamp: new Date(data.timestamp),
      });
    });

    this.socket.on('chart_data', (data: any) => {
      useTradingStore.getState().updateChartData(data.symbol, data.candles);
    });

    // Performance metrics
    this.socket.on('performance', (data: any) => {
      useTradingStore.getState().updatePerformance({
        fps: data.fps,
        latency: data.latency,
        orderCount: data.orderCount,
      });
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, delay);
  }

  public subscribeToMarket(symbol: string) {
    if (!this.socket?.connected) {
      this.subscriptions.add(symbol);
      return;
    }

    this.socket.emit('subscribe', { symbol });
    this.subscriptions.add(symbol);
  }

  public unsubscribeFromMarket(symbol: string) {
    if (!this.socket?.connected) {
      this.subscriptions.delete(symbol);
      return;
    }

    this.socket.emit('unsubscribe', { symbol });
    this.subscriptions.delete(symbol);
  }

  public subscribeToOrderBook(symbol: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('subscribe_orderbook', { symbol });
  }

  public subscribeToTrades(symbol: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('subscribe_trades', { symbol });
  }

  public subscribeToChartData(symbol: string, timeframe: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('subscribe_chart', { symbol, timeframe });
  }

  public sendOrder(order: any) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('place_order', order);
  }

  public cancelOrder(orderId: string) {
    if (!this.socket?.connected) {
      throw new Error('WebSocket not connected');
    }
    this.socket.emit('cancel_order', { orderId });
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.subscriptions.clear();
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();

// React hook for WebSocket service
export const useWebSocket = () => {
  return websocketService;
};
