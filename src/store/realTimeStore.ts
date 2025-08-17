import { proxy, subscribe } from 'valtio';
import { Market, Ticker, OrderBook, Trade, Order } from '@/types';

// ===== REAL-TIME DATA STORE =====

interface RealTimeState {
  // Market Data
  tickers: Record<string, Ticker>;
  orderBooks: Record<string, OrderBook>;
  trades: Record<string, Trade[]>;
  
  // User Data
  orders: Order[];
  wallets: Record<string, any>;
  
  // Connection Status
  wsConnected: boolean;
  wsConnecting: boolean;
  subscriptions: Set<string>;
  
  // Performance Metrics
  lastUpdate: number;
  updateCount: number;
  latency: number;
}

export const realTimeStore = proxy<RealTimeState>({
  tickers: {},
  orderBooks: {},
  trades: {},
  orders: [],
  wallets: {},
  wsConnected: false,
  wsConnecting: false,
  subscriptions: new Set(),
  lastUpdate: Date.now(),
  updateCount: 0,
  latency: 0,
});

// ===== REAL-TIME DATA ACTIONS =====

export const realTimeActions = {
  // ===== WEBSOCKET MANAGEMENT =====
  
  setConnected: (connected: boolean) => {
    realTimeStore.wsConnected = connected;
    realTimeStore.wsConnecting = false;
  },

  setConnecting: (connecting: boolean) => {
    realTimeStore.wsConnecting = connecting;
  },

  addSubscription: (channel: string) => {
    realTimeStore.subscriptions.add(channel);
  },

  removeSubscription: (channel: string) => {
    realTimeStore.subscriptions.delete(channel);
  },

  // ===== TICKER UPDATES =====
  
  updateTicker: (market: string, ticker: Ticker) => {
    const startTime = performance.now();
    realTimeStore.tickers[market] = ticker;
    realTimeStore.lastUpdate = Date.now();
    realTimeStore.updateCount++;
    realTimeStore.latency = performance.now() - startTime;
  },

  updateTickers: (tickers: Record<string, Ticker>) => {
    Object.assign(realTimeStore.tickers, tickers);
    realTimeStore.lastUpdate = Date.now();
    realTimeStore.updateCount++;
  },

  // ===== ORDER BOOK UPDATES =====
  
  updateOrderBook: (market: string, orderBook: OrderBook) => {
    realTimeStore.orderBooks[market] = orderBook;
    realTimeStore.lastUpdate = Date.now();
    realTimeStore.updateCount++;
  },

  // ===== TRADE UPDATES =====
  
  addTrade: (market: string, trade: Trade) => {
    if (!realTimeStore.trades[market]) {
      realTimeStore.trades[market] = [];
    }
    realTimeStore.trades[market].unshift(trade);
    
    // Keep only last 100 trades per market
    if (realTimeStore.trades[market].length > 100) {
      realTimeStore.trades[market] = realTimeStore.trades[market].slice(0, 100);
    }
    
    realTimeStore.lastUpdate = Date.now();
    realTimeStore.updateCount++;
  },

  updateTrades: (market: string, trades: Trade[]) => {
    realTimeStore.trades[market] = trades;
    realTimeStore.lastUpdate = Date.now();
    realTimeStore.updateCount++;
  },

  // ===== ORDER UPDATES =====
  
  addOrder: (order: Order) => {
    realTimeStore.orders.unshift(order);
    realTimeStore.lastUpdate = Date.now();
    realTimeStore.updateCount++;
  },

  updateOrder: (orderId: number, updates: Partial<Order>) => {
    const orderIndex = realTimeStore.orders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      Object.assign(realTimeStore.orders[orderIndex], updates);
      realTimeStore.lastUpdate = Date.now();
      realTimeStore.updateCount++;
    }
  },

  removeOrder: (orderId: number) => {
    realTimeStore.orders = realTimeStore.orders.filter(o => o.id !== orderId);
    realTimeStore.lastUpdate = Date.now();
    realTimeStore.updateCount++;
  },

  // ===== WALLET UPDATES =====
  
  updateWallet: (currency: string, balance: any) => {
    realTimeStore.wallets[currency] = balance;
    realTimeStore.lastUpdate = Date.now();
    realTimeStore.updateCount++;
  },

  updateWallets: (wallets: Record<string, any>) => {
    Object.assign(realTimeStore.wallets, wallets);
    realTimeStore.lastUpdate = Date.now();
    realTimeStore.updateCount++;
  },

  // ===== BATCH UPDATES =====
  
  batchUpdate: (updates: {
    tickers?: Record<string, Ticker>;
    orderBooks?: Record<string, OrderBook>;
    trades?: Record<string, Trade[]>;
    orders?: Order[];
    wallets?: Record<string, any>;
  }) => {
    const startTime = performance.now();
    
    if (updates.tickers) {
      Object.assign(realTimeStore.tickers, updates.tickers);
    }
    if (updates.orderBooks) {
      Object.assign(realTimeStore.orderBooks, updates.orderBooks);
    }
    if (updates.trades) {
      Object.assign(realTimeStore.trades, updates.trades);
    }
    if (updates.orders) {
      realTimeStore.orders = updates.orders;
    }
    if (updates.wallets) {
      Object.assign(realTimeStore.wallets, updates.wallets);
    }
    
    realTimeStore.lastUpdate = Date.now();
    realTimeStore.updateCount++;
    realTimeStore.latency = performance.now() - startTime;
  },

  // ===== RESET =====
  
  reset: () => {
    realTimeStore.tickers = {};
    realTimeStore.orderBooks = {};
    realTimeStore.trades = {};
    realTimeStore.orders = [];
    realTimeStore.wallets = {};
    realTimeStore.subscriptions.clear();
    realTimeStore.lastUpdate = Date.now();
    realTimeStore.updateCount = 0;
    realTimeStore.latency = 0;
  },
};

// ===== SELECTORS =====

export const realTimeSelectors = {
  getTicker: (market: string) => realTimeStore.tickers[market],
  getOrderBook: (market: string) => realTimeStore.orderBooks[market],
  getTrades: (market: string) => realTimeStore.trades[market] || [],
  getOrders: () => realTimeStore.orders,
  getWallet: (currency: string) => realTimeStore.wallets[currency],
  getWallets: () => realTimeStore.wallets,
  isConnected: () => realTimeStore.wsConnected,
  isConnecting: () => realTimeStore.wsConnecting,
  getSubscriptions: () => Array.from(realTimeStore.subscriptions),
  getPerformance: () => ({
    lastUpdate: realTimeStore.lastUpdate,
    updateCount: realTimeStore.updateCount,
    latency: realTimeStore.latency,
  }),
};

// ===== SUBSCRIPTIONS =====

export const subscribeToRealTime = (
  callback: (state: RealTimeState) => void,
  selector?: (state: RealTimeState) => any
) => {
  return subscribe(realTimeStore, selector || callback);
};

// ===== PERFORMANCE MONITORING =====

export const performanceMonitor = {
  start: () => {
    const startTime = performance.now();
    return () => performance.now() - startTime;
  },

  measure: <T>(fn: () => T): { result: T; duration: number } => {
    const startTime = performance.now();
    const result = fn();
    const duration = performance.now() - startTime;
    return { result, duration };
  },

  logPerformance: (operation: string, duration: number) => {
    if (duration > 16) { // Longer than one frame
      console.warn(`Performance issue: ${operation} took ${duration.toFixed(2)}ms`);
    }
  },
};
