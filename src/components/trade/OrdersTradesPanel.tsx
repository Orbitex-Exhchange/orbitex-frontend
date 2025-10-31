"use client";

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Clock, 
  History, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Settings,
  Filter,
  Download
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { OrdersTable } from './OrdersTable';
import { TradesTable } from './TradesTable';

interface OrdersTradesPanelProps {
  market?: string;
  compact?: boolean;
}

type TabType = 'orders' | 'trades';

export function OrdersTradesPanel({ market, compact = false }: OrdersTradesPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [showFilters, setShowFilters] = useState(false);

  const tabs = [
    {
      id: 'orders' as TabType,
      label: 'Open Orders',
      icon: Clock,
      count: 0, // This would come from API
      description: 'Active orders waiting for execution'
    },
    {
      id: 'trades' as TabType,
      label: 'Trade History',
      icon: History,
      count: 0, // This would come from API
      description: 'Executed trades and transactions'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg shadow-xl overflow-hidden">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between p-3 border-b border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg))]">
        <div className="flex items-center space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "h-8 px-3 text-xs font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-[hsl(var(--trading-accent))] text-black hover:bg-[hsl(var(--trading-accent))]/80"
                    : "text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
                )}
              >
                <Icon className="h-3 w-3 mr-1" />
                {tab.label}
                {tab.count > 0 && (
                  <Badge 
                    variant="outline" 
                    className="ml-2 h-4 px-1 text-[10px] bg-[hsl(var(--trading-accent))]/10 text-[hsl(var(--trading-accent))] border-[hsl(var(--trading-accent))]/20"
                  >
                    {tab.count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-6 w-6 p-0",
              showFilters ? "text-[hsl(var(--trading-accent))]" : "text-[hsl(var(--trading-text-muted))]"
            )}
            title="Filters"
          >
            <Filter className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))]"
            title="Settings"
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))]"
            title="Export"
          >
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-3 border-b border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-tertiary))]">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-xs text-[hsl(var(--trading-text-muted))]">Market:</label>
              <select className="h-6 px-2 text-xs bg-[hsl(var(--trading-bg))] border border-[hsl(var(--trading-border))] rounded text-[hsl(var(--trading-text))]">
                <option value="">All Markets</option>
                <option value="btcusdt">BTC/USDT</option>
                <option value="ethusdt">ETH/USDT</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-[hsl(var(--trading-text-muted))]">Side:</label>
              <select className="h-6 px-2 text-xs bg-[hsl(var(--trading-bg))] border border-[hsl(var(--trading-border))] rounded text-[hsl(var(--trading-text))]">
                <option value="">All</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-[hsl(var(--trading-text-muted))]">Status:</label>
              <select className="h-6 px-2 text-xs bg-[hsl(var(--trading-bg))] border border-[hsl(var(--trading-border))] rounded text-[hsl(var(--trading-text))]">
                <option value="">All</option>
                <option value="wait">Open</option>
                <option value="done">Filled</option>
                <option value="cancel">Cancelled</option>
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'orders' && (
          <OrdersTable market={market} compact={compact} />
        )}
        {activeTab === 'trades' && (
          <TradesTable market={market} compact={compact} />
        )}
      </div>

      {/* Footer with Summary */}
      <div className="p-3 border-t border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg))]">
        <div className="flex items-center justify-between text-xs text-[hsl(var(--trading-text-muted))]">
          <div className="flex items-center space-x-4">
            <span>
              {activeTab === 'orders' ? 'Open Orders' : 'Trade History'} • 
              {market ? `${market.toUpperCase()}` : 'All Markets'}
            </span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live Data</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span>Auto-refresh: 10s</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))]"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
