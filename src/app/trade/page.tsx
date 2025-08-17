"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Rocket
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { TradingViewChart } from '@/components/trade/TradingViewChart';
import { EnhancedOrderBook } from '@/components/trade/EnhancedOrderBook';
import { EnhancedOrderForm } from '@/components/trade/EnhancedOrderForm';
import { MarketDataPanel } from '@/components/trade/MarketDataPanel';
import { useToast } from '@/hooks/use-toast';

export default function TradingPage() {
  const [selectedMarket, setSelectedMarket] = useState('BTC-USDT');
  const [currentPrice, setCurrentPrice] = useState(43250.50);
  const [priceChange24h, setPriceChange24h] = useState(2.45);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

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

  return (
    <div className="h-screen trading-layout flex flex-col trading-font overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]">
      {/* Enhanced Top Status Bar */}
      <div className="h-8 bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border-b border-[#2a2a2a] flex items-center justify-between px-4 text-xs glass">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gradient-to-r from-[#00ff88] to-[#00cc6a] rounded-full animate-pulse shadow-lg"></div>
            <span className="text-gradient-primary font-medium">Live</span>
          </div>
          <span className="text-[#888888]">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="text-[#888888] hover:text-white h-6 px-2 transition-all duration-300"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-[#888888]">Ping:</span>
            <span className="text-gradient-primary font-mono font-medium">12ms</span>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Enhanced Center Panel - Chart & Market Data */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Enhanced Chart Area - Fixed height with proper overflow */}
          <div className="flex-1 min-h-0 relative border border-[#2a2a2a] rounded-lg m-2 overflow-hidden shadow-xl">
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
          <div className="h-64 border-t border-[#2a2a2a] trading-panel flex-shrink-0 overflow-hidden m-2 mt-0 shadow-lg">
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
          <div className="w-[300px] trading-panel border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden">
            <EnhancedOrderBook
              market={selectedMarket}
              onPriceClick={handlePriceClick}
              compact={true}
            />
          </div>

          {/* Enhanced Order Form Panel */}
          <div className="w-[300px] trading-panel border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden">
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
      <div className="h-6 bg-gradient-to-r from-[#1a1a1a] to-[#0f0f0f] border-t border-[#2a2a2a] flex items-center justify-between px-4 text-xs glass">
        <div className="flex items-center space-x-4">
          <span className="text-[#888888]">Connection: <span className="text-gradient-primary font-medium">Stable</span></span>
          <span className="text-[#888888]">Orders: <span className="text-white font-medium">0 Active</span></span>
          <span className="text-[#888888]">Balance: <span className="text-white font-medium">$0.00</span></span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-[#888888]">24h P&L: <span className="text-gradient-primary font-medium">+$0.00</span></span>
          <span className="text-[#888888]">Total P&L: <span className="text-gradient-primary font-medium">+$0.00</span></span>
        </div>
      </div>

      {/* Enhanced Floating Action Buttons */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
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
          className="border-[#2a2a2a] text-[#d1d5db] hover:text-white hover:bg-[#1a1a1a] rounded-full shadow-2xl w-12 h-12 p-0 hover:scale-110 transition-all duration-300"
          onClick={() => {
            toast({
              title: "Settings",
              description: "Trading settings panel opened",
            });
          }}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Enhanced Market Quick Stats Overlay */}
      <div className="fixed top-20 right-4 z-40">
        <div className="glass border border-[#2a2a2a] rounded-lg p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gradient-primary">Quick Stats</h3>
            <Star className="h-4 w-4 text-[#888888] cursor-pointer hover:text-gradient-primary transition-colors duration-300" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888888]">Price</span>
              <span className="text-xs font-mono text-white font-medium">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888888]">24h Change</span>
              <span className={`text-xs font-mono font-medium ${priceChange24h >= 0 ? 'text-gradient-primary' : 'text-[#ff4444]'}`}>
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
            <h3 className="text-sm font-semibold text-gradient-primary">Performance</h3>
            <Activity className="h-4 w-4 text-[#888888]" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888888]">Speed</span>
              <span className="text-xs font-mono text-gradient-primary font-medium">0.12ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#888888]">Uptime</span>
              <span className="text-xs font-mono text-gradient-primary font-medium">99.99%</span>
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
            <h3 className="text-sm font-semibold text-gradient-primary">Tools</h3>
            <Settings className="h-4 w-4 text-[#888888]" />
          </div>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-[#888888] hover:text-gradient-primary transition-colors duration-300"
            >
              <Target className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-[#888888] hover:text-gradient-primary transition-colors duration-300"
            >
              <Rocket className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-[#888888] hover:text-gradient-primary transition-colors duration-300"
            >
              <Zap className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}