import { useState, useEffect, useRef, useCallback } from 'react';

interface HFTWebSocketData {
  isConnected: boolean;
  marketData: any | null;
  orderBook: any | null;
  trades: any[];
}

/**
 * HFT WebSocket Hook
 * Provides high-frequency trading WebSocket connection for real-time market data
 */
export const useHFTWebSocket = (market?: string): HFTWebSocketData | null => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      // @ts-ignore
      const ws = window.tradingWebSocket;
      if (ws) {
        setIsConnected(ws.getConnectionState());
      } else {
        setIsConnected(false);
      }
    };

    checkConnection();

    const handleStateChange = (event: Event) => {
      const detail = (event as CustomEvent<{ connected?: boolean }>).detail;
      setIsConnected(!!detail?.connected);
    };

    window.addEventListener('trading-ws:state', handleStateChange);

    const interval = setInterval(checkConnection, 5000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('trading-ws:state', handleStateChange);
    };
  }, []);

  return {
    isConnected,
    marketData: null,
    orderBook: null,
    trades: [],
  };
};
