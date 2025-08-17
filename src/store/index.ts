// ===== MODERN STATE MANAGEMENT EXPORTS =====

// Export the new state management stores
export { realTimeStore, realTimeActions, realTimeSelectors } from './realTimeStore';
export { useBusinessStore, businessSelectors } from './businessStore';
export { 
  useCalculations, 
  useMarketData, 
  useUIState,
  // Atoms for direct access
  marketsAtom,
  selectedMarketAtom,
  tickersAtom,
  orderBooksAtom,
  tradesAtom,
  userAtom,
  walletsAtom,
  ordersAtom,
  themeAtom,
  sidebarCollapsedAtom,
  notificationsAtom,
  soundEnabledAtom,
  // Derived atoms
  currentMarketAtom,
  currentTickerAtom,
  currentOrderBookAtom,
  currentTradesAtom,
  bestBidAtom,
  bestAskAtom,
  spreadAtom,
  midPriceAtom,
  totalBidVolumeAtom,
  totalAskVolumeAtom,
  volumeImbalanceAtom,
  tradeStatsAtom,
  orderBookDepthAtom,
  portfolioValueAtom,
  availableBalanceAtom,
  openOrdersAtom,
  orderStatsAtom,
  pnlAtom,
} from './calculationsStore';

// Export event emitter
export { tradingEvents, useTradingEvents } from '../lib/eventEmitter';

// ===== LEGACY REDUX COMPATIBILITY =====
// These exports maintain compatibility with existing components during migration

// Mock Redux store for compatibility
export const store = {
  getState: () => ({}),
  dispatch: () => ({}),
  subscribe: () => () => {},
};

// Mock Redux types for compatibility
export type RootState = any;
export type AppDispatch = any;

// Mock Redux hooks for compatibility (will be replaced in components)
export const useSelector = (selector: any) => selector({});
export const useDispatch = () => () => {};

// Export the new providers
export { Providers } from './providers';
