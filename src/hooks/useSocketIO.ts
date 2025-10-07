import { useEffect, useRef, useState, useCallback } from 'react';
import { socketIOClient } from '../lib/websocket/socketio-client';

// High-performance React hook for Socket.IO subscriptions
export const useSocketIOSubscription = (
  channel: string, 
  callback: (data: any) => void, 
  deps: any[] = []
) => {
  const callbackRef = useRef(callback);
  const [isConnected, setIsConnected] = useState(false);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const stableCallback = (data: any) => callbackRef.current(data);
    
    // Subscribe to channel
    socketIOClient.subscribe(channel, stableCallback);
    
    // Update connection status
    const updateConnectionStatus = () => {
      setIsConnected(socketIOClient.getConnectionState());
    };
    
    updateConnectionStatus();
    const connectionInterval = setInterval(updateConnectionStatus, 1000);
    
    return () => {
      socketIOClient.unsubscribe(channel, stableCallback);
      clearInterval(connectionInterval);
    };
  }, [channel, ...deps]);

  return { isConnected };
};

// Hook for market data with optimized state management
export const useSocketIOMarketData = (market: string) => {
  const [ticker, setTicker] = useState<any>(null);
  const [orderbook, setOrderbook] = useState<any>({ asks: [], bids: [], spread: 0 });
  const [trades, setTrades] = useState<any[]>([]);
  const [kline, setKline] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  // Use refs to prevent unnecessary re-renders
  const tickerRef = useRef(ticker);
  const orderbookRef = useRef(orderbook);
  const tradesRef = useRef(trades);

  useEffect(() => {
    const handleMarketData = (data: any) => {
      const now = Date.now();
      setLastUpdate(now);

      switch (data.type) {
        case 'ticker':
          if (JSON.stringify(data) !== JSON.stringify(tickerRef.current)) {
            tickerRef.current = data;
            setTicker(data);
          }
          break;
        
        case 'orderbook':
          if (JSON.stringify(data) !== JSON.stringify(orderbookRef.current)) {
            orderbookRef.current = data;
            setOrderbook(data);
          }
          break;
        
        case 'trade':
          setTrades(prev => {
            const newTrades = [data, ...prev.slice(0, 99)]; // Keep last 100 trades
            tradesRef.current = newTrades;
            return newTrades;
          });
          break;
        
        case 'kline':
          setKline(data);
          break;
      }
    };

    // Subscribe to market data
    socketIOClient.subscribeToMarket(market, handleMarketData);

    // Monitor connection status
    const connectionInterval = setInterval(() => {
      setIsConnected(socketIOClient.getConnectionState());
    }, 1000);

    return () => {
      socketIOClient.unsubscribeFromMarket(market, handleMarketData);
      clearInterval(connectionInterval);
    };
  }, [market]);

  return {
    ticker,
    orderbook,
    trades,
    kline,
    isConnected,
    lastUpdate,
    performanceMetrics: socketIOClient.getPerformanceMetrics()
  };
};

// Hook for user-specific data
export const useSocketIOUserData = (userId: string | null) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [balances, setBalances] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const handleUserData = (data: any) => {
      switch (data.type) {
        case 'order_update':
          setOrders(prev => {
            const existing = prev.find(o => o.id === data.id);
            if (existing) {
              return prev.map(o => o.id === data.id ? { ...o, ...data } : o);
            } else {
              return [data, ...prev];
            }
          });
          break;

        case 'trade_update':
          setTrades(prev => [data, ...prev.slice(0, 99)]);
          break;

        case 'balance_update':
          setBalances(prev => ({
            ...prev,
            [data.currency]: data
          }));
          break;
      }
    };

    socketIOClient.subscribeToUserData(userId, handleUserData);

    const connectionInterval = setInterval(() => {
      setIsConnected(socketIOClient.getConnectionState());
    }, 1000);

    return () => {
      clearInterval(connectionInterval);
    };
  }, [userId]);

  return {
    orders,
    trades,
    balances,
    isConnected
  };
};

// Hook for high-frequency trading operations
export const useSocketIOTrading = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [latency, setLatency] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsConnected(socketIOClient.getConnectionState());
      const metrics = socketIOClient.getPerformanceMetrics();
      setLatency(metrics.latency);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const placeOrder = useCallback(async (orderData: any) => {
    if (!isConnected) {
      throw new Error('Not connected to trading server');
    }
    
    const startTime = Date.now();
    try {
      const result = await socketIOClient.placeOrder(orderData);
      const executionTime = Date.now() - startTime;
      
      console.log(`Order placed in ${executionTime}ms`);
      return result;
    } catch (error) {
      console.error('Order placement failed:', error);
      throw error;
    }
  }, [isConnected]);

  const cancelOrder = useCallback(async (orderId: string) => {
    if (!isConnected) {
      throw new Error('Not connected to trading server');
    }

    const startTime = Date.now();
    try {
      const result = await socketIOClient.cancelOrder(orderId);
      const executionTime = Date.now() - startTime;
      
      console.log(`Order cancelled in ${executionTime}ms`);
      return result;
    } catch (error) {
      console.error('Order cancellation failed:', error);
      throw error;
    }
  }, [isConnected]);

  return {
    isConnected,
    latency,
    placeOrder,
    cancelOrder,
    transportType: socketIOClient.getTransportType(),
    performanceMetrics: socketIOClient.getPerformanceMetrics()
  };
};

// Hook for connection monitoring and diagnostics
export const useSocketIODiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState({
    isConnected: false,
    latency: 0,
    messagesPerSecond: 0,
    transportType: 'unknown',
    reconnectAttempts: 0,
    lastMessageTime: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = socketIOClient.getPerformanceMetrics();
      setDiagnostics({
        isConnected: socketIOClient.getConnectionState(),
        latency: metrics.latency,
        messagesPerSecond: metrics.messagesPerSecond,
        transportType: socketIOClient.getTransportType(),
        reconnectAttempts: 0, // TODO: Add this to client
        lastMessageTime: metrics.lastMessageTime
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return diagnostics;
};

// Hook for system-wide events and notifications
export const useSocketIOSystem = () => {
  const [systemMessages, setSystemMessages] = useState<any[]>([]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [marketStatus, setMarketStatus] = useState<Record<string, string>>({});

  useSocketIOSubscription('system', (data: any) => {
    switch (data.type) {
      case 'maintenance':
        setMaintenanceMode(data.enabled);
        break;
      
      case 'market_status':
        setMarketStatus(prev => ({
          ...prev,
          [data.market]: data.status
        }));
        break;
      
      case 'notification':
        setSystemMessages(prev => [data, ...prev.slice(0, 49)]); // Keep last 50 messages
        break;
    }
  });

  return {
    systemMessages,
    maintenanceMode,
    marketStatus
  };
};
