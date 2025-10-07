"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useHFTStore, 
  useMarketDepth, 
  useRealTimeTrades, 
  useVolumeProfile, 
  usePriceVelocity, 
  useMarketData,
  useHFTLoading,
  useHFTError,
  hftActions 
} from '@/store/hftStore';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  Zap,
  Clock,
  DollarSign,
  Volume2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface HFTTradingPanelProps {
  market: string;
  className?: string;
}

export const HFTTradingPanel: React.FC<HFTTradingPanelProps> = ({ 
  market, 
  className = "" 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(1000); // 1 second

  // HFT Store hooks
  const marketDepth = useMarketDepth();
  const realTimeTrades = useRealTimeTrades();
  const volumeProfile = useVolumeProfile();
  const priceVelocity = usePriceVelocity();
  const marketData = useMarketData();
  const isLoading = useHFTLoading();
  const error = useHFTError();

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      hftActions.fetchAllMarketData(market);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [market, autoRefresh, refreshInterval]);

  // Initial data fetch
  useEffect(() => {
    hftActions.fetchAllMarketData(market);
  }, [market]);

  const formatPrice = (price: string) => {
    return parseFloat(price).toFixed(2);
  };

  const formatVolume = (volume: string) => {
    const num = parseFloat(volume);
    if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const getVelocityColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getVelocityIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-4 h-4" />;
      case 'down': return <TrendingDown className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <p>Error loading HFT data: {error}</p>
            <Button 
              onClick={() => hftActions.fetchAllMarketData(market)}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                High-Frequency Trading
              </CardTitle>
              <CardDescription>
                Real-time market data for {market.toUpperCase()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={autoRefresh ? "default" : "secondary"}>
                {autoRefresh ? "Auto" : "Manual"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "Pause" : "Resume"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="depth">Market Depth</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {marketData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500">Last Price</p>
                    <p className="text-2xl font-bold">
                      ${formatPrice(marketData.ticker.last)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">24h Volume</p>
                    <p className="text-2xl font-bold">
                      {formatVolume(marketData.ticker.volume)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">24h High</p>
                    <p className="text-2xl font-bold text-green-500">
                      ${formatPrice(marketData.ticker.high)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">24h Low</p>
                    <p className="text-2xl font-bold text-red-500">
                      ${formatPrice(marketData.ticker.low)}
                    </p>
                  </div>
                </div>
              )}

              {priceVelocity && (
                <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getVelocityIcon(priceVelocity.direction)}
                    <span className="font-semibold">Price Velocity</span>
                  </div>
                  <div className={`text-2xl font-bold ${getVelocityColor(priceVelocity.direction)}`}>
                    {priceVelocity.velocity.toFixed(4)}
                  </div>
                  <Badge variant={priceVelocity.direction === 'up' ? 'default' : 'destructive'}>
                    {priceVelocity.direction.toUpperCase()}
                  </Badge>
                </div>
              )}
            </TabsContent>

            <TabsContent value="depth" className="space-y-4">
              {marketData?.order_book && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-red-500 mb-2">Asks (Sell Orders)</h3>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {marketData.order_book.asks.slice(0, 10).map(([price, volume], index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-red-500">${formatPrice(price)}</span>
                          <span>{formatVolume(volume)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-500 mb-2">Bids (Buy Orders)</h3>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {marketData.order_book.bids.slice(0, 10).map(([price, volume], index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-green-500">${formatPrice(price)}</span>
                          <span>{formatVolume(volume)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="trades" className="space-y-4">
              <div className="max-h-64 overflow-y-auto">
                {realTimeTrades.slice(0, 20).map((trade) => (
                  <div key={trade.id} className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2">
                      {trade.side === 'buy' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-mono">${formatPrice(trade.price)}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatVolume(trade.volume)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(trade.created_at * 1000).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              {volumeProfile && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Volume Profile
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(volumeProfile.volume_profile).map(([time, volume]) => (
                      <div key={time} className="flex items-center gap-2">
                        <span className="text-sm w-20">{time}</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(volume / volumeProfile.total_volume) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm w-16">{formatVolume(volume.toString())}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading HFT data...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
