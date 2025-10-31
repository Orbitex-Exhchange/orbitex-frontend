"use client";

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw,
  AlertTriangle,
  Clock,
  DollarSign,
  Lock
} from 'lucide-react';
import { cn, formatNumber, formatCurrency } from '../../lib/utils';
import { useTrades } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface TradesTableProps {
  market?: string;
  compact?: boolean;
}

export function TradesTable({ market, compact = false }: TradesTableProps) {
  const { toast } = useToast();

  // API hooks - Use authenticated user trades endpoint
  const { data: tradesData = [], isLoading, error, refetch } = useTrades(
    market ? {
      market,
      limit: 100,
      order_by: 'desc'
    } : {
      limit: 100,
      order_by: 'desc'
    }
  );
  
  // Transform API data to expected format - authenticated trades already have correct structure
  const trades = Array.isArray(tradesData) ? tradesData.map((trade: any) => ({
    id: trade.id,
    market: trade.market || market,
    side: trade.side || 'buy',
    price: trade.price,
    amount: trade.amount || trade.volume,
    total: trade.total || (parseFloat(trade.price || '0') * parseFloat(trade.amount || trade.volume || '0')).toString(),
    fee_amount: trade.fee_amount || '0',
    fee_currency: trade.fee_currency || 'USDT',
    created_at: trade.created_at
  })) : [];

  const formatTradeTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatTradeDate = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const getTradeSideColor = (side: string) => {
    return side === 'buy' ? 'text-green-400' : 'text-red-400';
  };

  const getTradeSideIcon = (side: string) => {
    return side === 'buy' ? (
      <TrendingUp className="h-3 w-3" />
    ) : (
      <TrendingDown className="h-3 w-3" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin text-[hsl(var(--trading-accent))]" />
        <span className="ml-2 text-[hsl(var(--trading-text-muted))]">Loading trades...</span>
      </div>
    );
  }

  if (error) {
    const errorMessage = error?.message || String(error);
    const isAuthError = errorMessage.toLowerCase().includes('401') || 
                       errorMessage.toLowerCase().includes('unauthorized') ||
                       errorMessage.toLowerCase().includes('authentication');
    
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        {isAuthError ? (
          <>
            <Lock className="h-8 w-8 text-yellow-400 mb-2" />
            <p className="text-yellow-400 text-sm">Authentication Required</p>
            <p className="text-[hsl(var(--trading-text-muted))] text-xs mt-1">
              Please sign in to view your trade history
            </p>
          </>
        ) : (
          <>
            <AlertTriangle className="h-8 w-8 text-red-400 mb-2" />
            <p className="text-red-400 text-sm">Failed to load your trades</p>
            <p className="text-[hsl(var(--trading-text-muted))] text-xs mt-1">{errorMessage}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </>
        )}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <div className="w-16 h-16 bg-[hsl(var(--trading-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
          <DollarSign className="h-8 w-8 text-[hsl(var(--trading-text-muted))]" />
        </div>
        <p className="text-[hsl(var(--trading-text-muted))] text-sm">No trade history</p>
        <p className="text-[hsl(var(--trading-text-muted))] text-xs mt-1">
          Your executed trades will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[hsl(var(--trading-border))]">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-[hsl(var(--trading-text))]">
            My Trade History ({trades.length})
          </h3>
          <Badge variant="outline" className="text-xs">
            {market?.toUpperCase() || 'ALL'}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-[hsl(var(--trading-bg-secondary))] border-b border-[hsl(var(--trading-border))]">
              <tr>
                <th className="text-left p-2 text-xs font-medium text-[hsl(var(--trading-text-muted))]">
                  Time
                </th>
                <th className="text-left p-2 text-xs font-medium text-[hsl(var(--trading-text-muted))]">
                  Symbol
                </th>
                <th className="text-left p-2 text-xs font-medium text-[hsl(var(--trading-text-muted))]">
                  Side
                </th>
                <th className="text-right p-2 text-xs font-medium text-[hsl(var(--trading-text-muted))]">
                  Price
                </th>
                <th className="text-right p-2 text-xs font-medium text-[hsl(var(--trading-text-muted))]">
                  Amount
                </th>
                <th className="text-right p-2 text-xs font-medium text-[hsl(var(--trading-text-muted))]">
                  Total
                </th>
                <th className="text-right p-2 text-xs font-medium text-[hsl(var(--trading-text-muted))]">
                  Fee
                </th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr
                  key={trade.id}
                  className="border-b border-[hsl(var(--trading-border))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-colors"
                >
                  <td className="p-2 text-xs">
                    <div className="space-y-1">
                      <div className="text-[hsl(var(--trading-text-muted))]">
                        {formatTradeDate(trade.created_at)}
                      </div>
                      <div className="text-[hsl(var(--trading-text))] font-mono">
                        {formatTradeTime(trade.created_at)}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 text-xs text-[hsl(var(--trading-text))] font-medium">
                    {trade.market?.toUpperCase() || 'N/A'}
                  </td>
                  <td className="p-2">
                    <div className="flex items-center space-x-1">
                      {getTradeSideIcon(trade.side)}
                      <span className={cn(
                        "text-xs font-medium",
                        getTradeSideColor(trade.side)
                      )}>
                        {trade.side?.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 text-right text-xs text-[hsl(var(--trading-text))] font-mono">
                    {formatCurrency(parseFloat(trade.price || '0'))}
                  </td>
                  <td className="p-2 text-right text-xs text-[hsl(var(--trading-text))] font-mono">
                    {formatNumber(parseFloat(trade.amount || '0'), 4)}
                  </td>
                  <td className="p-2 text-right text-xs text-[hsl(var(--trading-text))] font-mono">
                    {formatCurrency(parseFloat(trade.total || '0'))}
                  </td>
                  <td className="p-2 text-right text-xs">
                    <div className="space-y-1">
                      <div className="text-[hsl(var(--trading-text-muted))]">
                        {formatNumber(parseFloat(trade.fee_amount || '0'), 4)}
                      </div>
                      <div className="text-[hsl(var(--trading-text))] font-mono">
                        {trade.fee_currency || 'USDT'}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))]">
        <div className="flex items-center justify-between text-xs text-[hsl(var(--trading-text-muted))]">
          <span>
            {trades.length} trade{trades.length !== 1 ? 's' : ''} • 
            Total Volume: {formatCurrency(
              trades.reduce((sum, trade) => sum + parseFloat(trade.total || '0'), 0)
            )}
          </span>
          <div className="flex items-center space-x-2">
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
