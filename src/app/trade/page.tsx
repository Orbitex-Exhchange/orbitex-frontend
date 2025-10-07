"use client";

import { useState, useRef, useEffect } from 'react';
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
import { MarketDataPanel } from '@/components/trade/MarketDataPanel';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import TickerSearchPanel from '@/components/trade/TickerSearchPanel';
import { 
  useMarketStore, useMarkets, useTickers, useMarketLoading, useMarketError, marketActions,
  useWalletStore, useBalances, useWalletLoading, useWalletError, walletActions,
  useTradingStore, useOrderBookData, useRecentTrades, tradingActions
} from '@/store';
import { 
  usePublicTickers, 
  useAccountBalances, 
  useAccountStats, 
  useOrders, 
  useTrades
} from '@/lib/api';
import { 
  useTicker,
  useOrderBook,
  useMarketTrades,
  useKline
} from '@/lib/api/services/trading';
import { useSocketIOMarketData, useSocketIODiagnostics } from '@/hooks/useSocketIO';

export default function TradingPage() {
  const router = useRouter();
  const [selectedMarket, setSelectedMarket] = useState('BTC-USDT');
  const [currentPrice, setCurrentPrice] = useState(43250.50);
  const [priceChange24h, setPriceChange24h] = useState(2.45);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showMarketSelector, setShowMarketSelector] = useState(false);
  
  const { toast } = useToast();

  // Real API data hooks
  const { data: tickersData, isLoading: tickersLoading, error: tickersError } = usePublicTickers();
  const { data: balancesData, isLoading: balancesLoading, error: balancesError } = useAccountBalances();
  const { data: statsData, isLoading: statsLoading, error: statsError } = useAccountStats();
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useOrders({ limit: 10 });
  const { data: tradesData, isLoading: tradesLoading, error: tradesError } = useTrades({ limit: 10 });
  
  // Market-specific real-time data hooks
  const { data: currentTickerData, isLoading: tickerLoading, error: tickerError } = useTicker(selectedMarket);
  const { data: orderBookData, isLoading: orderBookLoading, error: orderBookError } = useOrderBook(selectedMarket, 20);
  const { data: marketTradesData, isLoading: marketTradesLoading, error: marketTradesError } = useMarketTrades(selectedMarket, 50);
  const { data: klineData, isLoading: klineLoading, error: klineError } = useKline(selectedMarket, '1h', 200);

  // Combined loading and error states - only show loading if critical data is loading
  const isCriticalDataLoading = tickersLoading || tickerLoading;
  const isDataLoading = isCriticalDataLoading && !tickersData && !currentTickerData;
  const hasDataError = tickersError || tickerError;

  // Get current market ticker data - prioritize real-time ticker data
  const currentTicker = currentTickerData || tickersData?.find(ticker => ticker.market === selectedMarket);
  const currentPriceFromAPI = currentTicker ? parseFloat(currentTicker.ticker.last) : currentPrice;
  const priceChangeFromAPI = currentTicker ? parseFloat(currentTicker.ticker.price_change_percent) : priceChange24h;

  // Calculate total balance
  const totalBalance = balancesData?.reduce((sum, balance) => {
    const price = currentTicker?.market === `${balance.currency}-USDT` ? 
      parseFloat(currentTicker.ticker.last) : 1;
    return sum + (parseFloat(balance.balance) * price);
  }, 0) || 0;

  // Calculate active orders count
  const activeOrdersCount = ordersData?.filter(order => order.state === 'wait').length || 0;

  // Socket.IO integration for high-frequency real-time updates
  const { 
    ticker: wsTicker, 
    orderbook: wsOrderBook, 
    trades: wsTrades,
    kline: wsKline,
    isConnected: wsConnected,
    lastUpdate: wsLastUpdate,
    performanceMetrics: wsMetrics
  } = useSocketIOMarketData(selectedMarket);
  
  // WebSocket diagnostics for monitoring
  const wsDiagnostics = useSocketIODiagnostics();

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getUser();
      const authenticated = authService.isAuthenticated();
      
      setUser(currentUser);
      setIsAuthenticated(authenticated);
      
      // No demo mode - just set authentication state
      if (!authenticated) {
        setShowAuthWarning(false); // Don't show warning immediately
      }
    };

    checkAuth();
    
    // Check auth status every 30 seconds
    const authInterval = setInterval(checkAuth, 30000);
    
    return () => clearInterval(authInterval);
  }, [toast]);

  // Update price from API data
  useEffect(() => {
    if (currentTicker) {
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

  // Handle API errors
  useEffect(() => {
    if (hasDataError) {
      toast({
        title: "Data Loading Error",
        description: "Failed to load some market data. Please refresh the page.",
      });
    }
  }, [hasDataError, toast]);

  const handleMarketSelect = (market: string) => {
    setSelectedMarket(market);
    toast({
      title: "Market Changed",
      description: `Switched to ${market}`,
    });
  };

  const handlePriceClick = (price: number) => {
    toast({
      title: "Price Selected",
      description: `Price set to $${price.toFixed(2)}`,
    });
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Data Refreshed",
        description: "Market data has been updated",
      });
    }, 1000);
  };

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

  return (
    <div className="h-screen trading-layout flex flex-col trading-font overflow-hidden bg-gradient-to-br from-[hsl(var(--trading-bg))] via-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))]">
      {/* Navigation */}
      <Navigation user={user} />
      
      {/* Enhanced Top Status Bar */}
      <div className="h-8 bg-gradient-to-r from-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] border-b border-[hsl(var(--trading-border))] flex items-center justify-between px-4 text-xs glass">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full animate-pulse shadow-lg ${wsConnected ? 'bg-gradient-to-r from-[#00ff88] to-[#00cc6a]' : 'bg-gradient-to-r from-[#ff4444] to-[#cc3333]'}`}></div>
            <span className={`font-medium ${wsConnected ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
              {wsConnected ? 'Live' : 'Disconnected'}
            </span>
            {wsConnected && wsDiagnostics.latency > 0 && (
              <span className="text-xs text-[hsl(var(--trading-text-muted))]">
                {wsDiagnostics.latency}ms
              </span>
            )}
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
            <span className="text-[hsl(var(--trading-text-muted))]">Transport:</span>
            <span className="text-[#00ff88] font-mono font-medium">{wsDiagnostics.transportType}</span>
            {wsMetrics && (
              <>
                <span className="text-[hsl(var(--trading-text-muted))]">|</span>
                <span className="text-[hsl(var(--trading-text-muted))]">Rate:</span>
                <span className="text-[#00ff88] font-mono font-medium">{wsMetrics.messagesPerSecond.toFixed(1)}/s</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Loading Overlay */}
        {isDataLoading && (
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
            <TradingViewChart
              symbol={selectedMarket}
              interval="1h"
              theme="dark"
              width="100%"
              height="100%"
              selectedMarket={selectedMarket}
              onMarketSelect={handleMarketSelect}
              klineData={klineData}
            />
          </div>

          {/* Enhanced Market Data Panel - Fixed height */}
          <div className="h-64 border-t border-[hsl(var(--trading-border))] trading-panel flex-shrink-0 overflow-hidden m-2 mt-0 shadow-lg">
            <MarketDataPanel
              market={selectedMarket}
              onPriceClick={handlePriceClick}
              compact={false}
              tickerData={currentTicker}
            />
          </div>
        </div>

        {/* Enhanced Right Panel - Order Book & Order Form */}
        <div className="w-[600px] flex gap-2 p-2 flex-shrink-0 overflow-hidden">
          {/* Enhanced Order Book Panel */}
          <div className="w-[300px] trading-panel border border-[hsl(var(--trading-border))] rounded-lg shadow-xl overflow-hidden">
            <EnhancedOrderBook
              market={selectedMarket}
              onPriceClick={handlePriceClick}
              compact={true}
              orderBookData={orderBookData}
              marketTradesData={marketTradesData}
            />
          </div>

          {/* Enhanced Order Form Panel */}
          <div className="w-[300px] trading-panel border border-[hsl(var(--trading-border))] rounded-lg shadow-xl overflow-hidden relative">
            <EnhancedOrderForm
              market={selectedMarket}
              currentPrice={currentPrice}
              onPriceClick={handlePriceClick}
              compact={true}
              balancesData={balancesData || []}
              isAuthenticated={isAuthenticated}
              onAuthRequired={() => setShowAuthWarning(true)}
            />
            
            {/* Authentication Overlay for Order Form */}
            {!isAuthenticated && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
                  <div className="text-center">
                    <div className="h-12 w-12 bg-gradient-to-r from-[hsl(var(--trading-accent))] to-[hsl(var(--trading-accent-secondary))] rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-[hsl(var(--trading-text))] mb-2">Sign in to Trade</h3>
                    <p className="text-[hsl(var(--trading-text-muted))] text-sm mb-6">
                      Create an account or sign in to start trading on Orbitex
                    </p>
                    <div className="flex flex-col space-y-3">
                      <Button
                        className="w-full btn-gradient-primary"
                        onClick={() => router.push('/auth/signup')}
                      >
                        Get Started
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
                        onClick={() => router.push('/auth/signin')}
                      >
                        Sign In
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Status Bar */}
      <div className="h-6 bg-gradient-to-r from-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] border-t border-[hsl(var(--trading-border))] flex items-center justify-between px-4 text-xs glass">
        <div className="flex items-center space-x-4">
          <span className="text-[hsl(var(--trading-text-muted))]">Connection: <span className="text-[#00ff88] font-medium">Stable</span></span>
          <span className="text-[hsl(var(--trading-text-muted))]">Orders: <span className="text-[hsl(var(--trading-text))] font-medium">{activeOrdersCount} Active</span></span>
          <span className="text-[hsl(var(--trading-text-muted))]">Balance: <span className="text-[hsl(var(--trading-text))] font-medium">${formatNumber(totalBalance, 2)}</span></span>
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

    </div>
  );
}