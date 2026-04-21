"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/layout/Navigation';
import {
  ChevronDown,
  X,
  Bell,
  RefreshCw,
  Settings,
  User,
  Download,
  Upload,
  Search,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Volume2,
  Clock,
  Star,
  Zap,
  Shield,
  Activity,
  Target,
  Rocket,
  LogOut,
  Wallet,
  History,
  AlertTriangle,
  Bitcoin
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { TradingViewChart } from '@/components/trade/TradingViewChart';
import { EnhancedOrderBook } from '@/components/trade/EnhancedOrderBook';
import { EnhancedOrderForm } from '@/components/trade/EnhancedOrderForm';
import { OrdersTradesPanel } from '@/components/trade/OrdersTradesPanel';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import TickerSearchPanel from '@/components/trade/TickerSearchPanel';
import { useAccountBalances, useAccountStats } from '@/lib/api/services/account';
import {
  useTicker,
  useOrderBook as useAPIOrderBook,
  useMarketTrades as usePublicMarketTrades,
  useKline,
  normalizeMarketSymbol
} from '@/lib/api/services/trading';
import {
  usePublicMarkets as useMarkets,
  usePublicTickers as useTickers
} from '@/lib/api/services/public';
import { useMarketWebSocket } from '@/lib/api/websocket';
import { useHFTWebSocket } from '@/services/hftWebSocketService';
import { useHFTPerformance } from '@/hooks/useHFTPerformance';
// import { useHFTStore, useMarketData, useOrderBook as useHFTOrderBook, useTrades } from '@/store/hftStore';

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex items-center justify-center h-64 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg m-2">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 text-[#ff4444] mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-[hsl(var(--trading-text))] mb-2">Trading Component Error</h2>
        <p className="text-[hsl(var(--trading-text-muted))] mb-4">
          {error.message || 'An unexpected error occurred'}
        </p>
        <Button onClick={resetErrorBoundary} className="btn-gradient-primary">
          Try Again
        </Button>
      </div>
    </div>
  );
}

// Simple Error Boundary Component
class SimpleErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ error: Error; reset: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      return (
        <FallbackComponent
          error={this.state.error}
          reset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

// Loading Fallback Component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg m-2">
      <div className="text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-[hsl(var(--trading-accent))] mx-auto mb-2" />
        <p className="text-[hsl(var(--trading-text-muted))]">Loading trading data...</p>
      </div>
    </div>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[hsl(var(--trading-bg))]">
      <RefreshCw className="h-12 w-12 animate-spin text-[hsl(var(--trading-accent))] mb-4" />
      <h2 className="text-xl font-semibold text-[hsl(var(--trading-text))] mb-2">Loading Trading Data...</h2>
      <p className="text-[hsl(var(--trading-text-muted))]">Please wait while we fetch market information</p>
    </div>
  );
}

// Error State Component
function ErrorState({ error }: { error: any }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[hsl(var(--trading-bg))]">
      <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-[hsl(var(--trading-text))] mb-2">Failed to Load Trading Data</h2>
      <p className="text-[hsl(var(--trading-text-muted))] mb-6 text-center max-w-md">
        {error?.message || 'Unable to connect to trading services. Please check your connection and try again.'}
      </p>
      <Button
        onClick={() => window.location.reload()}
        className="bg-[hsl(var(--trading-accent))] hover:bg-[hsl(var(--trading-accent))]/80 text-black"
      >
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  );
}

// Granular Error Boundary for Trade Page
class TradePageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    console.error("🔴 Trade Page Error Boundary caught:", error);
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("🔴 Trade Page Error Details:", {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  override render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-[hsl(var(--trading-bg))]">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Trade Page Error</h1>
          <p className="text-[hsl(var(--trading-text))] mb-2"><strong>Error:</strong> {this.state.error.message}</p>
          <pre className="bg-[hsl(var(--trading-bg-secondary))] p-4 rounded text-xs overflow-auto max-w-4xl text-[hsl(var(--trading-text-muted))] mb-4 whitespace-pre-wrap">
            {this.state.error.stack}
          </pre>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[hsl(var(--trading-accent))] hover:bg-[hsl(var(--trading-accent))]/80 text-black"
          >
            Reload Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

function TradingPage() {
  console.log("🔵 Trade Page: Component starting...");

  const router = useRouter();
  const [selectedMarket, setSelectedMarket] = useState('');
  console.log("✅ Trade Page: useRouter initialized");
  const [currentPrice, setCurrentPrice] = useState(43250.50);
  const [priceChange24h, setPriceChange24h] = useState(2.45);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showMarketSelector, setShowMarketSelector] = useState(false);

  const { toast } = useToast();

  // Use React Query hooks for all data
  const { data: marketsData, isLoading: marketsLoading, error: marketsError } = useMarkets();
  const { data: tickersData, isLoading: tickersLoading, error: tickersError } = useTickers();
  const { data: balancesData, isLoading: balancesLoading, error: balancesError } = useAccountBalances();
  const { data: statsData, isLoading: statsLoading, error: statsError } = useAccountStats();
  const { data: currentTickerData, isLoading: tickerLoading, error: tickerError } = useTicker(selectedMarket);
  const { data: orderBookData, isLoading: orderBookLoading, error: orderBookError } = useAPIOrderBook(selectedMarket, 20);
  const { data: marketTradesData, isLoading: marketTradesLoading, error: marketTradesError } = usePublicMarketTrades(selectedMarket, 50);
  const { data: klineData, isLoading: klineLoading, error: klineError } = useKline(selectedMarket, '1h', 200);

  useEffect(() => {
    if (selectedMarket || !marketsData?.length) {
      return;
    }

    const preferredMarket =
      marketsData.find((market: any) => ['btcusdt', 'btcusd', 'ethusdt'].includes(String(market.id).toLowerCase()))?.id ||
      marketsData[0]?.id;

    if (preferredMarket) {
      setSelectedMarket(preferredMarket);
    }
  }, [marketsData, selectedMarket]);

  // Keep the page responsive even if authenticated account endpoints are slow or unavailable.
  const publicDataError = marketsError || tickersError ||
    tickerError || orderBookError || marketTradesError || klineError;
  const accountDataError = isAuthenticated ? (balancesError || statsError) : null;
  const isPublicDataLoading = marketsLoading || tickersLoading ||
    tickerLoading || orderBookLoading || marketTradesLoading || klineLoading;
  const isAccountDataLoading = isAuthenticated && (balancesLoading || statsLoading);
  const isDataLoading = isPublicDataLoading;
  const hasDataError = publicDataError || accountDataError;

  // Memoized data processing for performance
  const processedMarketData = useMemo(() => {
    // Add early return if data is still loading
    if (isPublicDataLoading && !currentTickerData && !tickersData) return null;
    if (!currentTickerData && !tickersData) return null;

    const normalizedMarket = normalizeMarketSymbol(selectedMarket);
    const ticker = currentTickerData || tickersData?.find((t: any) => normalizeMarketSymbol(t.market) === normalizedMarket);
    if (!ticker) return null;

    // Safely parse values with fallbacks
    const tickerData = ticker.ticker || ticker;
    return {
      lastPrice: parseFloat(tickerData?.last || '0') || 0,
      change24h: parseFloat(tickerData?.price_change_percent || '0') || 0,
      high24h: parseFloat(tickerData?.high || '0') || 0,
      low24h: parseFloat(tickerData?.low || '0') || 0,
      volume: parseFloat(tickerData?.vol || '0') || 0,
    };
  }, [currentTickerData, tickersData, selectedMarket, isPublicDataLoading]);

  // Memoized balance calculation
  const totalBalance = useMemo(() => {
    if (!isAuthenticated || !balancesData || !processedMarketData) return 0;

    return balancesData.reduce((sum: number, balance: any) => {
      const price = normalizeMarketSymbol(selectedMarket) === normalizeMarketSymbol(`${balance.currency}usdt`) ?
        processedMarketData.lastPrice : 1;
      return sum + (parseFloat(balance.balance || '0') * price);
    }, 0);
  }, [isAuthenticated, balancesData, processedMarketData, selectedMarket]);

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Trade page data:', {
      marketsData: marketsData?.length,
      tickersData: tickersData?.length,
      balancesData: balancesData?.length,
      processedMarketData,
      isDataLoading,
      hasDataError,
      selectedMarket
    });
  }

  // Get current market ticker data - prioritize real-time ticker data
  const normalizedSelectedMarket = normalizeMarketSymbol(selectedMarket);
  const currentTicker = currentTickerData || tickersData?.find((ticker: any) => normalizeMarketSymbol(ticker.market) === normalizedSelectedMarket);
  const currentPriceFromAPI = currentTicker ? parseFloat(currentTicker.ticker?.last || currentTicker.last || '0') : currentPrice;
  const priceChangeFromAPI = currentTicker ? parseFloat(currentTicker.ticker?.price_change_percent || currentTicker.price_change_percent || '0') : priceChange24h;

  // Legacy balance calculation (replaced by memoized version above)

  // Calculate active orders count (placeholder)
  const activeOrdersCount = 0; // Would need to implement orders API

  // Debug logging
  console.log('[RENDER] Trade page rendering, isDataLoading:', isDataLoading);
  console.log('[RENDER] Data status:', {
    marketsData: marketsData?.length,
    tickersData: tickersData?.length,
    balancesData: balancesData?.length,
    orderBookData,
    marketTradesData: marketTradesData?.length,
    klineData
  });

  // WebSocket integration for real-time updates
  const { ticker: wsTicker, orderbook: wsOrderBook, trades: wsTrades } = useMarketWebSocket(selectedMarket);

  // HFT Error State Management
  const [hftError, setHftError] = useState<Error | null>(null);
  const [hftEnabled, setHftEnabled] = useState(true);

  // Toast guard flags to prevent infinite loops
  const [hasShownAuthToast, setHasShownAuthToast] = useState(false);
  const [hasShownDataErrorToast, setHasShownDataErrorToast] = useState(false);
  const [hasShownHFTErrorToast, setHasShownHFTErrorToast] = useState(false);

  // HFT WebSocket for high-frequency data - called unconditionally
  const hftWebSocket = useHFTWebSocket(hftEnabled ? selectedMarket : undefined);
  const hftConnected = hftWebSocket?.isConnected ?? false;
  const hftMarketData = hftWebSocket?.marketData ?? null;
  const hftOrderBook = hftWebSocket?.orderBook ?? null;
  const hftTrades = hftWebSocket?.trades ?? [];
  const accountDataErrorMessage = accountDataError instanceof Error
    ? accountDataError.message
    : accountDataError
      ? 'Account data is temporarily unavailable'
      : null;

  // HFT Performance monitoring - called unconditionally
  const hftPerformance = useHFTPerformance();
  const metrics = hftPerformance?.metrics ?? { fps: 0, renderTime: 0, memoryUsage: 0, errorCount: 0 };
  const healthScore = hftPerformance?.healthScore ?? 0;
  const isHealthy = hftPerformance?.isHealthy ?? false;
  const measureRender = hftPerformance?.measureRender ?? ((fn: any) => fn());
  const recordError = hftPerformance?.recordError ?? (() => { });

  // HFT Store integration - TEMPORARILY DISABLED to prevent infinite loop
  // TODO: Fix store selectors to use proper equality checks
  // const hftStore = useHFTStore();
  // const hftMarketDataStore = useMarketData(selectedMarket);
  // const hftOrderBookStore = useHFTOrderBook(selectedMarket);
  // const hftTradesStore = useTrades(selectedMarket);

  // Handle HFT errors in useEffect
  useEffect(() => {
    // Validate HFT features are working
    if (!hftWebSocket && hftEnabled) {
      console.error('HFT WebSocket not available');
      setHftError(new Error('HFT WebSocket not available'));
      setHftEnabled(false);
    }
  }, [hftWebSocket, hftEnabled]);

  // Separate toast effect for HFT errors - only shows once
  useEffect(() => {
    if (hftError && !hasShownHFTErrorToast) {
      toast({
        title: "HFT Features Unavailable",
        description: "High-frequency trading features are disabled. Basic trading is still available.",
      });
      setHasShownHFTErrorToast(true);
    }
  }, [hftError, hasShownHFTErrorToast]);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getUser();
      const authenticated = authService.isAuthenticated();

      setUser(currentUser);
      setIsAuthenticated(authenticated);

      if (!authenticated) {
        setShowAuthWarning(true);
      }
    };

    checkAuth();

    // Check auth status every 30 seconds
    const authInterval = setInterval(checkAuth, 30000);

    return () => clearInterval(authInterval);
  }, []);

  // Separate toast effect for auth warning - only shows once
  useEffect(() => {
    if (showAuthWarning && !isAuthenticated && !hasShownAuthToast) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access trading features",
      });
      setHasShownAuthToast(true);
    }
  }, [showAuthWarning, isAuthenticated, hasShownAuthToast]);

  // Update price from API data
  useEffect(() => {
    if (currentTicker && currentPriceFromAPI > 0) {
      setCurrentPrice(currentPriceFromAPI);
      setPriceChange24h(priceChangeFromAPI);
    }
  }, [currentTicker, currentPriceFromAPI, priceChangeFromAPI]);

  // WebSocket data updates - automatically handled by useMarketWebSocket hook
  useEffect(() => {
    if (wsTicker) {
      console.log('WebSocket ticker update:', wsTicker);
    }
  }, [wsTicker]);

  useEffect(() => {
    if (wsOrderBook) {
      console.log('WebSocket order book update:', wsOrderBook);
    }
  }, [wsOrderBook]);

  useEffect(() => {
    if (wsTrades && wsTrades.length > 0) {
      console.log('WebSocket trades update:', wsTrades);
    }
  }, [wsTrades]);

  // Handle API errors - only show toast once
  useEffect(() => {
    if (publicDataError && !hasShownDataErrorToast) {
      toast({
        title: "Data Loading Error",
        description: "Failed to load some market data. Please refresh the page.",
      });
      setHasShownDataErrorToast(true);
    }
  }, [publicDataError, hasShownDataErrorToast, toast]);

  // Optimized event handlers with useCallback
  const handleMarketSelect = useCallback((market: string) => {
    setSelectedMarket(market);
    toast({
      title: "Market Changed",
      description: `Switched to ${market}`,
    });
  }, [toast]);

  const handlePriceClick = useCallback((price: number) => {
    toast({
      title: "Price Selected",
      description: `Price set to $${price.toFixed(2)}`,
    });
  }, [toast]);

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data Refreshed",
        description: "Market data has been updated",
      });
    }, 1000);
  }, [toast]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      router.push('/auth/signin');
    } catch (error) {
      toast({
        title: "Logout Error",
        description: "Failed to logout. Please try again.",
      });
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleWalletClick = () => {
    router.push('/wallet');
  };

  const handleHistoryClick = () => {
    router.push('/history');
  };

  // Early return for initial loading state (when no data is loaded yet)
  if (!selectedMarket && (marketsLoading || tickersLoading) && !marketsData?.length) {
    return <LoadingState />;
  }

  // Early return for error state
  if (publicDataError && !marketsData?.length && !tickersData?.length) {
    return <ErrorState error={publicDataError} />;
  }

  return (
    <div className="h-screen trading-layout flex flex-col trading-font overflow-hidden bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
      {/* Navigation */}
      <Navigation user={user} />

      {accountDataErrorMessage && (
        <div className="mx-4 mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Account services are degraded right now. Market data is still live, but balances or stats may be stale: {accountDataErrorMessage}
        </div>
      )}

      {/* Enhanced Top Status Bar */}
      <div className="h-8 bg-gradient-to-r from-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] border-b border-[hsl(var(--trading-border))] flex items-center justify-between px-4 text-xs glass">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse shadow-lg ${isAuthenticated ? 'bg-gradient-to-r from-[#00ff88] to-[#00cc6a]' : 'bg-gradient-to-r from-[#ff4444] to-[#cc3333]'}`}></div>
            <span className={`font-medium ${isAuthenticated ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
              {isAuthenticated ? 'Live' : 'Unauthorized'}
            </span>
          </div>
          <span className="text-[hsl(var(--trading-text-muted))]">Last updated: {new Date().toLocaleTimeString()}</span>
          {user && (
            <div className="flex items-center space-x-2">
              <User className="h-3 w-3 text-[hsl(var(--trading-text-muted))]" />
              <span className="text-[hsl(var(--trading-text))] font-medium">{user.email}</span>
              <Badge variant="outline" className="text-xs">
                KYC Level {user.kyc_level || 0}
              </Badge>
            </div>
          )}
          {/* Market Selection Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMarketSelector(!showMarketSelector)}
            className="text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))] h-6 px-2 transition-all duration-300 border border-[hsl(var(--trading-border))]"
          >
            <Bitcoin className="h-3 w-3 mr-1" />
            {selectedMarket}
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))] h-6 px-2 transition-all duration-300"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-[hsl(var(--trading-text-muted))]">Ping:</span>
            <span className="text-[#00ff88] font-mono font-medium">12ms</span>
          </div>
          {/* Socketeer WebSocket Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${hftConnected ? 'bg-[#00ff88]' : 'bg-[#ff4444]'}`}></div>
            <span className="text-[hsl(var(--trading-text-muted))]">Socketeer:</span>
            <span className={`font-mono font-medium ${hftConnected ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
              {hftConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[hsl(var(--trading-text-muted))]">Health:</span>
            <span className={`font-mono font-medium ${isHealthy ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
              {healthScore}%
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[hsl(var(--trading-text-muted))]">FPS:</span>
            <span className={`font-mono font-medium ${metrics.fps >= 30 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
              {Math.round(metrics.fps)}
            </span>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Loading Overlay */}
        {isPublicDataLoading && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg p-6 shadow-xl">
              <div className="flex items-center space-x-3">
                <RefreshCw className="h-6 w-6 animate-spin text-[hsl(var(--trading-accent))]" />
                <span className="text-[hsl(var(--trading-text))] font-medium">Loading market data...</span>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Center Panel - Chart & Market Data */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Enhanced Chart Area - Fixed height with proper overflow */}
          <div className="flex-1 min-h-0 relative border border-[hsl(var(--trading-border))] rounded-lg m-2 overflow-hidden shadow-xl">
            <SimpleErrorBoundary
              fallback={({ error, reset }: { error: Error; reset: () => void }) => (
                <ErrorFallback error={error} resetErrorBoundary={reset} />
              )}
            >
              <Suspense fallback={<LoadingFallback />}>
                <TradingViewChart
                  symbol={selectedMarket}
                  interval="1h"
                  theme="dark"
                  width="100%"
                  height="100%"
                  selectedMarket={selectedMarket}
                  onMarketSelect={handleMarketSelect}
                  klineData={klineData || []}
                />
              </Suspense>
            </SimpleErrorBoundary>
          </div>

          {/* Enhanced Orders/Trades Panel - Fixed height */}
          <div className="h-64 border-t border-[hsl(var(--trading-border))] flex-shrink-0 overflow-hidden m-2 mt-0 shadow-lg">
            <SimpleErrorBoundary
              fallback={({ error, reset }: { error: Error; reset: () => void }) => (
                <ErrorFallback error={error} resetErrorBoundary={reset} />
              )}
            >
              <Suspense fallback={<LoadingFallback />}>
                <OrdersTradesPanel
                  market={selectedMarket}
                  compact={false}
                />
              </Suspense>
            </SimpleErrorBoundary>
          </div>
        </div>

        {/* Enhanced Right Panel - Order Book & Order Form */}
        <div className="w-[600px] flex gap-2 p-2 flex-shrink-0 overflow-hidden">
          {/* Enhanced Order Book Panel */}
          <div className="w-[300px] trading-panel border border-[hsl(var(--trading-border))] rounded-lg shadow-xl overflow-hidden">
            <SimpleErrorBoundary
              fallback={({ error, reset }: { error: Error; reset: () => void }) => (
                <ErrorFallback error={error} resetErrorBoundary={reset} />
              )}
            >
              <Suspense fallback={<LoadingFallback />}>
                <EnhancedOrderBook
                  market={selectedMarket}
                  onPriceClick={handlePriceClick}
                  compact={true}
                  orderBookData={orderBookData || { asks: [], bids: [] }}
                  marketTradesData={marketTradesData || []}
                />
              </Suspense>
            </SimpleErrorBoundary>
          </div>

          {/* Enhanced Order Form Panel */}
          <div className="w-[300px] trading-panel border border-[hsl(var(--trading-border))] rounded-lg shadow-xl overflow-y-auto">
            <SimpleErrorBoundary
              fallback={({ error, reset }: { error: Error; reset: () => void }) => (
                <ErrorFallback error={error} resetErrorBoundary={reset} />
              )}
            >
              <Suspense fallback={<LoadingFallback />}>
                <EnhancedOrderForm
                  market={selectedMarket}
                  currentPrice={processedMarketData?.lastPrice || currentPrice}
                  onPriceClick={handlePriceClick}
                  compact={true}
                  balancesData={balancesData || []}
                />
              </Suspense>
            </SimpleErrorBoundary>
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Status Bar */}
      <div className="h-6 bg-gradient-to-r from-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] border-t border-[hsl(var(--trading-border))] flex items-center justify-between px-4 text-xs glass">
        <div className="flex items-center space-x-4">
          <span className="text-[hsl(var(--trading-text-muted))]">Connection: <span className={`font-medium ${hftConnected ? 'text-[#00ff88]' : 'text-[#ffb020]'}`}>{hftConnected ? 'Realtime' : 'Polling only'}</span></span>
          <span className="text-[hsl(var(--trading-text-muted))]">Orders: <span className="text-[hsl(var(--trading-text))] font-medium">{activeOrdersCount} Active</span></span>
          <span className="text-[hsl(var(--trading-text-muted))]">Balance: <span className="text-[hsl(var(--trading-text))] font-medium">${formatNumber(totalBalance, 2)}</span></span>
          {isAuthenticated && isAccountDataLoading && (
            <span className="text-[hsl(var(--trading-text-muted))]">Account data: <span className="text-yellow-400 font-medium">Refreshing</span></span>
          )}
          {isAuthenticated && accountDataErrorMessage && (
            <span className="text-[hsl(var(--trading-text-muted))]">Account data: <span className="text-[#ffb020] font-medium">Unavailable</span></span>
          )}
          {user && (
            <>
              <span className="text-[hsl(var(--trading-text-muted))]">KYC: <span className={`font-medium ${user.kyc_level >= 2 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>Level {user.kyc_level || 0}</span></span>
              <span className="text-[hsl(var(--trading-text-muted))]">Email: <span className={`font-medium ${user.email_verified ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>{user.email_verified ? 'Verified' : 'Unverified'}</span></span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[hsl(var(--trading-text-muted))]">24h P&L: <span className="text-[#00ff88] font-medium">+$0.00</span></span>
          <span className="text-[hsl(var(--trading-text-muted))]">Total P&L: <span className="text-[#00ff88] font-medium">+$0.00</span></span>
          {!isAuthenticated && (
            <span className="text-[#ff4444] font-medium">⚠️ Demo Mode</span>
          )}
        </div>
      </div>

      {/* Enhanced Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        {isAuthenticated ? (
          <>
            <Button
              size="sm"
              className="btn-gradient-primary rounded-full shadow-2xl w-12 h-12 p-0 hover:scale-110 transition-all duration-300"
              onClick={() => {
                toast({
                  title: "Quick Trade",
                  description: "Quick trade feature coming soon!",
                });
              }}
            >
              <TrendingUp className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-secondary))] rounded-full shadow-2xl w-12 h-12 p-0 hover:scale-110 transition-all duration-300"
              onClick={handleWalletClick}
            >
              <Wallet className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-secondary))] rounded-full shadow-2xl w-12 h-12 p-0 hover:scale-110 transition-all duration-300"
              onClick={handleHistoryClick}
            >
              <History className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-secondary))] rounded-full shadow-2xl w-12 h-12 p-0 hover:scale-110 transition-all duration-300"
              onClick={handleProfileClick}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-[hsl(var(--trading-border))] text-[#ff4444] hover:text-[#ff6666] hover:bg-[hsl(var(--trading-bg-secondary))] rounded-full shadow-2xl w-12 h-12 p-0 hover:scale-110 transition-all duration-300"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            className="btn-gradient-primary rounded-full shadow-2xl w-12 h-12 p-0 hover:scale-110 transition-all duration-300"
            onClick={() => router.push('/auth/signin')}
          >
            <User className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Market Selection Panel */}
      {showMarketSelector && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40">
          <div className="glass border border-[#2a2a2a] rounded-lg shadow-2xl backdrop-blur-xl w-[500px] max-h-[600px] overflow-hidden">
            <div className="p-3 border-b border-[#2a2a2a] bg-[#1a1a1a] flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#00ff88]">Market Selection</h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-[#888888] hover:text-white"
                onClick={() => setShowMarketSelector(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="h-[500px] overflow-hidden">
              <TickerSearchPanel
                onMarketSelect={(market) => {
                  handleMarketSelect(market);
                  setShowMarketSelector(false);
                }}
                selectedMarket={selectedMarket}
                compact={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Authentication Warning Overlay */}
      {showAuthWarning && !isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="glass border border-[#2a2a2a] rounded-lg p-6 shadow-2xl backdrop-blur-xl max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-[#ff4444]" />
              <h3 className="text-lg font-semibold text-white">Authentication Required</h3>
            </div>
            <p className="text-[hsl(var(--trading-text-muted))] mb-6">
              You need to be signed in to access trading features. Please sign in to continue.
            </p>
            <div className="flex space-x-3">
              <Button
                className="flex-1 btn-gradient-primary"
                onClick={() => router.push('/auth/signin')}
              >
                Sign In
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))]"
                onClick={() => setShowAuthWarning(false)}
              >
                Continue as Guest
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrap with Error Boundary and AuthGuard
export default function TradingPageWrapper() {
  return (
    <AuthGuard>
      <TradePageErrorBoundary>
        <TradingPage />
      </TradePageErrorBoundary>
    </AuthGuard>
  );
}
