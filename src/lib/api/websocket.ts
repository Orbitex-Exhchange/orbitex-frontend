import { env } from '../env';

const normalizeMarketChannel = (market: string) => market.replace(/[-_/]/g, '').toLowerCase();

// WebSocket connection for real-time trading data
class TradingWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private isConnected = false;

  constructor() {
    if (typeof window !== 'undefined') {
      (window as any).tradingWebSocket = this;
    }

    // Enable auto-connect
    this.connect();
  }

  private emitConnectionState() {
    if (typeof window === 'undefined') return;

    window.dispatchEvent(new CustomEvent('trading-ws:state', {
      detail: { connected: this.isConnected }
    }));
  }

  private connect() {
    try {
      // Use client-side env variable safely
      if (typeof window === 'undefined') return;

      const wsUrl = env.NEXT_PUBLIC_WS_URL;
      if (!wsUrl) return;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.subscribeToDefaultChannels();
        this.emitConnectionState();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.stopHeartbeat();
        this.emitConnectionState();
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
        this.emitConnectionState();
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnected = false;
      this.emitConnectionState();
      this.scheduleReconnect();
    }
  }

  private handleMessage(data: any) {
    const { channel, payload } = data;

    if (channel && this.subscribers.has(channel)) {
      const callbacks = this.subscribers.get(channel);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(payload);
          } catch (error) {
            console.error('Error in WebSocket callback:', error);
          }
        });
      }
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send ping every 30 seconds
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
      const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

      setTimeout(() => {
        console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, delay);
    } else {
      console.error('Max WebSocket reconnection attempts reached');
    }
  }

  private subscribeToDefaultChannels() {
    // Subscribe to global market data
    this.subscribe('global.tickers');
    this.subscribe('global.orderbook');
    this.subscribe('global.trades');
  }

  public subscribe(channel: string, callback?: (data: any) => void) {
    if (callback) {
      if (!this.subscribers.has(channel)) {
        this.subscribers.set(channel, new Set());
      }
      this.subscribers.get(channel)!.add(callback);
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'subscribe',
        channel: channel
      }));
    }
  }

  public unsubscribe(channel: string, callback?: (data: any) => void) {
    if (callback && this.subscribers.has(channel)) {
      this.subscribers.get(channel)!.delete(callback);

      if (this.subscribers.get(channel)!.size === 0) {
        this.subscribers.delete(channel);

        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({
            type: 'unsubscribe',
            channel: channel
          }));
        }
      }
    }
  }

  public subscribeToMarket(market: string, callback: (data: any) => void) {
    const normalizedMarket = normalizeMarketChannel(market);
    const channels = [
      `${normalizedMarket}.ticker`,
      `${normalizedMarket}.orderbook`,
      `${normalizedMarket}.trades`
    ];

    channels.forEach(channel => {
      this.subscribe(channel, callback);
    });
  }

  public unsubscribeFromMarket(market: string, callback: (data: any) => void) {
    const normalizedMarket = normalizeMarketChannel(market);
    const channels = [
      `${normalizedMarket}.ticker`,
      `${normalizedMarket}.orderbook`,
      `${normalizedMarket}.trades`
    ];

    channels.forEach(channel => {
      this.unsubscribe(channel, callback);
    });
  }

  public subscribeToUserOrders(userId: string, callback: (data: any) => void) {
    this.subscribe(`user.${userId}.orders`, callback);
  }

  public subscribeToUserTrades(userId: string, callback: (data: any) => void) {
    this.subscribe(`user.${userId}.trades`, callback);
  }

  public subscribeToUserBalances(userId: string, callback: (data: any) => void) {
    this.subscribe(`user.${userId}.balances`, callback);
  }

  public disconnect() {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
    this.isConnected = false;
    this.emitConnectionState();
  }

  public getConnectionState(): boolean {
    return this.isConnected;
  }
}

// Singleton instance - disabled to prevent conflicts with HFT WebSocket service
// Singleton instance
export const tradingWebSocket = new TradingWebSocket();

// React hook for WebSocket subscriptions
export const useWebSocketSubscription = (channel: string, callback: (data: any) => void, deps: any[] = []) => {
  const { useEffect, useRef } = require('react');
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Skip if tradingWebSocket is disabled (null)
    if (!tradingWebSocket) {
      console.log('useWebSocketSubscription: tradingWebSocket is null, skipping subscription');
      return;
    }

    const stableCallback = (data: any) => callbackRef.current(data);
    const ws = tradingWebSocket as TradingWebSocket;

    ws.subscribe(channel, stableCallback);

    return () => {
      ws.unsubscribe(channel, stableCallback);
    };
  }, [channel, ...deps]);
};

// React hook for market data
export const useMarketWebSocket = (market: string) => {
  const { useState, useEffect, useRef } = require('react');
  const [ticker, setTicker] = useState(null);
  const [orderbook, setOrderbook] = useState(null);
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    // Skip if tradingWebSocket is disabled (null)
    if (!tradingWebSocket) {
      console.log('useMarketWebSocket: tradingWebSocket is null, skipping subscription');
      return;
    }

    const handleMarketData = (data: any) => {
      if (data.type === 'ticker') {
        setTicker(data);
      } else if (data.type === 'orderbook') {
        setOrderbook(data);
      } else if (data.type === 'trade') {
        setTrades((prev: any[]) => [data, ...prev.slice(0, 99)]); // Keep last 100 trades
      }
    };

    const ws = tradingWebSocket as TradingWebSocket;
    ws.subscribeToMarket(market, handleMarketData);

    return () => {
      ws.unsubscribeFromMarket(market, handleMarketData);
    };
  }, [market]);

  return { ticker, orderbook, trades };
};

// React hook for user data
export const useUserWebSocket = (userId: string) => {
  const { useState, useEffect } = require('react');
  const [orders, setOrders] = useState([]);
  const [trades, setTrades] = useState([]);
  const [balances, setBalances] = useState({});

  useEffect(() => {
    // Skip if tradingWebSocket is disabled (null)
    if (!tradingWebSocket) {
      console.log('useUserWebSocket: tradingWebSocket is null, skipping subscription');
      return;
    }

    const handleUserData = (data: any) => {
      if (data.type === 'order') {
        setOrders((prev: any[]) => {
          const existing = prev.find(o => o.id === data.id);
          if (existing) {
            return prev.map(o => o.id === data.id ? data : o);
          } else {
            return [data, ...prev];
          }
        });
      } else if (data.type === 'trade') {
        setTrades((prev: any[]) => [data, ...prev.slice(0, 99)]);
      } else if (data.type === 'balance') {
        setBalances((prev: any) => ({ ...prev, [data.currency]: data }));
      }
    };

    const ws = tradingWebSocket as TradingWebSocket;
    ws.subscribeToUserOrders(userId, handleUserData);
    ws.subscribeToUserTrades(userId, handleUserData);
    ws.subscribeToUserBalances(userId, handleUserData);

    return () => {
      ws.unsubscribe(`user.${userId}.orders`, handleUserData);
      ws.unsubscribe(`user.${userId}.trades`, handleUserData);
      ws.unsubscribe(`user.${userId}.balances`, handleUserData);
    };
  }, [userId]);

  return { orders, trades, balances };
};

export default tradingWebSocket;
