import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  lastUpdate: Date;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
  percentage: number;
}

export interface OrderBookData {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  spread: number;
  spreadPercentage: number;
  lastUpdate: Date;
}

export interface TradeEntry {
  id: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: Date;
}

export interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TradingState {
  // Market data
  selectedMarket: string;
  marketData: Record<string, MarketData>;
  orderBookData: Record<string, OrderBookData>;
  recentTrades: Record<string, TradeEntry[]>;
  chartData: Record<string, ChartData[]>;
  
  // UI state
  chartType: 'candlestick' | 'line' | 'area';
  timeframe: string;
  showVolume: boolean;
  showGrid: boolean;
  autoScale: boolean;
  grouping: number;
  depth: number;
  
  // Performance
  isConnected: boolean;
  lastUpdate: Date;
  performance: {
    fps: number;
    latency: number;
    orderCount: number;
  };
  
  // Actions
  setSelectedMarket: (market: string) => void;
  updateMarketData: (symbol: string, data: Partial<MarketData>) => void;
  updateOrderBook: (symbol: string, data: OrderBookData) => void;
  addTrade: (symbol: string, trade: TradeEntry) => void;
  updateChartData: (symbol: string, data: ChartData[]) => void;
  setChartType: (type: 'candlestick' | 'line' | 'area') => void;
  setTimeframe: (timeframe: string) => void;
  setShowVolume: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  setAutoScale: (auto: boolean) => void;
  setGrouping: (grouping: number) => void;
  setDepth: (depth: number) => void;
  setConnectionStatus: (connected: boolean) => void;
  updatePerformance: (performance: Partial<TradingState['performance']>) => void;
}

export const useTradingStore = create<TradingState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      selectedMarket: 'BTC-USDT',
      marketData: {},
      orderBookData: {},
      recentTrades: {},
      chartData: {},
      
      chartType: 'candlestick',
      timeframe: '1h',
      showVolume: false,
      showGrid: false,
      autoScale: false,
      grouping: 1,
      depth: 20,
      
      isConnected: false,
      lastUpdate: new Date(),
      performance: {
        fps: 60,
        latency: 0,
        orderCount: 0,
      },
      
      // Actions
      setSelectedMarket: (market) => set({ selectedMarket: market }),
      
      updateMarketData: (symbol, data) => set((state) => ({
        marketData: {
          ...state.marketData,
          [symbol]: {
            ...state.marketData[symbol],
            ...data,
            lastUpdate: new Date(),
          } as MarketData,
        },
        lastUpdate: new Date(),
      })),
      
      updateOrderBook: (symbol, data) => set((state) => ({
        orderBookData: {
          ...state.orderBookData,
          [symbol]: {
            ...data,
            lastUpdate: new Date(),
          },
        },
        lastUpdate: new Date(),
      })),
      
      addTrade: (symbol, trade) => set((state) => {
        const currentTrades = state.recentTrades[symbol] || [];
        const updatedTrades = [trade, ...currentTrades.slice(0, 99)]; // Keep last 100 trades
        
        return {
          recentTrades: {
            ...state.recentTrades,
            [symbol]: updatedTrades,
          },
          lastUpdate: new Date(),
        };
      }),
      
      updateChartData: (symbol, data) => set((state) => ({
        chartData: {
          ...state.chartData,
          [symbol]: data,
        },
        lastUpdate: new Date(),
      })),
      
      setChartType: (type) => set({ chartType: type }),
      setTimeframe: (timeframe) => set({ timeframe }),
      setShowVolume: (show) => set({ showVolume: show }),
      setShowGrid: (show) => set({ showGrid: show }),
      setAutoScale: (auto) => set({ autoScale: auto }),
      setGrouping: (grouping) => set({ grouping }),
      setDepth: (depth) => set({ depth }),
      setConnectionStatus: (connected) => set({ isConnected: connected }),
      
      updatePerformance: (performance) => set((state) => ({
        performance: {
          ...state.performance,
          ...performance,
        },
      })),
    })),
    {
      name: 'trading-store',
    }
  )
);

// Selectors for performance optimization
export const useSelectedMarket = () => useTradingStore((state) => state.selectedMarket);
export const useMarketData = (symbol: string) => useTradingStore((state) => state.marketData[symbol]);
export const useOrderBookData = (symbol: string) => useTradingStore((state) => state.orderBookData[symbol]);
export const useRecentTrades = (symbol: string) => useTradingStore((state) => state.recentTrades[symbol] || []);
export const useChartData = (symbol: string) => useTradingStore((state) => state.chartData[symbol] || []);
export const useChartSettings = () => useTradingStore((state) => ({
  chartType: state.chartType,
  timeframe: state.timeframe,
  showVolume: state.showVolume,
  showGrid: state.showGrid,
  autoScale: state.autoScale,
}));
export const useOrderBookSettings = () => useTradingStore((state) => ({
  grouping: state.grouping,
  depth: state.depth,
}));
export const useConnectionStatus = () => useTradingStore((state) => state.isConnected);
export const usePerformance = () => useTradingStore((state) => state.performance);
