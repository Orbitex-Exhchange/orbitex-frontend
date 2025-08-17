// ===== HIGH-PERFORMANCE EVENT EMITTER =====

type EventCallback = (...args: any[]) => void;
type EventMap = Record<string, EventCallback[]>;

class EventEmitter {
  private events: EventMap = {};
  private maxListeners: number = 10;
  private performanceMode: boolean = true;

  constructor(options?: { maxListeners?: number; performanceMode?: boolean }) {
    this.maxListeners = options?.maxListeners || 10;
    this.performanceMode = options?.performanceMode ?? true;
  }

  // ===== CORE METHODS =====

  on(event: string, callback: EventCallback): this {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    if (this.events[event].length >= this.maxListeners) {
      console.warn(`EventEmitter: Max listeners (${this.maxListeners}) exceeded for event '${event}'`);
    }

    this.events[event].push(callback);
    return this;
  }

  off(event: string, callback: EventCallback): this {
    if (!this.events[event]) return this;

    const index = this.events[event].indexOf(callback);
    if (index > -1) {
      this.events[event].splice(index, 1);
    }

    if (this.events[event].length === 0) {
      delete this.events[event];
    }

    return this;
  }

  once(event: string, callback: EventCallback): this {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(event, onceCallback);
    };

    return this.on(event, onceCallback);
  }

  emit(event: string, ...args: any[]): boolean {
    if (!this.events[event]) return false;

    const callbacks = [...this.events[event]]; // Clone to avoid mutation during execution

    if (this.performanceMode) {
      // Use requestAnimationFrame for better performance
      requestAnimationFrame(() => {
        callbacks.forEach(callback => {
          try {
            callback(...args);
          } catch (error) {
            console.error(`EventEmitter: Error in event '${event}' callback:`, error);
          }
        });
      });
    } else {
      // Synchronous execution
      callbacks.forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`EventEmitter: Error in event '${event}' callback:`, error);
        }
      });
    }

    return true;
  }

  // ===== PERFORMANCE METHODS =====

  emitBatch(events: Array<{ event: string; args: any[] }>): void {
    if (this.performanceMode) {
      requestAnimationFrame(() => {
        events.forEach(({ event, args }) => {
          this.emit(event, ...args);
        });
      });
    } else {
      events.forEach(({ event, args }) => {
        this.emit(event, ...args);
      });
    }
  }

  emitDebounced(event: string, delay: number = 16): this {
    if (this.debounceTimers.has(event)) {
      clearTimeout(this.debounceTimers.get(event)!);
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(event);
      this.emit(event);
    }, delay);

    this.debounceTimers.set(event, timer);
    return this;
  }

  emitThrottled(event: string, limit: number = 16): this {
    const now = Date.now();
    const lastEmit = this.throttleTimers.get(event) || 0;

    if (now - lastEmit >= limit) {
      this.throttleTimers.set(event, now);
      this.emit(event);
    }

    return this;
  }

  // ===== UTILITY METHODS =====

  removeAllListeners(event?: string): this {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }

  listenerCount(event: string): number {
    return this.events[event]?.length || 0;
  }

  eventNames(): string[] {
    return Object.keys(this.events);
  }

  listeners(event: string): EventCallback[] {
    return [...(this.events[event] || [])];
  }

  // ===== PRIVATE PROPERTIES =====

  private debounceTimers = new Map<string, NodeJS.Timeout>();
  private throttleTimers = new Map<string, number>();

  // ===== PERFORMANCE OPTIMIZATIONS =====

  setPerformanceMode(enabled: boolean): this {
    this.performanceMode = enabled;
    return this;
  }

  setMaxListeners(max: number): this {
    this.maxListeners = max;
    return this;
  }

  // ===== MEMORY MANAGEMENT =====

  clear(): void {
    this.events = {};
    this.debounceTimers.clear();
    this.throttleTimers.clear();
  }

  // ===== DEBUGGING =====

  debug(enabled: boolean = true): this {
    if (enabled) {
      console.log('EventEmitter Debug:', {
        events: this.eventNames(),
        listenerCounts: Object.fromEntries(
          this.eventNames().map(event => [event, this.listenerCount(event)])
        ),
      });
    }
    return this;
  }
}

// ===== TRADING-SPECIFIC EVENT EMITTER =====

class TradingEventEmitter extends EventEmitter {
  // ===== TRADING EVENTS =====

  // Market data events
  emitTickerUpdate(market: string, ticker: any): void {
    this.emit('ticker:update', { market, ticker, timestamp: Date.now() });
  }

  emitOrderBookUpdate(market: string, orderBook: any): void {
    this.emit('orderbook:update', { market, orderBook, timestamp: Date.now() });
  }

  emitTradeUpdate(market: string, trade: any): void {
    this.emit('trade:update', { market, trade, timestamp: Date.now() });
  }

  // Order events
  emitOrderCreated(order: any): void {
    this.emit('order:created', { order, timestamp: Date.now() });
  }

  emitOrderUpdated(order: any): void {
    this.emit('order:updated', { order, timestamp: Date.now() });
  }

  emitOrderCancelled(orderId: number): void {
    this.emit('order:cancelled', { orderId, timestamp: Date.now() });
  }

  emitOrderFilled(order: any): void {
    this.emit('order:filled', { order, timestamp: Date.now() });
  }

  // Wallet events
  emitBalanceUpdate(currency: string, balance: any): void {
    this.emit('balance:update', { currency, balance, timestamp: Date.now() });
  }

  // Connection events
  emitConnected(): void {
    this.emit('connection:connected', { timestamp: Date.now() });
  }

  emitDisconnected(): void {
    this.emit('connection:disconnected', { timestamp: Date.now() });
  }

  emitReconnecting(): void {
    this.emit('connection:reconnecting', { timestamp: Date.now() });
  }

  // Error events
  emitError(error: Error, context?: string): void {
    this.emit('error', { error, context, timestamp: Date.now() });
  }

  // ===== BATCH EVENTS =====

  emitMarketDataBatch(updates: Array<{
    type: 'ticker' | 'orderbook' | 'trade';
    market: string;
    data: any;
  }>): void {
    this.emitBatch(
      updates.map(({ type, market, data }) => ({
        event: `${type}:update`,
        args: [{ market, [type]: data, timestamp: Date.now() }],
      }))
    );
  }

  // ===== SUBSCRIPTION EVENTS =====

  emitSubscriptionAdded(channel: string): void {
    this.emit('subscription:added', { channel, timestamp: Date.now() });
  }

  emitSubscriptionRemoved(channel: string): void {
    this.emit('subscription:removed', { channel, timestamp: Date.now() });
  }

  // ===== PERFORMANCE EVENTS =====

  emitPerformanceMetrics(metrics: {
    latency: number;
    updateCount: number;
    memoryUsage?: number;
  }): void {
    this.emit('performance:metrics', { ...metrics, timestamp: Date.now() });
  }

  // ===== CUSTOM HOOKS =====

  onTickerUpdate(callback: (data: { market: string; ticker: any; timestamp: number }) => void): this {
    return this.on('ticker:update', callback);
  }

  onOrderBookUpdate(callback: (data: { market: string; orderBook: any; timestamp: number }) => void): this {
    return this.on('orderbook:update', callback);
  }

  onTradeUpdate(callback: (data: { market: string; trade: any; timestamp: number }) => void): this {
    return this.on('trade:update', callback);
  }

  onOrderCreated(callback: (data: { order: any; timestamp: number }) => void): this {
    return this.on('order:created', callback);
  }

  onOrderUpdated(callback: (data: { order: any; timestamp: number }) => void): this {
    return this.on('order:updated', callback);
  }

  onOrderCancelled(callback: (data: { orderId: number; timestamp: number }) => void): this {
    return this.on('order:cancelled', callback);
  }

  onOrderFilled(callback: (data: { order: any; timestamp: number }) => void): this {
    return this.on('order:filled', callback);
  }

  onBalanceUpdate(callback: (data: { currency: string; balance: any; timestamp: number }) => void): this {
    return this.on('balance:update', callback);
  }

  onConnected(callback: (data: { timestamp: number }) => void): this {
    return this.on('connection:connected', callback);
  }

  onDisconnected(callback: (data: { timestamp: number }) => void): this {
    return this.on('connection:disconnected', callback);
  }

  onError(callback: (data: { error: Error; context?: string; timestamp: number }) => void): this {
    return this.on('error', callback);
  }
}

// ===== GLOBAL INSTANCE =====

export const tradingEvents = new TradingEventEmitter({
  maxListeners: 50,
  performanceMode: true,
});

// ===== REACT HOOKS =====

import { useEffect, useRef } from 'react';

export const useTradingEvents = (
  event: string,
  callback: (...args: any[]) => void,
  deps: any[] = []
) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handler = (...args: any[]) => callbackRef.current(...args);
    tradingEvents.on(event, handler);

    return () => {
      tradingEvents.off(event, handler);
    };
  }, [event, ...deps]);
};

export const useTickerUpdates = (
  callback: (data: { market: string; ticker: any; timestamp: number }) => void,
  deps: any[] = []
) => {
  useTradingEvents('ticker:update', callback, deps);
};

export const useOrderBookUpdates = (
  callback: (data: { market: string; orderBook: any; timestamp: number }) => void,
  deps: any[] = []
) => {
  useTradingEvents('orderbook:update', callback, deps);
};

export const useTradeUpdates = (
  callback: (data: { market: string; trade: any; timestamp: number }) => void,
  deps: any[] = []
) => {
  useTradingEvents('trade:update', callback, deps);
};

export const useOrderUpdates = (
  callback: (data: { order: any; timestamp: number }) => void,
  deps: any[] = []
) => {
  useTradingEvents('order:updated', callback, deps);
};

export const useConnectionStatus = (
  callback: (data: { timestamp: number }) => void,
  deps: any[] = []
) => {
  useTradingEvents('connection:connected', callback, deps);
  useTradingEvents('connection:disconnected', callback, deps);
};

// ===== EXPORTS =====

export { EventEmitter, TradingEventEmitter };
export default tradingEvents;
