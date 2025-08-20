"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
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
  timestamp: Date;
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

export function EnhancedOrderBook({ 
  market, 
  onPriceClick,
  compact = false 
}: OrderBookProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'orderbook' | 'trades'>('orderbook');
  const [grouping, setGrouping] = useState(1);
  const [depth, setDepth] = useState(compact ? 10 : 20);
  const [showSizePercent, setShowSizePercent] = useState(false);
  const [showDepthChart, setShowDepthChart] = useState(true);
  const [animate, setAnimate] = useState(true);
  const [lastPrice, setLastPrice] = useState(43250.50);
  const [priceChange, setPriceChange] = useState(0);

  // Generate mock order book data
  const orderBookData = useMemo(() => {
    const generateOrderBook = (): OrderBookData => {
      const basePrice = lastPrice;
      const asks: OrderBookEntry[] = [];
      const bids: OrderBookEntry[] = [];
      let runningTotalAsks = 0;
      let runningTotalBids = 0;

      // Generate asks (sell orders)
      for (let i = 0; i < depth; i++) {
        const price = basePrice + (i + 1) * grouping + Math.random() * grouping * 0.5;
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
      for (let i = 0; i < depth; i++) {
        const price = basePrice - (i + 1) * grouping - Math.random() * grouping * 0.5;
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

      const spread = asks[0]?.price - bids[0]?.price || 0;
      const spreadPercentage = ((spread / basePrice) * 100) || 0;

      return {
        asks: asks.sort((a, b) => b.price - a.price), // Highest price first (descending)
        bids: bids.sort((a, b) => b.price - a.price), // Highest price first (descending)
        spread,
        spreadPercentage
      };
    };

    return generateOrderBook();
  }, [lastPrice, grouping, depth]);

  // Generate mock recent trades data
  const recentTrades = useMemo(() => {
    const trades: TradeEntry[] = [];
    const basePrice = lastPrice;
    
    for (let i = 0; i < 50; i++) {
      const price = basePrice + (Math.random() - 0.5) * 100;
      const size = Math.random() * 5 + 0.01;
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      const timestamp = new Date(Date.now() - Math.random() * 3600000); // Last hour
      
      trades.push({
        id: `trade-${i}`,
        price,
        size,
        side,
        timestamp
      });
    }
    
    return trades.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [lastPrice]);

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
  }, [priceChange]);

  const handlePriceClick = (price: number) => {
    onPriceClick?.(price);
  };

  const OrderRow = ({ 
    entry, 
    type, 
    index 
  }: { 
    entry: OrderBookEntry; 
    type: 'ask' | 'bid'; 
    index: number;
  }) => {
    const isAsk = type === 'ask';
    const priceColor = isAsk ? 'text-red-400' : 'text-green-400';
    const bgColor = isAsk ? 'bg-red-500/10' : 'bg-green-500/10';
    
    return (
      <div 
        className={cn(
          "relative group cursor-pointer transition-all duration-200 hover:bg-[hsl(var(--trading-bg-tertiary))]/50",
          animate && "hover:scale-[1.02]"
        )}
        onClick={() => handlePriceClick(entry.price)}
      >
        {/* Depth visualization bar */}
        {showDepthChart && (
          <div 
            className={cn(
              "absolute inset-y-0 transition-all duration-300",
              isAsk ? "right-0 bg-red-500/20" : "left-0 bg-green-500/20"
            )}
            style={{ 
              width: `${entry.percentage}%`,
              [isAsk ? 'right' : 'left']: 0
            }}
          />
        )}
        
        {/* Order data */}
        <div className="relative z-10 grid grid-cols-3 gap-2 py-1.5 px-3" style={{ fontSize: '12px' }}>
          <div className={cn("font-mono font-medium", priceColor)}>
            {formatNumber(entry.price, 2)}
          </div>
          <div className="text-[hsl(var(--trading-text))] text-right font-mono">
            {showSizePercent 
              ? `${((entry.size / orderBookData.asks[0]?.total || 1) * 100).toFixed(1)}%`
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
  };

  const TradeRow = ({ trade }: { trade: TradeEntry }) => {
    const isBuy = trade.side === 'buy';
    const priceColor = isBuy ? 'text-green-400' : 'text-red-400';
    const timeAgo = Math.floor((Date.now() - trade.timestamp.getTime()) / 1000);
    
    const formatTimeAgo = (seconds: number) => {
      if (seconds < 60) return `${seconds}s`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
      return `${Math.floor(seconds / 3600)}h`;
    };

    return (
      <div 
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:bg-[hsl(var(--trading-bg-tertiary))]/50",
          animate && "hover:scale-[1.02]"
        )}
        onClick={() => handlePriceClick(trade.price)}
      >
        <div className="grid grid-cols-3 gap-2 py-1.5 px-3" style={{ fontSize: '12px' }}>
          <div className={cn("font-mono font-medium", priceColor)}>
            {formatNumber(trade.price, 2)}
          </div>
          <div className="text-[hsl(var(--trading-text))] text-right font-mono">
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
  };

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
          <div className="flex items-center justify-between p-3 border-b border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg))]">
            {/* Price Grouping */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[hsl(var(--trading-text-muted))]">Group:</span>
              <div className="flex border border-[hsl(var(--trading-border))] rounded overflow-hidden">
                {priceGroupings.slice(0, 4).map((group) => (
                  <Button
                    key={group.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => setGrouping(group.value)}
                    className={cn(
                      "h-6 px-2 text-xs border-r border-[hsl(var(--trading-border))] last:border-r-0",
                      grouping === group.value 
                        ? "bg-[hsl(var(--trading-accent))] text-black" 
                        : "text-[hsl(var(--trading-text-secondary))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
                    )}
                  >
                    {group.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Column Headers */}
          <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-[hsl(var(--trading-text-muted))] bg-[hsl(var(--trading-bg))] border-b border-[hsl(var(--trading-border))]">
            <div>Price ({market.split('-')[1] || 'USDT'})</div>
            <div className="text-right">Size ({market.split('-')[0] || 'BTC'})</div>
            <div className="text-right">Total</div>
          </div>

          {/* Order Book Content */}
          <div className="overflow-hidden flex-1 flex flex-col">
            {/* Asks (Sell Orders) - Red */}
            <div className="flex-1 overflow-y-auto bg-red-500/5 border-b border-[hsl(var(--trading-border))]">
              {orderBookData.asks.slice(0, Math.ceil(depth / 2)).map((ask, index) => (
                <OrderRow 
                  key={`ask-${ask.price}`}
                  entry={ask} 
                  type="ask" 
                  index={index}
                />
              ))}
            </div>

            {/* Spread Display */}
            <div className="relative py-3 px-3 bg-[hsl(var(--trading-bg))] border-b border-[hsl(var(--trading-border))] border-t border-[hsl(var(--trading-border))] flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[hsl(var(--trading-text-muted))]">Spread:</span>
                  <span 
                    className="font-mono font-bold text-[hsl(var(--trading-accent))] transition-colors duration-1000"
                    style={{ fontSize: '14px' }}
                  >
                    ${orderBookData.spread.toFixed(2)}
                  </span>
                  <span className="text-xs text-[hsl(var(--trading-text-muted))]">
                    ({orderBookData.spreadPercentage.toFixed(3)}%)
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-[hsl(var(--trading-accent))] animate-pulse" />
                  <span className="text-xs text-[hsl(var(--trading-text-muted))]">Live</span>
                </div>
              </div>
            </div>

            {/* Bids (Buy Orders) - Green */}
            <div className="flex-1 overflow-y-auto bg-green-500/5">
              {orderBookData.bids.slice(0, Math.ceil(depth / 2)).map((bid, index) => (
                <OrderRow 
                  key={`bid-${bid.price}`}
                  entry={bid} 
                  type="bid" 
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between p-3 border-t border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg))] text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[hsl(var(--trading-text-muted))]">Ask Sum:</span>
                <span className="text-red-400 font-medium">
                  {formatNumber(orderBookData.asks.reduce((sum, ask) => sum + ask.size, 0), 2)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[hsl(var(--trading-text-muted))]">Bid Sum:</span>
                <span className="text-green-400 font-medium">
                  {formatNumber(orderBookData.bids.reduce((sum, bid) => sum + bid.size, 0), 2)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[hsl(var(--trading-text-muted))]">Depth: {depth}</span>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setDepth(Math.max(5, depth - 5))}
                  className="h-5 w-5 p-0 text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))]"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setDepth(Math.min(50, depth + 5))}
                  className="h-5 w-5 p-0 text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))]"
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
          <div className="grid grid-cols-3 gap-2 px-3 py-2 text-xs text-[hsl(var(--trading-text-muted))] bg-[hsl(var(--trading-bg))] border-b border-[hsl(var(--trading-border))]">
            <div>Price ({market.split('-')[1] || 'USDT'})</div>
            <div className="text-right">Size ({market.split('-')[0] || 'BTC'})</div>
            <div className="text-right">Time</div>
          </div>

          {/* Recent Trades Content */}
          <div className="overflow-hidden flex-1">
            <div className="overflow-y-auto h-full">
              {recentTrades.slice(0, 50).map((trade) => (
                <TradeRow key={trade.id} trade={trade} />
              ))}
            </div>
          </div>

          {/* Recent Trades Footer */}
          <div className="flex items-center justify-between p-3 border-t border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg))] text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[hsl(var(--trading-text-muted))]">Total Trades:</span>
                <span className="text-[hsl(var(--trading-text))] font-medium">
                  {recentTrades.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[hsl(var(--trading-text-muted))]">Last Price:</span>
                <span className="text-[hsl(var(--trading-accent))] font-medium">
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
}