import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Market, Order, Wallet, Beneficiary } from '@/types';

// ===== BUSINESS LOGIC STORE =====

interface BusinessState {
  // ===== USER STATE =====
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  refreshToken: string | null;
  
  // ===== TRADING STATE =====
  selectedMarket: string | null;
  markets: Market[];
  favorites: string[];
  
  // ===== ORDERS & TRADES =====
  openOrders: Order[];
  orderHistory: Order[];
  tradeHistory: any[];
  
  // ===== WALLETS & BALANCES =====
  wallets: Wallet[];
  beneficiaries: Beneficiary[];
  
  // ===== UI STATE =====
  theme: 'light' | 'dark' | 'system';
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  notifications: boolean;
  soundEnabled: boolean;
  language: string;
  
  // ===== ALERTS & NOTIFICATIONS =====
  alerts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    dismissible?: boolean;
  }>;
  
  // ===== LOADING STATES =====
  loading: {
    user: boolean;
    markets: boolean;
    orders: boolean;
    wallets: boolean;
  };
  
  // ===== ERROR STATES =====
  errors: {
    user: string | null;
    markets: string | null;
    orders: string | null;
    wallets: string | null;
  };
}

interface BusinessActions {
  // ===== USER ACTIONS =====
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  logout: () => void;
  
  // ===== MARKET ACTIONS =====
  setMarkets: (markets: Market[]) => void;
  setSelectedMarket: (market: string | null) => void;
  addFavorite: (market: string) => void;
  removeFavorite: (market: string) => void;
  
  // ===== ORDER ACTIONS =====
  setOpenOrders: (orders: Order[]) => void;
  addOpenOrder: (order: Order) => void;
  updateOpenOrder: (orderId: number, updates: Partial<Order>) => void;
  removeOpenOrder: (orderId: number) => void;
  setOrderHistory: (orders: Order[]) => void;
  setTradeHistory: (trades: any[]) => void;
  
  // ===== WALLET ACTIONS =====
  setWallets: (wallets: Wallet[]) => void;
  updateWallet: (currency: string, balance: any) => void;
  setBeneficiaries: (beneficiaries: Beneficiary[]) => void;
  
  // ===== UI ACTIONS =====
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleNotifications: () => void;
  toggleSound: () => void;
  setLanguage: (language: string) => void;
  
  // ===== ALERT ACTIONS =====
  addAlert: (alert: {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    dismissible?: boolean;
  }) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
  
  // ===== LOADING ACTIONS =====
  setLoading: (key: keyof BusinessState['loading'], loading: boolean) => void;
  
  // ===== ERROR ACTIONS =====
  setError: (key: keyof BusinessState['errors'], error: string | null) => void;
  clearErrors: () => void;
  
  // ===== COMPUTED ACTIONS =====
  getFavoriteMarkets: () => Market[];
  getTotalBalance: (currency: string) => number;
  getOrderStats: () => {
    total: number;
    pending: number;
    filled: number;
    cancelled: number;
  };
}

type BusinessStore = BusinessState & BusinessActions;

export const useBusinessStore = create<BusinessStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // ===== INITIAL STATE =====
        user: null,
        isAuthenticated: false,
        token: null,
        refreshToken: null,
        
        selectedMarket: null,
        markets: [],
        favorites: [],
        
        openOrders: [],
        orderHistory: [],
        tradeHistory: [],
        
        wallets: [],
        beneficiaries: [],
        
        theme: 'dark',
        sidebarCollapsed: false,
        mobileMenuOpen: false,
        notifications: true,
        soundEnabled: true,
        language: 'en',
        
        alerts: [],
        
        loading: {
          user: false,
          markets: false,
          orders: false,
          wallets: false,
        },
        
        errors: {
          user: null,
          markets: null,
          orders: null,
          wallets: null,
        },
        
        // ===== USER ACTIONS =====
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }),
        setToken: (token) => set({ token }),
        setRefreshToken: (refreshToken) => set({ refreshToken }),
        logout: () => set({
          user: null,
          isAuthenticated: false,
          token: null,
          refreshToken: null,
          openOrders: [],
          orderHistory: [],
          tradeHistory: [],
          wallets: [],
          beneficiaries: [],
        }),
        
        // ===== MARKET ACTIONS =====
        setMarkets: (markets) => set({ markets }),
        setSelectedMarket: (selectedMarket) => set({ selectedMarket }),
        addFavorite: (market) => set((state) => ({
          favorites: [...state.favorites, market].filter((v, i, a) => a.indexOf(v) === i)
        })),
        removeFavorite: (market) => set((state) => ({
          favorites: state.favorites.filter(f => f !== market)
        })),
        
        // ===== ORDER ACTIONS =====
        setOpenOrders: (openOrders) => set({ openOrders }),
        addOpenOrder: (order) => set((state) => ({
          openOrders: [order, ...state.openOrders]
        })),
        updateOpenOrder: (orderId, updates) => set((state) => ({
          openOrders: state.openOrders.map(order =>
            order.id === orderId ? { ...order, ...updates } : order
          )
        })),
        removeOpenOrder: (orderId) => set((state) => ({
          openOrders: state.openOrders.filter(order => order.id !== orderId)
        })),
        setOrderHistory: (orderHistory) => set({ orderHistory }),
        setTradeHistory: (tradeHistory) => set({ tradeHistory }),
        
        // ===== WALLET ACTIONS =====
        setWallets: (wallets) => set({ wallets }),
        updateWallet: (currency, balance) => set((state) => ({
          wallets: state.wallets.map(wallet =>
            wallet.currency === currency ? { ...wallet, ...balance } : wallet
          )
        })),
        setBeneficiaries: (beneficiaries) => set({ beneficiaries }),
        
        // ===== UI ACTIONS =====
        setTheme: (theme) => set({ theme }),
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
        toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
        setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
        toggleNotifications: () => set((state) => ({ notifications: !state.notifications })),
        toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
        setLanguage: (language) => set({ language }),
        
        // ===== ALERT ACTIONS =====
        addAlert: (alert) => set((state) => ({
          alerts: [...state.alerts, { ...alert, id: Date.now().toString() }]
        })),
        removeAlert: (id) => set((state) => ({
          alerts: state.alerts.filter(alert => alert.id !== id)
        })),
        clearAlerts: () => set({ alerts: [] }),
        
        // ===== LOADING ACTIONS =====
        setLoading: (key, loading) => set((state) => ({
          loading: { ...state.loading, [key]: loading }
        })),
        
        // ===== ERROR ACTIONS =====
        setError: (key, error) => set((state) => ({
          errors: { ...state.errors, [key]: error }
        })),
        clearErrors: () => set({
          errors: { user: null, markets: null, orders: null, wallets: null }
        }),
        
        // ===== COMPUTED ACTIONS =====
        getFavoriteMarkets: () => {
          const { markets, favorites } = get();
          return markets.filter(market => favorites.includes(market.id));
        },
        
        getTotalBalance: (currency) => {
          const { wallets } = get();
          const wallet = wallets.find(w => w.currency === currency);
          return wallet ? parseFloat(wallet.balance) : 0;
        },
        
        getOrderStats: () => {
          const { openOrders } = get();
          return {
            total: openOrders.length,
            pending: openOrders.filter(o => o.state === 'pending').length,
            filled: openOrders.filter(o => o.state === 'done').length,
            cancelled: openOrders.filter(o => o.state === 'cancel').length,
          };
        },
      }),
      {
        name: 'business-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          // Only persist certain parts of the state
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          notifications: state.notifications,
          soundEnabled: state.soundEnabled,
          language: state.language,
          favorites: state.favorites,
          token: state.token,
          refreshToken: state.refreshToken,
        }),
      }
    )
  )
);

// ===== SELECTORS =====

export const businessSelectors = {
  // User selectors
  selectUser: (state: BusinessStore) => state.user,
  selectIsAuthenticated: (state: BusinessStore) => state.isAuthenticated,
  selectToken: (state: BusinessStore) => state.token,
  
  // Market selectors
  selectMarkets: (state: BusinessStore) => state.markets,
  selectSelectedMarket: (state: BusinessStore) => state.selectedMarket,
  selectFavorites: (state: BusinessStore) => state.favorites,
  selectFavoriteMarkets: (state: BusinessStore) => state.getFavoriteMarkets(),
  
  // Order selectors
  selectOpenOrders: (state: BusinessStore) => state.openOrders,
  selectOrderHistory: (state: BusinessStore) => state.orderHistory,
  selectTradeHistory: (state: BusinessStore) => state.tradeHistory,
  selectOrderStats: (state: BusinessStore) => state.getOrderStats(),
  
  // Wallet selectors
  selectWallets: (state: BusinessStore) => state.wallets,
  selectBeneficiaries: (state: BusinessStore) => state.beneficiaries,
  
  // UI selectors
  selectTheme: (state: BusinessStore) => state.theme,
  selectSidebarCollapsed: (state: BusinessStore) => state.sidebarCollapsed,
  selectMobileMenuOpen: (state: BusinessStore) => state.mobileMenuOpen,
  selectNotifications: (state: BusinessStore) => state.notifications,
  selectSoundEnabled: (state: BusinessStore) => state.soundEnabled,
  selectLanguage: (state: BusinessStore) => state.language,
  
  // Alert selectors
  selectAlerts: (state: BusinessStore) => state.alerts,
  
  // Loading selectors
  selectLoading: (state: BusinessStore) => state.loading,
  selectErrors: (state: BusinessStore) => state.errors,
};

// ===== SUBSCRIPTIONS =====

export const subscribeToBusiness = (
  selector: (state: BusinessStore) => any,
  callback: (value: any) => void
) => {
  return useBusinessStore.subscribe(selector, callback);
};
