"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  Volume2,
  Clock,
  Star,
  Zap,
  Activity,
  Target,
  Rocket
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

interface MarketDataPanelProps {
  market: string;
  onPriceClick?: (price: number) => void;
  compact?: boolean;
}

export function MarketDataPanel({ 
  market, 
  onPriceClick,
  compact = false 
}: MarketDataPanelProps) {
  const [marketData, setMarketData] = useState({
    lastPrice: 43250.50,
    change24h: 2.45,
    high24h: 44100.00,
    low24h: 42800.00,
    volume: 2847.65,
    openInterest: 125000000,
    bid: 43250.00,
    ask: 43251.00,
    spread: 0.0023
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => ({
        ...prev,
        lastPrice: prev.lastPrice + (Math.random() - 0.5) * 10,
        bid: prev.bid + (Math.random() - 0.5) * 5,
        ask: prev.ask + (Math.random() - 0.5) * 5,
        volume: prev.volume + Math.random() * 10
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn(
      "bg-[#1a1a1a] h-full flex flex-col",
      compact ? "p-3" : "p-4"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Market Data</h3>
        <Badge variant="outline" className="bg-[#2a2a2a] text-[#00ff88] border-[#00ff88]/30">
          Live
        </Badge>
      </div>

      {/* Price Display */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#888888]">Last Price</span>
          <span className="text-xs text-[#888888]">{market}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white font-mono">
            ${marketData.lastPrice.toFixed(2)}
          </span>
          <div className="flex items-center gap-1">
            {marketData.change24h >= 0 ? (
              <TrendingUp className="h-4 w-4 text-[#00ff88]" />
            ) : (
              <TrendingDown className="h-4 w-4 text-[#ff4444]" />
            )}
            <span className={cn(
              "text-sm font-medium",
              marketData.change24h >= 0 ? "text-[#00ff88]" : "text-[#ff4444]"
            )}>
              {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Bid/Ask Spread */}
      <div className="mb-4 p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
        <div className="text-xs text-[#888888] mb-2">Bid/Ask Spread</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-[#888888]">Bid</div>
            <div className="text-sm font-mono text-[#ff4444]">${marketData.bid.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-[#888888]">Ask</div>
            <div className="text-sm font-mono text-[#00ff88]">${marketData.ask.toFixed(2)}</div>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-[#2a2a2a]">
          <div className="text-xs text-[#888888]">Spread</div>
          <div className="text-sm font-mono text-white">{marketData.spread.toFixed(4)}%</div>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-2 bg-[#0f0f0f] rounded border border-[#2a2a2a]">
          <div className="text-xs text-[#888888]">24h High</div>
          <div className="text-sm font-mono text-white">${marketData.high24h.toFixed(2)}</div>
        </div>
        <div className="p-2 bg-[#0f0f0f] rounded border border-[#2a2a2a]">
          <div className="text-xs text-[#888888]">24h Low</div>
          <div className="text-sm font-mono text-white">${marketData.low24h.toFixed(2)}</div>
        </div>
        <div className="p-2 bg-[#0f0f0f] rounded border border-[#2a2a2a]">
          <div className="text-xs text-[#888888]">Volume</div>
          <div className="text-sm font-mono text-white">{formatNumber(marketData.volume, 2)} BTC</div>
        </div>
        <div className="p-2 bg-[#0f0f0f] rounded border border-[#2a2a2a]">
          <div className="text-xs text-[#888888]">Open Interest</div>
          <div className="text-sm font-mono text-white">${formatNumber(marketData.openInterest, 0)}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs border-[#2a2a2a] text-[#888888] hover:text-white hover:bg-[#2a2a2a]"
          onClick={() => onPriceClick?.(marketData.bid)}
        >
          Buy at Bid
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs border-[#2a2a2a] text-[#888888] hover:text-white hover:bg-[#2a2a2a]"
          onClick={() => onPriceClick?.(marketData.ask)}
        >
          Sell at Ask
        </Button>
      </div>
    </div>
  );
}