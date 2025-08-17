// ===== REDUX TO MODERN STATE MANAGEMENT MIGRATION UTILITIES =====

import React from 'react';
import { useBusinessStore } from '@/store/businessStore';
import { realTimeStore, realTimeActions } from '@/store/realTimeStore';
import { useCalculations, useMarketData, useUIState } from '@/store/calculationsStore';
import { useSnapshot } from 'valtio';

// ===== MIGRATION HOOKS =====

// Hook to replace useSelector for user state
export const useUserState = () => {
  const {
    user,
    isAuthenticated,
    token,
    refreshToken,
    setUser,
    setAuthenticated,
    setToken,
    setRefreshToken,
    logout,
  } = useBusinessStore();

  return {
    user,
    isAuthenticated,
    token,
    refreshToken,
    setUser,
    setAuthenticated,
    setToken,
    setRefreshToken,
    logout,
  };
};

// Hook to replace useSelector for markets state
export const useMarketsState = () => {
  const {
    markets,
    selectedMarket,
    favorites,
    setMarkets,
    setSelectedMarket,
    addFavorite,
    removeFavorite,
  } = useBusinessStore();

  const { setMarkets: setMarketData } = useMarketData();

  return {
    markets,
    selectedMarket,
    favorites,
    setMarkets,
    setSelectedMarket,
    addFavorite,
    removeFavorite,
    setMarketData,
  };
};

// Hook to replace useSelector for orders state
export const useOrdersState = () => {
  const {
    openOrders,
    orderHistory,
    setOpenOrders,
    addOpenOrder,
    updateOpenOrder,
    removeOpenOrder,
    setOrderHistory,
  } = useBusinessStore();

  return {
    openOrders,
    orderHistory,
    setOpenOrders,
    addOpenOrder,
    updateOpenOrder,
    removeOpenOrder,
    setOrderHistory,
  };
};

// Hook to replace useSelector for wallets state
export const useWalletsState = () => {
  const {
    wallets,
    setWallets,
    updateWallet,
  } = useBusinessStore();

  return {
    wallets,
    setWallets,
    updateWallet,
  };
};

// Hook to replace useSelector for UI state
export const useUIStateLegacy = () => {
  const {
    theme,
    sidebarCollapsed,
    mobileMenuOpen,
    notifications,
    soundEnabled,
    language,
    setTheme,
    setSidebarCollapsed,
    setMobileMenuOpen,
    setNotifications,
    setSoundEnabled,
    setLanguage,
  } = useUIState();

  return {
    theme,
    sidebarCollapsed,
    mobileMenuOpen,
    notifications,
    soundEnabled,
    language,
    setTheme,
    setSidebarCollapsed,
    setMobileMenuOpen,
    setNotifications,
    setSoundEnabled,
    setLanguage,
  };
};

// Hook to replace useSelector for real-time data
export const useRealTimeState = () => {
  const snapshot = useSnapshot(realTimeStore);
  
  return {
    tickers: snapshot.tickers,
    orderBooks: snapshot.orderBooks,
    trades: snapshot.trades,
    orders: snapshot.orders,
    wallets: snapshot.wallets,
    wsConnected: snapshot.wsConnected,
    wsConnecting: snapshot.wsConnecting,
    subscriptions: Array.from(snapshot.subscriptions),
    lastUpdate: snapshot.lastUpdate,
    updateCount: snapshot.updateCount,
    latency: snapshot.latency,
  };
};

// ===== MIGRATION HELPERS =====

// Helper to migrate Redux selectors
export const createMigratedSelector = <T>(
  selector: (state: any) => T,
  migrationHook: () => T
) => {
  return () => {
    console.warn('Redux selector detected, using migration hook instead');
    return migrationHook();
  };
};

// Helper to migrate Redux actions
export const createMigratedAction = (
  actionCreator: (...args: any[]) => any,
  migrationAction: (...args: any[]) => void
) => {
  return (...args: any[]) => {
    console.warn('Redux action detected, using migration action instead');
    return migrationAction(...args);
  };
};

// ===== COMPATIBILITY WRAPPERS =====

// Wrapper for Redux connect HOC
export const createConnectWrapper = (
  mapStateToProps?: (state: any) => any,
  mapDispatchToProps?: (dispatch: any) => any
) => {
  return (Component: React.ComponentType<any>) => {
    return (props: any) => {
      // Extract state from new stores based on mapStateToProps
      const stateProps = mapStateToProps ? mapStateToProps({}) : {};
      const dispatchProps = mapDispatchToProps ? mapDispatchToProps(() => {}) : {};
      
      return React.createElement(Component, { ...props, ...stateProps, ...dispatchProps });
    };
  };
};

// ===== MIGRATION MAPS =====

// Map of Redux state paths to new state management hooks
export const REDUX_MIGRATION_MAP = {
  'user': useUserState,
  'markets': useMarketsState,
  'orders': useOrdersState,
  'wallets': useWalletsState,
  'ui': useUIStateLegacy,
  'ranger': useRealTimeState,
};

// Map of Redux action types to new actions
export const REDUX_ACTION_MIGRATION_MAP = {
  // User actions
  'user/setUser': (payload: any) => useBusinessStore.getState().setUser(payload),
  'user/setAuthenticated': (payload: any) => useBusinessStore.getState().setAuthenticated(payload),
  'user/setToken': (payload: any) => useBusinessStore.getState().setToken(payload),
  'user/logout': () => useBusinessStore.getState().logout(),
  
  // Market actions
  'markets/setMarkets': (payload: any) => useBusinessStore.getState().setMarkets(payload),
  'markets/setSelectedMarket': (payload: any) => useBusinessStore.getState().setSelectedMarket(payload),
  'markets/addFavorite': (payload: any) => useBusinessStore.getState().addFavorite(payload),
  'markets/removeFavorite': (payload: any) => useBusinessStore.getState().removeFavorite(payload),
  
  // Order actions
  'orders/setOpenOrders': (payload: any) => useBusinessStore.getState().setOpenOrders(payload),
  'orders/addOpenOrder': (payload: any) => useBusinessStore.getState().addOpenOrder(payload),
  'orders/updateOpenOrder': (payload: any) => useBusinessStore.getState().updateOpenOrder(payload.id, payload.updates),
  'orders/removeOpenOrder': (payload: any) => useBusinessStore.getState().removeOpenOrder(payload),
  
  // Wallet actions
  'wallets/setWallets': (payload: any) => useBusinessStore.getState().setWallets(payload),
  'wallets/updateWallet': (payload: any) => useBusinessStore.getState().updateWallet(payload.currency, payload.balance),
  
  // Real-time actions
  'ranger/setConnected': (payload: any) => realTimeActions.setConnected(payload),
  'ranger/setConnecting': (payload: any) => realTimeActions.setConnecting(payload),
  'ranger/updateTicker': (payload: any) => realTimeActions.updateTicker(payload.market, payload.ticker),
  'ranger/updateOrderBook': (payload: any) => realTimeActions.updateOrderBook(payload.market, payload.orderBook),
  'ranger/addTrade': (payload: any) => realTimeActions.addTrade(payload.market, payload.trade),
};

// ===== MIGRATION UTILITIES =====

// Function to migrate a Redux component
export const migrateReduxComponent = (
  Component: React.ComponentType<any>,
  stateSelectors: Record<string, (state: any) => any> = {},
  actionCreators: Record<string, (...args: any[]) => any> = {}
) => {
  return (props: any) => {
    // Create migrated state
    const migratedState: any = {};
    Object.entries(stateSelectors).forEach(([key, selector]) => {
      const migrationHook = REDUX_MIGRATION_MAP[key as keyof typeof REDUX_MIGRATION_MAP];
      if (migrationHook) {
        migratedState[key] = migrationHook();
      }
    });

    // Create migrated actions
    const migratedActions: any = {};
    Object.entries(actionCreators).forEach(([key, actionCreator]) => {
      const migrationAction = REDUX_ACTION_MIGRATION_MAP[key as keyof typeof REDUX_ACTION_MIGRATION_MAP];
      if (migrationAction) {
        migratedActions[key] = migrationAction;
      }
    });

    return React.createElement(Component, { ...props, ...migratedState, ...migratedActions });
  };
};

// ===== DEPRECATION WARNINGS =====

// Warn about Redux usage
export const warnReduxUsage = (componentName: string, hookName: string) => {
  console.warn(
    `[MIGRATION] ${componentName} is using ${hookName} from Redux. ` +
    `Please migrate to the new state management system. ` +
    `See migrationUtils.ts for migration helpers.`
  );
};

// ===== EXPORTS =====

export {
  useUserState,
  useMarketsState,
  useOrdersState,
  useWalletsState,
  useUIStateLegacy,
  useRealTimeState,
  createMigratedSelector,
  createMigratedAction,
  createConnectWrapper,
  migrateReduxComponent,
  warnReduxUsage,
};
