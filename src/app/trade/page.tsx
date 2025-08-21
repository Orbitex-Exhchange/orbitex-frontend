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
import { TickerSearchPanel } from '@/components/trade/TickerSearchPanel';

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

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getUser();
      const authenticated = authService.isAuthenticated();
      
      setUser(currentUser);
      setIsAuthenticated(authenticated);
      
      if (!authenticated) {
        setShowAuthWarning(true);
        toast({
          title: "Authentication Required",
          description: "Please sign in to access trading features",
        });
      }
    };

    checkAuth();
    
    // Check auth status every 30 seconds
    const authInterval = setInterval(checkAuth, 30000);
    
    return () => clearInterval(authInterval);
  }, [toast]);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 100;
      setCurrentPrice(prev => prev + change);
      setPriceChange24h(prev => prev + (Math.random() - 0.5) * 0.1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

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
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
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
            />
          </div>

          {/* Enhanced Market Data Panel - Fixed height */}
          <div className="h-64 border-t border-[hsl(var(--trading-border))] trading-panel flex-shrink-0 overflow-hidden m-2 mt-0 shadow-lg">
            <MarketDataPanel
              market={selectedMarket}
              onPriceClick={handlePriceClick}
              compact={false}
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
            />
          </div>

          {/* Enhanced Order Form Panel */}
          <div className="w-[300px] trading-panel border border-[hsl(var(--trading-border))] rounded-lg shadow-xl overflow-hidden">
            <EnhancedOrderForm
              market={selectedMarket}
              currentPrice={currentPrice}
              onPriceClick={handlePriceClick}
              compact={true}
            />
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Status Bar */}
      <div className="h-6 bg-gradient-to-r from-[hsl(var(--trading-bg-secondary))] to-[hsl(var(--trading-bg))] border-t border-[hsl(var(--trading-border))] flex items-center justify-between px-4 text-xs glass">
        <div className="flex items-center space-x-4">
          <span className="text-[hsl(var(--trading-text-muted))]">Connection: <span className="text-[#00ff88] font-medium">Stable</span></span>
          <span className="text-[hsl(var(--trading-text-muted))]">Orders: <span className="text-[hsl(var(--trading-text))] font-medium">0 Active</span></span>
          <span className="text-[hsl(var(--trading-text-muted))]">Balance: <span className="text-[hsl(var(--trading-text))] font-medium">$0.00</span></span>
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

      {/* Enhanced Market Quick Stats Overlay */}
      <div className="fixed top-20 right-4 z-40">
        <div className="glass border border-[#2a2a2a] rounded-lg p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#00ff88]">Quick Stats</h3>
            <Star className="h-4 w-4 text-[#888888] cursor-pointer hover:text-[#00ff88] transition-colors duration-300" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888888]">Price</span>
              <span className="text-xs font-mono text-white font-medium">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888888]">24h Change</span>
              <span className={`text-xs font-mono font-medium ${priceChange24h >= 0 ? 'text-[#00ff88]' : 'text-[#ff4444]'}`}>
                {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888888]">Volume</span>
              <span className="text-xs font-mono text-white font-medium">2.8B</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Performance Indicators */}
      <div className="fixed top-20 left-4 z-40">
        <div className="glass border border-[#2a2a2a] rounded-lg p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#00ff88]">Performance</h3>
            <Activity className="h-4 w-4 text-[#888888]" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888888]">Speed</span>
              <span className="text-xs font-mono text-[#00ff88] font-medium">0.12ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888888]">Uptime</span>
              <span className="text-xs font-mono text-[#00ff88] font-medium">99.99%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888888]">Orders/s</span>
              <span className="text-xs font-mono text-white font-medium">1.2M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Trading Tools Panel */}
      <div className="fixed bottom-4 left-4 z-40">
        <div className="glass border border-[#2a2a2a] rounded-lg p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[#00ff88]">Tools</h3>
            <Settings className="h-4 w-4 text-[#888888]" />
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-[#888888] hover:text-[#00ff88] transition-colors duration-300"
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-[#888888] hover:text-[#00ff88] transition-colors duration-300"
            >
              <Rocket className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-[#888888] hover:text-[#00ff88] transition-colors duration-300"
            >
              <Zap className="h-4 w-4" />
            </Button>
          </div>
        </div>
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