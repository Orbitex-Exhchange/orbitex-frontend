"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useTradingStore, useOrderBookData, useRecentTrades, useOrderBookSettings } from '@/store/tradingStore';
import { useWebSocket } from '@/services/websocketService';
import { 
  ChevronUp, 
  ChevronDown,
  Settings,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  BarChart3,
  RefreshCw,
  Zap,
  Clock,
  BookOpen
} from 'lucide-react';
import { cn, formatNumber } from '../../lib/utils';
import { env } from '@/lib/env';

interface OrderBookProps {
  market: string;
  onPriceClick?: (price: number) => void;
  compact?: boolean;
}

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
  percentage: number;
}

interface OrderBookData {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  spread: number;
  spreadPercentage: number;
}

interface TradeEntry {
  id: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

const priceGroupings = [
  { value: 0.01, label: '0.01' },
  { value: 0.1, label: '0.1' },
  { value: 1, label: '1' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 50, label: '50' },
  { value: 100, label: '100' }
];

export const EnhancedOrderBook = React.memo(({ 
  market = 'BTC-USDT', 
  onPriceClick,
  compact = false 
}: OrderBookProps) => {
  const { theme } = useTheme();
  
  // Zustand store hooks
  const orderBookData = useOrderBookData();
  const recentTrades = useRecentTrades();
  const orderBookSettings = useOrderBookSettings();
  const { updateOrderBookSettings } = useTradingStore();
  
  // WebSocket service
  const websocketService = useWebSocket();
  
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook');
  const [showSizePercent, setShowSizePercent] = useState(false);
  const [showDepthChart, setShowDepthChart] = useState(true);
  const [animate, setAnimate] = useState(true);
  const [lastPrice, setLastPrice] = useState(43250.50);
  const [priceChange, setPriceChange] = useState(0);

  // Virtualization refs
  const orderBookParentRef = React.useRef<HTMLDivElement>(null);
  const tradesParentRef = React.useRef<HTMLDivElement>(null);

  // Generate mock order book data if no real data
  const processedOrderBookData = useMemo(() => {
    console.log('Processing order book data:', { orderBookData, hasData: !!orderBookData });
    if (orderBookData && (orderBookData.bids.length > 0 || orderBookData.asks.length > 0)) {
      console.log('Using real order book data:', orderBookData);
      return orderBookData;
    }

    // Fallback to mock data
    const generateOrderBook = (): OrderBookData => {
      const basePrice = lastPrice;
      const asks: OrderBookEntry[] = [];
      const bids: OrderBookEntry[] = [];
      let runningTotalAsks = 0;
      let runningTotalBids = 0;

      // Generate asks (sell orders)
      for (let i = 0; i < orderBookSettings.depth; i++) {
        const price = basePrice + (i + 1) * orderBookSettings.groupBy + Math.random() * orderBookSettings.groupBy * 0.5;
        const size = Math.random() * 10 + 0.1;
        runningTotalAsks += size;
        asks.push({
          price,
          size,
          total: runningTotalAsks,
          percentage: 0 // Will be calculated later
        });
      }

      // Generate bids (buy orders)
      for (let i = 0; i < orderBookSettings.depth; i++) {
        const price = basePrice - (i + 1) * orderBookSettings.groupBy - Math.random() * orderBookSettings.groupBy * 0.5;
        const size = Math.random() * 10 + 0.1;
        runningTotalBids += size;
        bids.push({
          price,
          size,
          total: runningTotalBids,
          percentage: 0 // Will be calculated later
        });
      }

      // Calculate percentages
      const maxTotal = Math.max(runningTotalAsks, runningTotalBids);
      asks.forEach(ask => ask.percentage = (ask.total / maxTotal) * 100);
      bids.forEach(bid => bid.percentage = (bid.total / maxTotal) * 100);

      const spread = (asks[0]?.price || 0) - (bids[0]?.price || 0);
      const spreadPercentage = ((spread / basePrice) * 100) || 0;

      return {
        asks: asks.sort((a, b) => b.price - a.price), // Highest price first (descending)
        bids: bids.sort((a, b) => b.price - a.price), // Highest price first (descending)
        spread,
        spreadPercentage
      };
    };

    return generateOrderBook();
  }, [orderBookData, lastPrice, orderBookSettings.groupBy, orderBookSettings.depth]);

  // Generate mock recent trades data if no real data
  const processedRecentTrades = useMemo(() => {
    if (recentTrades.length > 0) {
      return recentTrades;
    }

    // Fallback to mock data
    const trades: TradeEntry[] = [];
    const basePrice = lastPrice;
    
    for (let i = 0; i < 50; i++) {
      const price = basePrice + (Math.random() - 0.5) * 100;
      const size = Math.random() * 5 + 0.01;
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      const timestamp = Date.now() - Math.random() * 3600000; // Last hour
      
      trades.push({
        id: `trade-${i}`,
        price,
        size,
        side,
        timestamp
      });
    }
    
    return trades.sort((a, b) => b.timestamp - a.timestamp);
  }, [recentTrades, lastPrice]);

  // Virtualization for bids (buy orders) - TOP of panel
  const bidsVirtualizer = useVirtualizer({
    count: Math.min(processedOrderBookData.bids.length, Math.ceil(orderBookSettings.depth / 2)),
    getScrollElement: () => orderBookParentRef.current,
    estimateSize: () => 32,
    overscan: 5,
  });

  // Virtualization for asks (sell orders) - BOTTOM of panel
  const asksVirtualizer = useVirtualizer({
    count: Math.min(processedOrderBookData.asks.length, Math.ceil(orderBookSettings.depth / 2)),
    getScrollElement: () => orderBookParentRef.current,
    estimateSize: () => 32,
    overscan: 5,
  });

  // Virtualization for trades
  const tradesVirtualizer = useVirtualizer({
    count: processedRecentTrades.length,
    getScrollElement: () => tradesParentRef.current,
    estimateSize: () => 32, // Estimated row height
    overscan: 5,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 20;
      setLastPrice(prev => {
        const newPrice = prev + change;
        setPriceChange(change);
        return newPrice;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Reset price change after animation
  useEffect(() => {
    if (priceChange !== 0) {
      const timeout = setTimeout(() => setPriceChange(0), 1000);
      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [priceChange]);

  // Subscribe to market data
  useEffect(() => {
    websocketService.subscribeToOrderBook(market, () => {});
    websocketService.subscribeToTrades(market, () => {});
  }, [market, websocketService]);

  // Fetch order book from Orbitex v2 REST (public)
  useEffect(() => {
    const apiBase = env.NEXT_PUBLIC_API_URL;
    const symbol = (market || '').replace('-', '').toLowerCase();
    console.log('Order book effect triggered:', { market, symbol, apiBase });
    if (!symbol) return;

    const fetchOrderBook = async () => {
      try {
        const limit = Math.max(orderBookSettings.depth, 20);
        const url = `${apiBase}/api/v2/public/markets/${symbol}/order-book?limit=${limit}`;
        console.log('Fetching order book from:', url);
        
        const res = await fetch(url);
        if (!res.ok) {
          console.error('Order book request failed:', res.status, res.statusText);
          throw new Error('order-book request failed');
        }
        
        const data = await res.json();
        console.log('Order book data received:', data);
        
        // Check if data is inverted (bids higher than asks)
        const rawAsks = data.asks || [];
        const rawBids = data.bids || [];
        
        // If bids are higher than asks, they might be swapped
        const firstBidPrice = rawBids[0] ? parseFloat(rawBids[0][0]) : 0;
        const firstAskPrice = rawAsks[0] ? parseFloat(rawAsks[0][0]) : 0;
        
        let asksRaw: [string, string][];
        let bidsRaw: [string, string][];
        
        if (firstBidPrice > firstAskPrice && firstBidPrice > 0 && firstAskPrice > 0) {
          console.log('Data appears inverted, swapping bids and asks');
          asksRaw = rawBids;
          bidsRaw = rawAsks;
        } else {
          asksRaw = rawAsks;
          bidsRaw = rawBids;
        }

        let runningAsks = 0;
        let runningBids = 0;
        let asks = asksRaw.map(([p, a]) => {
          const price = parseFloat(p);
          const size = parseFloat(a);
          runningAsks += size;
          return { price, size, total: runningAsks, percentage: 0 } as OrderBookEntry;
        });
        let bids = bidsRaw.map(([p, a]) => {
          const price = parseFloat(p);
          const size = parseFloat(a);
          runningBids += size;
          return { price, size, total: runningBids, percentage: 0 } as OrderBookEntry;
        });

        // Sort: bids descending by price (highest first); asks ascending by price (lowest first)
        bids = bids.sort((a, b) => b.price - a.price);
        asks = asks.sort((a, b) => a.price - b.price);
        
        console.log('Sorted bids (highest first):', bids.slice(0, 3));
        console.log('Sorted asks (lowest first):', asks.slice(0, 3));

        const maxTotal = Math.max(runningAsks, runningBids, 1);
        asks.forEach(x => (x.percentage = (x.total / maxTotal) * 100));
        bids.forEach(x => (x.percentage = (x.total / maxTotal) * 100));

        const bestBid = bids[0]?.price || 0;
        const bestAsk = asks[0]?.price || 0;
        const spread = bestAsk && bestBid ? Math.max(0, bestAsk - bestBid) : 0;
        const mid = bestAsk && bestBid ? (bestAsk + bestBid) / 2 : (bids[0]?.price || asks[0]?.price || lastPrice);
        const spreadPercentage = mid ? (spread / mid) * 100 : 0;
        setLastPrice(mid || lastPrice);

        const orderBookData = {
          // For top list we want bids (buy orders)
          bids,
          // For bottom list we want asks (sell orders)
          asks,
          spread,
          spreadPercentage,
        };

        console.log('Setting order book data:', orderBookData);
        useTradingStore.getState().setOrderBookData(orderBookData);
      } catch (e) {
        console.error('Failed to fetch order book:', e);
        // keep mock fallback silently
      }
    };

    fetchOrderBook();
    const id = setInterval(fetchOrderBook, 3000);
    return () => clearInterval(id);
  }, [market, orderBookSettings.depth, lastPrice]);

  const handlePriceClick = useCallback((price: number) => {
    onPriceClick?.(price);
  }, [onPriceClick]);

  // Memoized order row component
  const OrderRow = React.memo(({ 
    entry, 
    type, 
    index 
  }: { 
    entry: OrderBookEntry; 
    type: 'ask' | 'bid'; 
    index: number;
  }) => {
    const isAsk = type === 'ask';
    const priceColor = isAsk ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';
    const depthColor = isAsk ? 'bg-red-500/15 dark:bg-red-500/20' : 'bg-green-500/15 dark:bg-green-500/20';
    
    return (
      <div 
        className={cn(
          "relative group cursor-pointer transition-all duration-200 hover:bg-[hsl(var(--trading-bg-tertiary))] border-l-2 border-transparent hover:border-[hsl(var(--trading-accent))]/30",
          animate ? "hover:scale-[1.01]" : ""
        )}
        onClick={() => handlePriceClick(entry.price)}
        style={{ height: '32px' }}
      >
        {/* Depth visualization bar */}
        {showDepthChart && (
          <div 
            className={cn(
              "absolute inset-y-0 transition-all duration-300",
              depthColor,
              isAsk ? "right-0" : "left-0"
            )}
            style={{ 
              width: `${entry.percentage}%`,
              [isAsk ? 'right' : 'left']: 0
            }}
          />
        )}
        
        {/* Order data */}
        <div className="relative z-10 grid grid-cols-3 gap-2 py-1.5 px-3" style={{ fontSize: '12px' }}>
          <div className={cn("font-mono font-semibold", priceColor)}>
            {formatNumber(entry.price, 2)}
          </div>
          <div className="text-[hsl(var(--trading-text))] text-right font-mono font-medium">
            {showSizePercent 
              ? `${((entry.size / (processedOrderBookData.asks[0]?.total || 1)) * 100).toFixed(1)}%`
              : formatNumber(entry.size, 4)
            }
          </div>
          <div className="text-[hsl(var(--trading-text-muted))] text-right font-mono text-xs">
            {formatNumber(entry.total, 2)}
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[hsl(var(--trading-accent))]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    );
  });

  OrderRow.displayName = 'OrderRow';

  // Memoized trade row component
  const TradeRow = React.memo(({ trade }: { trade: TradeEntry }) => {
    const isBuy = trade.side === 'buy';
    const priceColor = isBuy ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    const timeAgo = Math.floor((Date.now() - trade.timestamp) / 1000);
    
    const formatTimeAgo = (seconds: number) => {
      if (seconds < 60) return `${seconds}s`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
      return `${Math.floor(seconds / 3600)}h`;
    };

    return (
      <div 
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:bg-[hsl(var(--trading-bg-tertiary))] border-l-2 border-transparent hover:border-[hsl(var(--trading-accent))]/30",
          animate ? "hover:scale-[1.01]" : ""
        )}
        onClick={() => handlePriceClick(trade.price)}
        style={{ height: '32px' }}
      >
        <div className="grid grid-cols-3 gap-2 py-1.5 px-3" style={{ fontSize: '12px' }}>
          <div className={cn("font-mono font-semibold", priceColor)}>
            {formatNumber(trade.price, 2)}
          </div>
          <div className="text-[hsl(var(--trading-text))] text-right font-mono font-medium">
            {formatNumber(trade.size, 4)}
          </div>
          <div className="text-[hsl(var(--trading-text-muted))] text-right font-mono text-xs">
            {formatTimeAgo(timeAgo)}
          </div>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[hsl(var(--trading-accent))]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    );
  });

  TradeRow.displayName = 'TradeRow';

  return (
    <div className={cn(
      "bg-[hsl(var(--trading-bg-secondary))] flex flex-col h-full"
    )}>
      {/* Interactive Tab Navigation - Moved to top */}
      <div className="flex border-b border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg))]">
        <button
          onClick={() => {
            console.log('Order Book tab clicked');
            setActiveTab('orderbook');
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 relative cursor-pointer z-10",
            activeTab === 'orderbook'
              ? "text-[hsl(var(--trading-accent))] bg-[hsl(var(--trading-bg-secondary))] border-b-2 border-[hsl(var(--trading-accent))]"
              : "text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]/50"
          )}
        >
          <BookOpen className="h-4 w-4" />
          Order Book
        </button>
        <button
          onClick={() => {
            console.log('Recent Trades tab clicked');
            setActiveTab('trades');
          }}
          className={cn(
            "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 relative cursor-pointer z-10",
            activeTab === 'trades'
              ? "text-[hsl(var(--trading-accent))] bg-[hsl(var(--trading-bg-secondary))] border-b-2 border-[hsl(var(--trading-accent))]"
              : "text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]/50"
          )}
        >
          <Clock className="h-4 w-4" />
          Recent Trades
        </button>
      </div>

      {/* Header with Controls - Now below tabs */}
      <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--trading-border))]">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text-secondary))]">
            {market}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowDepthChart(!showDepthChart)}
            className={cn(
              "h-7 w-7 p-0",
              showDepthChart ? "text-[hsl(var(--trading-accent))]" : "text-[hsl(var(--trading-text-muted))]"
            )}
            title="Toggle Depth Chart"
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowSizePercent(!showSizePercent)}
            className={cn(
              "h-7 w-7 p-0",
              showSizePercent ? "text-[hsl(var(--trading-accent))]" : "text-[hsl(var(--trading-text-muted))]"
            )}
            title="Toggle Size Percentage"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))]">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))]">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'orderbook' ? (
        <>
          {/* Controls */}
          <div className="flex items-center justify-between p-3 border-b border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))]">
            {/* Price Grouping */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[hsl(var(--trading-text-secondary))]">Group:</span>
              <div className="flex border border-[hsl(var(--trading-border))] rounded overflow-hidden">
                {priceGroupings.slice(0, 4).map((group) => (
                  <Button
                    key={group.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => updateOrderBookSettings({ groupBy: group.value })}
                    className={cn(
                      "h-6 px-2 text-xs border-r border-[hsl(var(--trading-border))] last:border-r-0 font-medium",
                      orderBookSettings.groupBy === group.value 
                        ? "bg-[hsl(var(--trading-accent))] text-white dark:text-black" 
                        : "text-[hsl(var(--trading-text-secondary))] hover:bg-[hsl(var(--trading-bg-tertiary))] hover:text-[hsl(var(--trading-text))]"
                    )}
                  >
                    {group.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs font-medium text-[hsl(var(--trading-text-secondary))] bg-[hsl(var(--trading-bg-secondary))] border-b border-[hsl(var(--trading-border))]">
            <div>Price ({market?.split('-')?.[1] || 'USDT'})</div>
            <div className="text-right">Size ({market?.split('-')?.[0] || 'BTC'})</div>
            <div className="text-right">Total</div>
          </div>

          {/* Order Book Content with Virtualization */}
          <div className="overflow-hidden flex-1 flex flex-col">
            {/* Bids (Buy Orders) - Green - ABOVE SPREAD */}
            <div className="flex-1 overflow-hidden border-b border-[hsl(var(--trading-border))]">
              <div className="h-full overflow-auto">
                <div
                  style={{
                    height: `${bidsVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {bidsVirtualizer.getVirtualItems().map((virtualRow) => {
                    const entry = processedOrderBookData.bids[virtualRow.index];
                    
                    if (!entry) return null;
                    
                    return (
                      <div
                        key={virtualRow.index}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <OrderRow 
                          entry={entry} 
                          type="bid" 
                          index={virtualRow.index}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Spread Display */}
            <div className="relative py-3 px-3 bg-[hsl(var(--trading-bg-secondary))] border-b border-[hsl(var(--trading-border))] border-t border-[hsl(var(--trading-border))] flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[hsl(var(--trading-text-secondary))]">Spread:</span>
                  <span 
                    className="font-mono font-bold text-[hsl(var(--trading-accent))] transition-colors duration-1000"
                    style={{ fontSize: '14px' }}
                  >
                    ${processedOrderBookData.spread.toFixed(2)}
                  </span>
                  <span className="text-xs text-[hsl(var(--trading-text-muted))]">
                    ({processedOrderBookData.spreadPercentage.toFixed(3)}%)
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-[hsl(var(--trading-accent))] animate-pulse" />
                  <span className="text-xs text-[hsl(var(--trading-text-muted))]">Live</span>
                </div>
              </div>
            </div>

            {/* Asks (Sell Orders) - Red - BELOW SPREAD */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-auto">
                <div
                  style={{
                    height: `${asksVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {asksVirtualizer.getVirtualItems().map((virtualRow) => {
                    const entry = processedOrderBookData.asks[virtualRow.index];
                    
                    if (!entry) return null;
                    
                    return (
                      <div
                        key={virtualRow.index}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <OrderRow 
                          entry={entry} 
                          type="ask" 
                          index={virtualRow.index}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between p-3 border-t border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[hsl(var(--trading-text-secondary))] font-medium">Ask Sum:</span>
                <span className="text-red-500 dark:text-red-400 font-semibold">
                  {formatNumber(processedOrderBookData.asks.reduce((sum, ask) => sum + ask.size, 0), 2)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[hsl(var(--trading-text-secondary))] font-medium">Bid Sum:</span>
                <span className="text-green-500 dark:text-green-400 font-semibold">
                  {formatNumber(processedOrderBookData.bids.reduce((sum, bid) => sum + bid.size, 0), 2)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[hsl(var(--trading-text-secondary))] font-medium">Depth: {orderBookSettings.depth}</span>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => updateOrderBookSettings({ depth: Math.max(5, orderBookSettings.depth - 5) })}
                  className="h-5 w-5 p-0 text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => updateOrderBookSettings({ depth: Math.min(50, orderBookSettings.depth + 5) })}
                  className="h-5 w-5 p-0 text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Recent Trades Column Headers */}
          <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs font-medium text-[hsl(var(--trading-text-secondary))] bg-[hsl(var(--trading-bg-secondary))] border-b border-[hsl(var(--trading-border))]">
            <div>Price ({market.split('-')[1] || 'USDT'})</div>
            <div className="text-right">Size ({market.split('-')[0] || 'BTC'})</div>
            <div className="text-right">Time</div>
          </div>

          {/* Recent Trades Content with Virtualization */}
          <div className="overflow-hidden flex-1">
            <div ref={tradesParentRef} className="h-full overflow-auto">
              <div
                style={{
                  height: `${tradesVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {tradesVirtualizer.getVirtualItems().map((virtualRow) => {
                  const trade = processedRecentTrades[virtualRow.index];
                  
                  if (!trade) return null;
                  
                  return (
                    <div
                      key={virtualRow.index}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      <TradeRow trade={trade} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Trades Footer */}
          <div className="flex items-center justify-between p-3 border-t border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[hsl(var(--trading-text-secondary))] font-medium">Total Trades:</span>
                <span className="text-[hsl(var(--trading-text))] font-semibold">
                  {processedRecentTrades.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[hsl(var(--trading-text-secondary))] font-medium">Last Price:</span>
                <span className="text-[hsl(var(--trading-accent))] font-semibold">
                  ${lastPrice.toFixed(2)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-[hsl(var(--trading-accent))] animate-pulse" />
              <span className="text-[hsl(var(--trading-text-muted))]">Live</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

EnhancedOrderBook.displayName = 'EnhancedOrderBook';