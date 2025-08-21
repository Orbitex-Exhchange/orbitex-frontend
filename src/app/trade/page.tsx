'use client';

import React from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { TradingViewChart } from '@/components/trade/TradingViewChart';
import { EnhancedOrderBook } from '@/components/trade/EnhancedOrderBook';
import { PerformanceMonitor } from '@/components/ui/PerformanceMonitor';
import { useTradingStore } from '@/store/tradingStore';
import { useWebSocket } from '@/services/websocketService';

export default function TradePage() {
  const selectedMarket = useTradingStore((state) => state.selectedMarket);
  const websocketService = useWebSocket();

  React.useEffect(() => {
    // Subscribe to market data when component mounts
    websocketService.subscribeToMarket(selectedMarket);
    websocketService.subscribeToOrderBook(selectedMarket);
    websocketService.subscribeToTrades(selectedMarket);
    websocketService.subscribeToChartData(selectedMarket, '1h');

    return () => {
      // Cleanup subscriptions when component unmounts
      websocketService.unsubscribeFromMarket(selectedMarket);
    };
  }, [selectedMarket, websocketService]);

  return (
    <div className="min-h-screen bg-background trading-font">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chart Section - Takes up most of the space */}
          <div className="lg:col-span-3">
            <div className="trading-panel p-4 h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedMarket} Chart
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Real-time data
                  </span>
                </div>
              </div>
              <div className="chart-area h-full">
                <TradingViewChart />
              </div>
            </div>
          </div>

          {/* Order Book Section */}
          <div className="lg:col-span-1">
            <div className="trading-panel p-4 h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">
                  Order Book
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Live updates
                  </span>
                </div>
              </div>
              <div className="h-full overflow-hidden">
                <EnhancedOrderBook />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Trading Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          {/* Market Overview */}
          <div className="trading-panel p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Market Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">24h Change</span>
                <span className="text-sm font-semibold price-up">+2.45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">24h Volume</span>
                <span className="text-sm font-semibold">$1.2B</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Market Cap</span>
                <span className="text-sm font-semibold">$45.6B</span>
              </div>
            </div>
          </div>

          {/* Trading Stats */}
          <div className="trading-panel p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Trading Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Trades</span>
                <span className="text-sm font-semibold">1,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg Trade Size</span>
                <span className="text-sm font-semibold">0.05 BTC</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Spread</span>
                <span className="text-sm font-semibold">0.12%</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="trading-panel p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Recent Activity
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Buy</span>
                <span className="font-semibold price-up">0.25 BTC</span>
                <span className="text-muted-foreground">$12,500</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Sell</span>
                <span className="font-semibold price-down">0.18 BTC</span>
                <span className="text-muted-foreground">$9,000</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Buy</span>
                <span className="font-semibold price-up">0.32 BTC</span>
                <span className="text-muted-foreground">$16,000</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="trading-panel p-4">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">FPS</span>
                <span className="text-sm font-semibold text-green-500">60</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Latency</span>
                <span className="text-sm font-semibold">12ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Connection</span>
                <span className="text-sm font-semibold text-green-500">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Monitor */}
      <PerformanceMonitor position="top-right" />
    </div>
  );
}