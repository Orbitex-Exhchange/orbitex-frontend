import { socketIOClient } from '../lib/websocket/socketio-client';

// High-Frequency Trading Service for ultra-low latency operations
export class HighFrequencyTradingService {
  private orderQueue: any[] = [];
  private isProcessingQueue = false;
  private batchSize = 10;
  private batchTimeout = 50; // 50ms batch window
  private performanceMetrics = {
    ordersPerSecond: 0,
    averageLatency: 0,
    successRate: 0,
    totalOrders: 0,
    successfulOrders: 0,
    failedOrders: 0,
    lastResetTime: Date.now()
  };

  constructor() {
    this.startBatchProcessor();
    this.startMetricsReset();
  }

  // Ultra-fast order placement with batching
  public async placeOrderFast(orderData: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const order = {
        ...orderData,
        timestamp: Date.now(),
        resolve,
        reject,
        id: this.generateOrderId()
      };

      this.orderQueue.push(order);
      
      // Process immediately if queue is getting full
      if (this.orderQueue.length >= this.batchSize && !this.isProcessingQueue) {
        this.processBatch();
      }
    });
  }

  // Batch order processing for optimal throughput
  private async processBatch() {
    if (this.isProcessingQueue || this.orderQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    const batch = this.orderQueue.splice(0, this.batchSize);
    const startTime = Date.now();

    try {
      // Process orders in parallel for maximum speed
      const promises = batch.map(order => this.executeSingleOrder(order));
      await Promise.allSettled(promises);
      
      const processingTime = Date.now() - startTime;
      this.updatePerformanceMetrics(batch.length, processingTime);
      
    } catch (error) {
      console.error('Batch processing error:', error);
    } finally {
      this.isProcessingQueue = false;
      
      // Continue processing if more orders are queued
      if (this.orderQueue.length > 0) {
        setTimeout(() => this.processBatch(), 1);
      }
    }
  }

  private async executeSingleOrder(order: any): Promise<void> {
    const startTime = Date.now();
    
    try {
      const result = await socketIOClient.placeOrder({
        market: order.market,
        side: order.side,
        type: order.type,
        volume: order.volume,
        price: order.price,
        timestamp: order.timestamp
      });
      
      const latency = Date.now() - startTime;
      this.performanceMetrics.totalOrders++;
      this.performanceMetrics.successfulOrders++;
      
      order.resolve({
        ...result,
        latency,
        orderId: order.id
      });
      
    } catch (error) {
      this.performanceMetrics.totalOrders++;
      this.performanceMetrics.failedOrders++;
      order.reject(error);
    }
  }

  // Start the batch processor with timing optimization
  private startBatchProcessor() {
    setInterval(() => {
      if (this.orderQueue.length > 0 && !this.isProcessingQueue) {
        this.processBatch();
      }
    }, this.batchTimeout);
  }

  // Performance monitoring and optimization
  private updatePerformanceMetrics(batchSize: number, processingTime: number) {
    const now = Date.now();
    const timeSinceReset = now - this.performanceMetrics.lastResetTime;

    if (timeSinceReset > 0) {
      this.performanceMetrics.ordersPerSecond = 
        (this.performanceMetrics.totalOrders / timeSinceReset) * 1000;
    }

    this.performanceMetrics.averageLatency = processingTime / batchSize;
    
    if (this.performanceMetrics.totalOrders > 0) {
      this.performanceMetrics.successRate = 
        (this.performanceMetrics.successfulOrders / this.performanceMetrics.totalOrders) * 100;
    }
  }

  private startMetricsReset() {
    // Reset metrics every minute for accurate measurements
    setInterval(() => {
      this.performanceMetrics = {
        ordersPerSecond: 0,
        averageLatency: 0,
        successRate: 0,
        totalOrders: 0,
        successfulOrders: 0,
        failedOrders: 0,
        lastResetTime: Date.now()
      };
    }, 60000);
  }

  private generateOrderId(): string {
    return `hft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public API for performance metrics
  public getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  // Cleanup
  public destroy() {
    this.orderQueue.length = 0;
  }
}

// Singleton instance
export const hftService = new HighFrequencyTradingService();
export default hftService;
