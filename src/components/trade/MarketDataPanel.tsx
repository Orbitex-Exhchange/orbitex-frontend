"use client";

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Wallet,
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  Filter,
  ChevronDown,
  ArrowUpDown,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { cn, formatNumber, formatCurrency } from '../../lib/utils';

interface MarketDataPanelProps {
  market: string;
  onPriceClick?: (price: number) => void;
  compact?: boolean;
}

interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  pnl: number;
  pnlPercent: number;
  liquidationPrice: number;
  margin: number;
  leverage: number;
  timestamp: number;
}

interface OpenOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'limit' | 'market' | 'stop' | 'stop_limit';
  size: number;
  price: number;
  filled: number;
  remaining: number;
  status: 'pending' | 'partial' | 'cancelled';
  timestamp: number;
}

interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  size: number;
  price: number;
  fee: number;
  timestamp: number;
  orderId: string;
}

interface Funding {
  symbol: string;
  rate: number;
  nextFundingTime: number;
  lastFundingTime: number;
  lastRate: number;
  predictedRate: number;
}

const tabs = [
  { id: 'positions', label: 'Positions', icon: TrendingUp },
  { id: 'orders', label: 'Open Orders', icon: Clock },
  { id: 'trades', label: 'Trades', icon: DollarSign },
  { id: 'funding', label: 'Funding', icon: Wallet }
];

export function MarketDataPanel({ 
  market, 
  onPriceClick,
  compact = false 
}: MarketDataPanelProps) {
  const [activeTab, setActiveTab] = useState('positions');
  const [showClosedPositions, setShowClosedPositions] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  // Mock user data
  const [positions, setPositions] = useState<Position[]>([]);
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [funding, setFunding] = useState<Funding[]>([]);

  // Generate mock positions
  useEffect(() => {
    const mockPositions: Position[] = [
      {
        id: 'pos-1',
        symbol: 'BTC-USDT',
        side: 'long',
        size: 0.5,
        entryPrice: 43250.00,
        markPrice: 43500.00,
        pnl: 125.00,
        pnlPercent: 0.58,
        liquidationPrice: 38000.00,
        margin: 2162.50,
        leverage: 20,
        timestamp: Date.now() - 3600000
      },
      {
        id: 'pos-2',
        symbol: 'ETH-USDT',
        side: 'short',
        size: 2.0,
        entryPrice: 2650.00,
        markPrice: 2620.00,
        pnl: 60.00,
        pnlPercent: 1.13,
        liquidationPrice: 2900.00,
        margin: 265.00,
        leverage: 10,
        timestamp: Date.now() - 7200000
      }
    ];
    setPositions(mockPositions);
  }, []);

  // Generate mock open orders
  useEffect(() => {
    const mockOrders: OpenOrder[] = [
      {
        id: 'order-1',
        symbol: 'BTC-USDT',
        side: 'buy',
        type: 'limit',
        size: 0.1,
        price: 43000.00,
        filled: 0,
        remaining: 0.1,
        status: 'pending',
        timestamp: Date.now() - 1800000
      },
      {
        id: 'order-2',
        symbol: 'ETH-USDT',
        side: 'sell',
        type: 'stop',
        size: 1.5,
        price: 2700.00,
        filled: 0,
        remaining: 1.5,
        status: 'pending',
        timestamp: Date.now() - 900000
      }
    ];
    setOpenOrders(mockOrders);
  }, []);

  // Generate mock trades
  useEffect(() => {
    const mockTrades: Trade[] = [
      {
        id: 'trade-1',
        symbol: 'BTC-USDT',
        side: 'buy',
        size: 0.05,
        price: 43250.00,
        fee: 0.54,
        timestamp: Date.now() - 300000,
        orderId: 'order-3'
      },
      {
        id: 'trade-2',
        symbol: 'ETH-USDT',
        side: 'sell',
        size: 0.5,
        price: 2640.00,
        fee: 1.32,
        timestamp: Date.now() - 600000,
        orderId: 'order-4'
      }
    ];
    setTrades(mockTrades);
  }, []);

  // Generate mock funding data
  useEffect(() => {
    const mockFunding: Funding[] = [
      {
        symbol: 'BTC-USDT',
        rate: 0.0001,
        nextFundingTime: Date.now() + 3600000,
        lastFundingTime: Date.now() - 28800000,
        lastRate: 0.0002,
        predictedRate: 0.00015
      },
      {
        symbol: 'ETH-USDT',
        rate: -0.0003,
        nextFundingTime: Date.now() + 3600000,
        lastFundingTime: Date.now() - 28800000,
        lastRate: -0.0001,
        predictedRate: -0.00025
      }
    ];
    setFunding(mockFunding);
  }, []);

  const getFundingTime = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const PositionsPanel = () => (
    <div className="h-full flex flex-col">
      {/* Positions Header */}
      <div className="flex items-center justify-between p-2 border-b border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg))]">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-medium text-[hsl(var(--trading-text))]">My Positions</h4>
          <Badge variant="outline" className="text-[10px] bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text-secondary))]">
            {positions.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClosedPositions(!showClosedPositions)}
            className={cn(
              "h-6 px-2 text-[10px]",
              showClosedPositions ? "bg-[hsl(var(--trading-accent))] text-black" : "text-[hsl(var(--trading-text-muted))]"
            )}
          >
            Closed
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "h-6 w-6 p-0",
              autoRefresh ? "text-[hsl(var(--trading-accent))]" : "text-[hsl(var(--trading-text-muted))]"
            )}
            title="Auto Refresh"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Positions Table Header */}
      <div className="grid grid-cols-7 gap-2 px-2 py-1.5 text-[10px] text-[hsl(var(--trading-text-muted))] bg-[hsl(var(--trading-bg))] border-b border-[hsl(var(--trading-border))]">
        <div>Symbol</div>
        <div className="text-right">Size</div>
        <div className="text-right">Entry Price</div>
        <div className="text-right">Mark Price</div>
        <div className="text-right">PnL</div>
        <div className="text-right">ROE%</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Positions List */}
      <div className="flex-1 overflow-y-auto">
        {positions.map((position) => (
          <div
            key={position.id}
            className="grid grid-cols-7 gap-2 px-2 py-1.5 text-xs hover:bg-[hsl(var(--trading-bg-tertiary))]/50 border-b border-[hsl(var(--trading-border))] last:border-b-0"
          >
            <div className="flex items-center gap-1">
              <span className="font-medium text-[hsl(var(--trading-text))]">{position.symbol}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1 py-0",
                  position.side === 'long'
                    ? "border-green-400/30 text-green-400 bg-green-500/10"
                    : "border-red-400/30 text-red-400 bg-red-500/10"
                )}
              >
                {position.side.toUpperCase()}
              </Badge>
            </div>
            <div className="text-[hsl(var(--trading-text))] text-right font-mono text-xs">
              {formatNumber(position.size, 4)}
            </div>
            <div className="text-[hsl(var(--trading-text))] text-right font-mono text-xs">
              ${formatNumber(position.entryPrice, 2)}
            </div>
            <div className="text-[hsl(var(--trading-text))] text-right font-mono text-xs">
              ${formatNumber(position.markPrice, 2)}
            </div>
            <div className={cn(
              "text-right font-mono font-medium text-xs",
              position.pnl >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {position.pnl >= 0 ? '+' : ''}${formatNumber(position.pnl, 2)}
            </div>
            <div className={cn(
              "text-right font-mono font-medium text-xs",
              position.pnlPercent >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
            </div>
            <div className="flex items-center justify-center gap-1">
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))]">
                <Eye className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))]">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const OrdersPanel = () => (
    <div className="h-full flex flex-col">
      {/* Orders Header */}
      <div className="flex items-center justify-between p-2 border-b border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg))]">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-medium text-[hsl(var(--trading-text))]">Open Orders</h4>
          <Badge variant="outline" className="text-[10px] bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text-secondary))]">
            {openOrders.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllOrders(!showAllOrders)}
            className={cn(
              "h-6 px-2 text-[10px]",
              showAllOrders ? "bg-[#00ff88] text-black" : "text-[#888]"
            )}
          >
            All Orders
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-[#888] hover:text-white">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Orders Table Header */}
      <div className="grid grid-cols-6 gap-2 px-2 py-1.5 text-[10px] text-[#888] bg-[#0f0f0f] border-b border-[#2a2a2a]">
        <div>Symbol</div>
        <div className="text-center">Type</div>
        <div className="text-right">Size</div>
        <div className="text-right">Price</div>
        <div className="text-right">Filled</div>
        <div className="text-center">Actions</div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto">
        {openOrders.map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-6 gap-2 px-2 py-1.5 text-xs hover:bg-[#2a2a2a]/50 border-b border-[#1a1a1a] last:border-b-0"
          >
            <div className="flex items-center gap-1">
              <span className="font-medium text-white">{order.symbol}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1 py-0",
                  order.side === 'buy'
                    ? "border-green-400/30 text-green-400 bg-green-500/10"
                    : "border-red-400/30 text-red-400 bg-red-500/10"
                )}
              >
                {order.side.toUpperCase()}
              </Badge>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-[10px] bg-[#2a2a2a] border-[#3a3a3a] text-[#d1d5db]">
                {order.type.toUpperCase()}
              </Badge>
            </div>
            <div className="text-white text-right font-mono text-xs">
              {formatNumber(order.size, 4)}
            </div>
            <div className="text-white text-right font-mono text-xs">
              ${formatNumber(order.price, 2)}
            </div>
            <div className="text-[#888] text-right font-mono text-xs">
              {formatNumber(order.filled, 4)}
            </div>
            <div className="flex items-center justify-center gap-1">
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-[#888] hover:text-white">
                <Eye className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 text-[#888] hover:text-white">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TradesPanel = () => (
    <div className="h-full flex flex-col">
      {/* Trades Header */}
      <div className="flex items-center justify-between p-2 border-b border-[#2a2a2a] bg-[#0f0f0f]">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-medium text-white">My Trades</h4>
          <Badge variant="outline" className="text-[10px] bg-[#2a2a2a] border-[#3a3a3a] text-[#d1d5db]">
            {trades.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-[#888] hover:text-white">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Trades Table Header */}
      <div className="grid grid-cols-5 gap-2 px-2 py-1.5 text-[10px] text-[#888] bg-[#0f0f0f] border-b border-[#2a2a2a]">
        <div>Symbol</div>
        <div className="text-center">Side</div>
        <div className="text-right">Size</div>
        <div className="text-right">Price</div>
        <div className="text-right">Fee</div>
      </div>

      {/* Trades List */}
      <div className="flex-1 overflow-y-auto">
        {trades.map((trade) => (
          <div
            key={trade.id}
            className="grid grid-cols-5 gap-2 px-2 py-1.5 text-xs hover:bg-[#2a2a2a]/50 border-b border-[#1a1a1a] last:border-b-0"
          >
            <div className="font-medium text-white">{trade.symbol}</div>
            <div className="text-center">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1 py-0",
                  trade.side === 'buy'
                    ? "border-green-400/30 text-green-400 bg-green-500/10"
                    : "border-red-400/30 text-red-400 bg-red-500/10"
                )}
              >
                {trade.side.toUpperCase()}
              </Badge>
            </div>
            <div className="text-white text-right font-mono text-xs">
              {formatNumber(trade.size, 4)}
            </div>
            <div className="text-white text-right font-mono text-xs">
              ${formatNumber(trade.price, 2)}
            </div>
            <div className="text-[#888] text-right font-mono text-xs">
              ${formatNumber(trade.fee, 2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const FundingPanel = () => (
    <div className="h-full flex flex-col">
      {/* Funding Header */}
      <div className="flex items-center justify-between p-2 border-b border-[#2a2a2a] bg-[#0f0f0f]">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-medium text-white">Funding Rates</h4>
          <Badge variant="outline" className="text-[10px] bg-[#2a2a2a] border-[#3a3a3a] text-[#d1d5db]">
            {funding.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-[#888] hover:text-white">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Funding List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {funding.map((fund) => (
          <div key={fund.symbol} className="bg-[#0f0f0f] p-2 rounded-lg border border-[#2a2a2a]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white text-xs">{fund.symbol}</span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  fund.rate >= 0 
                    ? "border-green-400/30 text-green-400 bg-green-500/10"
                    : "border-red-400/30 text-red-400 bg-red-500/10"
                )}
              >
                {(fund.rate * 100).toFixed(4)}%
              </Badge>
            </div>
            
            <div className="space-y-1 text-[10px]">
              <div className="flex justify-between">
                <span className="text-[#888]">Next Funding:</span>
                <span className="text-white">{getFundingTime(fund.nextFundingTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Last Rate:</span>
                <span className={cn(
                  fund.lastRate >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {(fund.lastRate * 100).toFixed(4)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#888]">Predicted:</span>
                <span className={cn(
                  fund.predictedRate >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {(fund.predictedRate * 100).toFixed(4)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={cn(
      "bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg flex flex-col h-full overflow-hidden",
      compact ? "max-h-96" : ""
    )}>
      {/* Tab Navigation */}
      <div className="flex border-b border-[#2a2a2a] bg-[#0f0f0f] rounded-t-lg relative z-10">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => {
              console.log('Tab clicked:', tab.id);
              setActiveTab(tab.id);
            }}
            className={cn(
              "flex-1 h-10 px-3 rounded-none border-r border-[#2a2a2a] last:border-r-0 cursor-pointer relative z-10 transition-all duration-200",
              activeTab === tab.id
                ? "bg-[#1a1a1a] text-white border-b-2 border-[#00ff88]"
                : "text-[#888] hover:text-white hover:bg-[#2a2a2a]/50"
            )}
          >
            <tab.icon className="h-3 w-3 mr-1" />
            <span className="text-xs font-medium">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Debug: Active Tab Indicator */}
      <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1 py-0.5 z-20">
        Active: {activeTab}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'positions' && <PositionsPanel />}
        {activeTab === 'orders' && <OrdersPanel />}
        {activeTab === 'trades' && <TradesPanel />}
        {activeTab === 'funding' && <FundingPanel />}
      </div>
    </div>
  );
}