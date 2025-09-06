import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// ===== TYPES =====

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
  percentage: number;
}

export interface Trade {
  id: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface OrderBookData {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  spread: number;
  spreadPercentage: number;
}

export interface OrderBookSettings {
  depth: number;
  groupBy: number;
  showSizePercent: boolean;
  animate: boolean;
}

// ===== TRADING STORE =====

interface TradingState {
  // Order book data
  orderBookData: OrderBookData;
  recentTrades: Trade[];
  
  // Settings
  orderBookSettings: OrderBookSettings;
  
  // Actions
  setOrderBookData: (data: OrderBookData) => void;
  setRecentTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  updateOrderBookSettings: (settings: Partial<OrderBookSettings>) => void;
  resetOrderBook: () => void;
}

export const useTradingStore = create<TradingState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    orderBookData: {
      asks: [],
      bids: [],
      spread: 0,
      spreadPercentage: 0,
    },
    recentTrades: [],
    orderBookSettings: {
      depth: 20,
      groupBy: 0,
      showSizePercent: true,
      animate: true,
    },

    // Actions
    setOrderBookData: (data: OrderBookData) => {
      set({ orderBookData: data });
    },

    setRecentTrades: (trades: Trade[]) => {
      set({ recentTrades: trades });
    },

    addTrade: (trade: Trade) => {
      set((state) => ({
        recentTrades: [trade, ...state.recentTrades.slice(0, 99)], // Keep last 100 trades
      }));
    },

    updateOrderBookSettings: (settings: Partial<OrderBookSettings>) => {
      set((state) => ({
        orderBookSettings: { ...state.orderBookSettings, ...settings },
      }));
    },

    resetOrderBook: () => {
      set({
        orderBookData: {
          asks: [],
          bids: [],
          spread: 0,
          spreadPercentage: 0,
        },
        recentTrades: [],
      });
    },
  }))
);

// ===== SELECTORS =====

export const useOrderBookData = () => useTradingStore((state) => state.orderBookData);
export const useRecentTrades = () => useTradingStore((state) => state.recentTrades);
export const useOrderBookSettings = () => useTradingStore((state) => state.orderBookSettings);

// ===== CONVENIENCE HOOKS =====

export const useOrderBookAsks = () => useTradingStore((state) => state.orderBookData.asks);
export const useOrderBookBids = () => useTradingStore((state) => state.orderBookData.bids);
export const useOrderBookSpread = () => useTradingStore((state) => state.orderBookData.spread);
export const useOrderBookSpreadPercentage = () => useTradingStore((state) => state.orderBookData.spreadPercentage);

// ===== ACTIONS =====

export const tradingActions = {
  setOrderBookData: useTradingStore.getState().setOrderBookData,
  setRecentTrades: useTradingStore.getState().setRecentTrades,
  addTrade: useTradingStore.getState().addTrade,
  updateOrderBookSettings: useTradingStore.getState().updateOrderBookSettings,
  resetOrderBook: useTradingStore.getState().resetOrderBook,
};
