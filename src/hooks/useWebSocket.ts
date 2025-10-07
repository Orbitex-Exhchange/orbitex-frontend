import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketMessage, RangerEvent } from '@/types';
import { env } from '@/lib/env';

interface UseWebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  enableLogging?: boolean;
}

interface UseWebSocketReturn {
  connected: boolean;
  connecting: boolean;
  send: (message: any) => void;
  subscribe: (channel: string, params?: any) => void;
  unsubscribe: (channel: string) => void;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const {
    url,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    heartbeatInterval = 30000,
    enableLogging = process.env.NODE_ENV === 'development',
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const subscriptionsRef = useRef<Set<string>>(new Set());

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const log = useCallback((message: string, data?: any) => {
    if (enableLogging) {
      console.log(`[useWebSocket] ${message}`, data);
    }
  }, [enableLogging]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      wsRef.current = new WebSocket(url);
      
      wsRef.current.onopen = () => {
        log('Connected to WebSocket');
        setConnected(true);
        setConnecting(false);
        reconnectAttemptsRef.current = 0;
        
        // Resubscribe to channels
        subscriptionsRef.current.forEach(channel => {
          send({ event: 'subscribe', channel });
        });

        // Start heartbeat
        startHeartbeat();
      };

      wsRef.current.onclose = (event) => {
        log('WebSocket disconnected', { code: event.code, reason: event.reason });
        setConnected(false);
        setConnecting(false);
        stopHeartbeat();

        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

      wsRef.current.onerror = (event) => {
        log('WebSocket error', { event });
        setError(new Error('WebSocket connection error'));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          log('Message received', { message });
        } catch (error) {
          log('Failed to parse message', { error, data: event.data });
        }
      };

    } catch (error) {
      log('Failed to create WebSocket', { error });
      setError(error as Error);
      setConnecting(false);
    }
  }, [url, log, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    log('Disconnecting WebSocket');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    stopHeartbeat();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }
    
    setConnected(false);
    setConnecting(false);
    reconnectAttemptsRef.current = 0;
  }, [log]);

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        log('Message sent', { message });
      } catch (error) {
        log('Failed to send message', { error, message });
        setError(error as Error);
      }
    } else {
      log('WebSocket not connected, message queued', { message });
    }
  }, [log]);

  const subscribe = useCallback((channel: string, params?: any) => {
    const message = { event: 'subscribe', channel, ...params };
    send(message);
    subscriptionsRef.current.add(channel);
  }, [send]);

  const unsubscribe = useCallback((channel: string) => {
    const message = { event: 'unsubscribe', channel };
    send(message);
    subscriptionsRef.current.delete(channel);
  }, [send]);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectAttemptsRef.current++;
    const delay = reconnectInterval * Math.pow(2, reconnectAttemptsRef.current - 1);
    
    log('Scheduling reconnection', { 
      attempt: reconnectAttemptsRef.current, 
      delay 
    });

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect, reconnectInterval, log]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
    }

    heartbeatTimeoutRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        send({ event: 'ping' });
      }
    }, heartbeatInterval);
  }, [send, heartbeatInterval]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    connected,
    connecting,
    send,
    subscribe,
    unsubscribe,
    lastMessage,
    error,
  };
}

// ===== TRADING-SPECIFIC WEBSOCKET HOOK =====

export function useTradingWebSocket() {
  const ws = useWebSocket({
    url: env.NEXT_PUBLIC_WS_URL,
    reconnectInterval: 1000,
    maxReconnectAttempts: 20,
    heartbeatInterval: 15000,
  });

  const subscribeToTicker = useCallback((market: string) => {
    ws.subscribe('ticker', { market });
  }, [ws]);

  const subscribeToOrderBook = useCallback((market: string) => {
    ws.subscribe('orderbook', { market });
  }, [ws]);

  const subscribeToTrades = useCallback((market: string) => {
    ws.subscribe('trades', { market });
  }, [ws]);

  const subscribeToOrders = useCallback(() => {
    ws.subscribe('orders');
  }, [ws]);

  const subscribeToWallets = useCallback(() => {
    ws.subscribe('wallets');
  }, [ws]);

  const sendOrder = useCallback((orderData: any) => {
    ws.send({ event: 'order', data: orderData });
  }, [ws]);

  const cancelOrder = useCallback((orderId: number) => {
    ws.send({ event: 'cancel_order', data: { order_id: orderId } });
  }, [ws]);

  return {
    ...ws,
    subscribeToTicker,
    subscribeToOrderBook,
    subscribeToTrades,
    subscribeToOrders,
    subscribeToWallets,
    sendOrder,
    cancelOrder,
  };
}
