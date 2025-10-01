// Performance optimization utilities for high-frequency trading

// Debounce function for API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function for high-frequency updates
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    // Limit cache size to prevent memory leaks
    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }
    
    return result;
  }) as T;
}

// Virtual scrolling for large lists
export interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function calculateVirtualScroll(
  scrollTop: number,
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  return {
    startIndex,
    endIndex,
    totalHeight: 0, // Will be calculated by the component
    offsetY: startIndex * itemHeight
  };
}

// Price formatting with performance optimization
export const formatPrice = memoize((price: number, precision: number = 2): string => {
  return price.toFixed(precision);
});

// Volume formatting with performance optimization
export const formatVolume = memoize((volume: number, precision: number = 8): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(2)}M`;
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(2)}K`;
  } else {
    return volume.toFixed(precision);
  }
});

// Percentage change formatting
export const formatPercentage = memoize((change: number): string => {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
});

// Order book depth calculation
export const calculateOrderBookDepth = memoize((
  orders: [string, string][],
  maxDepth: number = 10
): [string, string, number][] => {
  let cumulativeVolume = 0;
  
  return orders.slice(0, maxDepth).map(([price, volume]) => {
    cumulativeVolume += parseFloat(volume);
    return [price, volume, cumulativeVolume];
  });
});

// Market data aggregation
export const aggregateMarketData = memoize((
  trades: any[],
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' = '1m'
) => {
  const interval = getTimeframeMs(timeframe);
  const aggregated = new Map<number, any>();
  
  trades.forEach(trade => {
    const timestamp = Math.floor(new Date(trade.created_at).getTime() / interval) * interval;
    
    if (!aggregated.has(timestamp)) {
      aggregated.set(timestamp, {
        timestamp,
        open: parseFloat(trade.price),
        high: parseFloat(trade.price),
        low: parseFloat(trade.price),
        close: parseFloat(trade.price),
        volume: parseFloat(trade.volume),
        count: 1
      });
    } else {
      const candle = aggregated.get(timestamp);
      candle.high = Math.max(candle.high, parseFloat(trade.price));
      candle.low = Math.min(candle.low, parseFloat(trade.price));
      candle.close = parseFloat(trade.price);
      candle.volume += parseFloat(trade.volume);
      candle.count += 1;
    }
  });
  
  return Array.from(aggregated.values()).sort((a, b) => a.timestamp - b.timestamp);
});

// Get timeframe in milliseconds
function getTimeframeMs(timeframe: string): number {
  const timeframes: Record<string, number> = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000
  };
  
  return timeframes[timeframe] || timeframes['1m'] || 60000;
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: Set<(metrics: Map<string, number[]>) => void> = new Set();
  
  startTiming(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
    };
  }
  
  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
    
    this.notifyObservers();
  }
  
  getAverage(label: string): number {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }
  
  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};
    
    this.metrics.forEach((values, label) => {
      result[label] = {
        average: this.getAverage(label),
        count: values.length,
        latest: values[values.length - 1] || 0
      };
    });
    
    return result;
  }
  
  subscribe(callback: (metrics: Map<string, number[]>) => void): () => void {
    this.observers.add(callback);
    
    return () => {
      this.observers.delete(callback);
    };
  }
  
  private notifyObservers(): void {
    this.observers.forEach(callback => {
      try {
        callback(this.metrics);
      } catch (error) {
        console.error('Error in performance observer:', error);
      }
    });
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitor(label: string) {
  const { useEffect, useRef } = require('react');
  const endTimingRef = useRef(null);
  
  useEffect(() => {
    endTimingRef.current = performanceMonitor.startTiming(label);
    
    return () => {
      if (endTimingRef.current) {
        endTimingRef.current();
      }
    };
  }, [label]);
  
  return {
    getAverage: () => performanceMonitor.getAverage(label),
    getMetrics: () => performanceMonitor.getMetrics()[label]
  };
}

// Data compression for WebSocket messages
export function compressData(data: any): string {
  // Simple compression by removing unnecessary whitespace and using shorter property names
  return JSON.stringify(data, null, 0);
}

// Data decompression
export function decompressData(compressed: string): any {
  return JSON.parse(compressed);
}

// Batch processing for multiple API calls
export class BatchProcessor<T> {
  private queue: T[] = [];
  private batchSize: number;
  private batchDelay: number;
  private processor: (items: T[]) => Promise<void>;
  private timeout: NodeJS.Timeout | null = null;
  
  constructor(
    processor: (items: T[]) => Promise<void>,
    batchSize: number = 10,
    batchDelay: number = 100
  ) {
    this.processor = processor;
    this.batchSize = batchSize;
    this.batchDelay = batchDelay;
  }
  
  add(item: T): void {
    this.queue.push(item);
    
    if (this.queue.length >= this.batchSize) {
      this.processBatch();
    } else if (!this.timeout) {
      this.timeout = setTimeout(() => {
        this.processBatch();
      }, this.batchDelay);
    }
  }
  
  private async processBatch(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    
    if (this.queue.length === 0) return;
    
    const batch = this.queue.splice(0, this.batchSize);
    
    try {
      await this.processor(batch);
    } catch (error) {
      console.error('Batch processing error:', error);
      // Re-queue failed items
      this.queue.unshift(...batch);
    }
  }
  
  flush(): Promise<void> {
    return new Promise((resolve) => {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      
      if (this.queue.length === 0) {
        resolve();
        return;
      }
      
      const batch = this.queue.splice(0);
      this.processor(batch).then(resolve).catch(resolve);
    });
  }
}

// Memory management for large datasets
export class DataManager<T> {
  private data: T[] = [];
  private maxSize: number;
  private keyExtractor: (item: T) => string;
  
  constructor(maxSize: number = 10000, keyExtractor: (item: T) => string) {
    this.maxSize = maxSize;
    this.keyExtractor = keyExtractor;
  }
  
  add(item: T): void {
    const key = this.keyExtractor(item);
    const existingIndex = this.data.findIndex(d => this.keyExtractor(d) === key);
    
    if (existingIndex >= 0) {
      this.data[existingIndex] = item;
    } else {
      this.data.push(item);
      
      if (this.data.length > this.maxSize) {
        this.data.shift(); // Remove oldest item
      }
    }
  }
  
  get(key: string): T | undefined {
    return this.data.find(item => this.keyExtractor(item) === key);
  }
  
  getAll(): T[] {
    return [...this.data];
  }
  
  clear(): void {
    this.data = [];
  }
  
  size(): number {
    return this.data.length;
  }
}

export default {
  debounce,
  throttle,
  memoize,
  formatPrice,
  formatVolume,
  formatPercentage,
  calculateOrderBookDepth,
  aggregateMarketData,
  performanceMonitor,
  usePerformanceMonitor,
  compressData,
  decompressData,
  BatchProcessor,
  DataManager
};
