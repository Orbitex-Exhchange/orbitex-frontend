"use client";

import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  DollarSign,
  Percent,
  Zap,
  Calculator,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Info,
  Settings,
  Clock,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { cn, formatNumber, formatCurrency } from '../../lib/utils';
import { env } from '@/lib/env';
import { authService } from '@/lib/auth';
import { useCreateOrder, useAccountBalances } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface EnhancedOrderFormProps {
  market: string;
  currentPrice: number;
  onPriceClick?: (price: number) => void;
  compact?: boolean;
  balancesData?: any[];
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

interface OrderFormData {
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit' | 'trailing_stop';
  price: string;
  size: string;
  total: string;
  stopPrice: string;
  trailingAmount: string;
  leverage: number;
  reduceOnly: boolean;
  postOnly: boolean;
  timeInForce: 'GTC' | 'IOC' | 'FOK';
}

interface Portfolio {
  baseBalance: number;
  quoteBalance: number;
  unrealizedPnL: number;
  marginUsed: number;
  marginAvailable: number;
  positions: {
    size: number;
    avgPrice: number;
    markPrice: number;
    pnl: number;
    percentage: number;
  }[];
}

const orderTypes = [
  { value: 'market', label: 'Market', description: 'Execute immediately at best price' },
  { value: 'limit', label: 'Limit', description: 'Execute at specified price or better' },
  { value: 'stop', label: 'Stop Market', description: 'Trigger market order when price reached' },
  { value: 'stop_limit', label: 'Stop Limit', description: 'Trigger limit order when price reached' },
  { value: 'trailing_stop', label: 'Trailing Stop', description: 'Dynamic stop that follows price' }
];

const percentageButtons = [10, 25, 50, 75, 100];

export function EnhancedOrderForm({ 
  market, 
  currentPrice,
  onPriceClick,
  compact = false,
  balancesData: propBalancesData,
  isAuthenticated = false,
  onAuthRequired
}: EnhancedOrderFormProps) {
  const [orderData, setOrderData] = useState<OrderFormData>({
    side: 'buy',
    type: 'limit',
    price: currentPrice.toString(),
    size: '',
    total: '',
    stopPrice: '',
    trailingAmount: '',
    leverage: 1,
    reduceOnly: false,
    postOnly: false,
    timeInForce: 'GTC'
  });

  const [quickOrderMode, setQuickOrderMode] = useState(false);
  const [calculatorMode, setCalculatorMode] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [balances, setBalances] = useState<Record<string, number>>({});

  // Real API hooks
  const { toast } = useToast();
  const createOrderMutation = useCreateOrder();
  const { data: balancesData, isLoading: balancesLoading } = useAccountBalances();
  
  // Use prop balances data if available, otherwise use API data
  const finalBalancesData = propBalancesData || balancesData;

  // Mock portfolio data
  const [portfolio] = useState<Portfolio>({
    baseBalance: 12.5847,
    quoteBalance: 25430.75,
    unrealizedPnL: 1247.85,
    marginUsed: 8940.25,
    marginAvailable: 16490.50,
    positions: [
      {
        size: 2.5,
        avgPrice: 42150.00,
        markPrice: currentPrice,
        pnl: 1247.85,
        percentage: 5.92
      }
    ]
  });

  // Update balances from API data
  useEffect(() => {
    if (finalBalancesData) {
      const map: Record<string, number> = {};
      finalBalancesData.forEach((balance: any) => {
        map[(balance.currency || '').toUpperCase()] = parseFloat(balance.balance || '0');
      });
      setBalances(map);
    }
  }, [finalBalancesData]);

  // Update price when current price changes
  useEffect(() => {
    if (orderData.type === 'market') {
      setOrderData(prev => ({ ...prev, price: currentPrice.toString() }));
    }
  }, [currentPrice, orderData.type]);

  // Calculate total when price or size changes
  useEffect(() => {
    if (orderData.price && orderData.size) {
      const total = parseFloat(orderData.price) * parseFloat(orderData.size);
      setOrderData(prev => ({ ...prev, total: total.toFixed(2) }));
    }
  }, [orderData.price, orderData.size]);

  const handleOrderTypeChange = (type: OrderFormData['type']) => {
    setOrderData(prev => ({
      ...prev,
      type,
      price: type === 'market' ? currentPrice.toString() : prev.price
    }));
  };

  const handlePercentageClick = (percentage: number) => {
    // Get real balances from API data
    const [baseCurrency, quoteCurrency] = market.split('-');
    const baseBalance = balances[baseCurrency?.toUpperCase() || ''] || 0;
    const quoteBalance = balances[quoteCurrency?.toUpperCase() || ''] || 0;
    
    const availableBalance = orderData.side === 'buy' ? quoteBalance : baseBalance;
    const maxAmount = orderData.side === 'buy' 
      ? (availableBalance * (percentage / 100)) / parseFloat(orderData.price || '1')
      : availableBalance * (percentage / 100);
    
    setOrderData(prev => ({ ...prev, size: maxAmount.toFixed(4) }));
  };

  const handleQuickPrice = (adjustment: number) => {
    const newPrice = currentPrice * (1 + adjustment);
    setOrderData(prev => ({ ...prev, price: newPrice.toFixed(2) }));
    onPriceClick?.(newPrice);
  };

  const validateOrder = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (orderData.type !== 'market' && (!orderData.price || parseFloat(orderData.price) <= 0)) {
      newErrors.price = 'Price is required';
    }

    if (!orderData.size || parseFloat(orderData.size) <= 0) {
      newErrors.size = 'Size is required';
    }

    if (orderData.type === 'stop' || orderData.type === 'stop_limit') {
      if (!orderData.stopPrice || parseFloat(orderData.stopPrice) <= 0) {
        newErrors.stopPrice = 'Stop price is required';
      }
    }

    // Balance check
    try {
      const [base, quote] = market.split('-');
      if (base && quote) {
        const needBase = orderData.side === 'sell';
        const needQuote = orderData.side === 'buy';
        if (needSellOrBuyInsufficient(needBase, needQuote, base, quote)) {
          newErrors.margin = 'Insufficient balance';
        }
      }
    } catch (_e) {
      // ignore
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const needSellOrBuyInsufficient = (needBase: boolean, needQuote: boolean, base: string, quote: string): boolean => {
    const size = parseFloat(orderData.size || '0');
    const price = parseFloat(orderData.price || String(currentPrice) || '0');
    if (needBase) {
      const have = balances[(base || '').toUpperCase()] || 0;
      return size > have;
    }
    if (needQuote) {
      const have = balances[(quote || '').toUpperCase()] || 0;
      const cost = size * price;
      return cost > have;
    }
    return false;
  };

  const handleSubmitOrder = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    
    if (!validateOrder()) return;
    
    try {
      const orderPayload: any = {
        market: market,
        side: orderData.side,
        ord_type: orderData.type === 'stop' || orderData.type === 'stop_limit' || orderData.type === 'trailing_stop' ? 'limit' : orderData.type,
        volume: orderData.size,
        time_in_force: orderData.timeInForce,
        reduce_only: orderData.reduceOnly,
        post_only: orderData.postOnly,
      };

      // Only include price if it's not a market order
      if (orderData.type !== 'market' && orderData.price) {
        orderPayload.price = orderData.price;
      }

      // Only include stop_price for stop orders
      if ((orderData.type === 'stop' || orderData.type === 'stop_limit') && orderData.stopPrice) {
        orderPayload.stop_price = orderData.stopPrice;
      }

      await createOrderMutation.mutateAsync(orderPayload);
      
      toast({
        title: "Order Submitted",
        description: `${orderData.side.toUpperCase()} order for ${orderData.size} ${market.split('-')[0]} has been submitted successfully.`,
      });

      // Reset form
      setOrderData(prev => ({
        ...prev,
        size: '',
        total: '',
        stopPrice: '',
      }));
    } catch (error: any) {
      console.error('Order submission failed:', error);
      toast({
        title: "Order Failed",
        description: error.message || "Failed to submit order. Please try again.",
      });
    }
  };

  const getEstimatedFee = () => {
    const notionalValue = parseFloat(orderData.total || '0');
    const feeRate = orderData.postOnly ? 0.0002 : 0.0004; // Example fee rates
    return notionalValue * feeRate;
  };

  const getMarginRequired = () => {
    const notionalValue = parseFloat(orderData.total || '0');
    return notionalValue / orderData.leverage;
  };

  return (
    <div className={cn(
      "bg-[#1a1a1a] h-full flex flex-col",
      compact ? "p-3" : "p-4"
    )}>
      {/* Buy/Sell Tabs - Moved to top */}
      <div className="flex gap-1 mb-4">
        <Button
          onClick={() => setOrderData(prev => ({ ...prev, side: 'buy' }))}
          className={cn(
            "flex-1 h-8 text-sm",
            orderData.side === 'buy'
              ? "bg-[hsl(var(--trading-success))] hover:bg-[hsl(var(--trading-success))]/80 text-black"
              : "bg-[hsl(var(--trading-bg-tertiary))] hover:bg-[hsl(var(--trading-bg-secondary))] text-[hsl(var(--trading-text-muted))]"
          )}
        >
          <TrendingUp className="h-3 w-3 mr-1" />
          Buy
        </Button>
        <Button
          onClick={() => setOrderData(prev => ({ ...prev, side: 'sell' }))}
          className={cn(
            "flex-1 h-8 text-sm",
            orderData.side === 'sell'
              ? "bg-[hsl(var(--trading-error))] hover:bg-[hsl(var(--trading-error))]/80 text-black"
              : "bg-[hsl(var(--trading-bg-tertiary))] hover:bg-[hsl(var(--trading-bg-secondary))] text-[hsl(var(--trading-text-muted))]"
          )}
        >
          <TrendingDown className="h-3 w-3 mr-1" />
          Sell
        </Button>
      </div>

      {/* Controls - Moved below tabs */}
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuickOrderMode(!quickOrderMode)}
            className={cn(
              "h-6 w-6 p-0",
              quickOrderMode ? "text-[hsl(var(--trading-accent))]" : "text-[hsl(var(--trading-text-muted))]"
            )}
            title="Quick Order Mode"
          >
            <Zap className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCalculatorMode(!calculatorMode)}
            className={cn(
              "h-6 w-6 p-0",
              calculatorMode ? "text-[hsl(var(--trading-accent))]" : "text-[hsl(var(--trading-text-muted))]"
            )}
            title="Calculator Mode"
          >
            <Calculator className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))]">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Order Type Selector */}
      <div className="mb-3">
        <label className="block text-xs font-medium text-[hsl(var(--trading-text-muted))] mb-1">Order Type</label>
        <div className="grid grid-cols-2 gap-1">
          {orderTypes.slice(0, 4).map((type) => (
            <Button
              key={type.value}
              variant="ghost"
              size="sm"
              onClick={() => handleOrderTypeChange(type.value as any)}
              className={cn(
                "h-6 text-[10px] justify-start",
                orderData.type === type.value
                  ? "bg-[hsl(var(--trading-accent))] text-black"
                  : "bg-[hsl(var(--trading-bg-tertiary))] text-[hsl(var(--trading-text-secondary))] hover:bg-[hsl(var(--trading-bg-secondary))]"
              )}
              title={type.description}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Leverage Slider */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-medium text-[hsl(var(--trading-text-muted))]">Leverage</label>
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-[hsl(var(--trading-text))]">{orderData.leverage}x</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 text-[hsl(var(--trading-text-muted))] hover:text-[hsl(var(--trading-text))]"
            >
              <Info className="h-2 w-2" />
            </Button>
          </div>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={orderData.leverage}
          onChange={(e) => setOrderData(prev => ({ ...prev, leverage: parseInt(e.target.value) }))}
          className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-[10px] text-[#888] mt-1">
          <span>1x</span>
          <span>25x</span>
          <span>50x</span>
          <span>100x</span>
        </div>
      </div>

      {/* Quick Price Buttons */}
      {quickOrderMode && (
        <div className="mb-3 p-2 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
          <div className="text-[10px] text-[#888] mb-1">Quick Price Adjustment</div>
          <div className="grid grid-cols-3 gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickPrice(-0.005)}
              className="h-6 text-[10px] text-red-400 hover:bg-red-500/20"
            >
              -0.5%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickPrice(-0.001)}
              className="h-6 text-[10px] text-red-400 hover:bg-red-500/20"
            >
              -0.1%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOrderData(prev => ({ ...prev, price: currentPrice.toString() }))}
              className="h-6 text-[10px] text-white hover:bg-[#3a3a3a]"
            >
              Market
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickPrice(0.001)}
              className="h-6 text-[10px] text-green-400 hover:bg-green-500/20"
            >
              +0.1%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickPrice(0.005)}
              className="h-6 text-[10px] text-green-400 hover:bg-green-500/20"
            >
              +0.5%
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickPrice(0.01)}
              className="h-6 text-[10px] text-green-400 hover:bg-green-500/20"
            >
              +1%
            </Button>
          </div>
        </div>
      )}

      {/* Price Input */}
      {orderData.type !== 'market' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#888] mb-2">
            Price ({market.split('-')[1] || 'USDT'})
          </label>
          <div className="relative">
            <Input
              value={orderData.price}
              onChange={(e) => setOrderData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              className="bg-[#2a2a2a] border-[#3a3a3a] text-white focus:border-[#4a4a4a] pr-12"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <DollarSign className="h-4 w-4 text-[#888]" />
            </div>
          </div>
          {errors.price && (
            <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errors.price}
            </div>
          )}
        </div>
      )}

      {/* Stop Price Input */}
      {(orderData.type === 'stop' || orderData.type === 'stop_limit') && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#888] mb-2">Stop Price</label>
          <Input
            value={orderData.stopPrice}
            onChange={(e) => setOrderData(prev => ({ ...prev, stopPrice: e.target.value }))}
            placeholder="0.00"
            className="bg-[#2a2a2a] border-[#3a3a3a] text-white focus:border-[#4a4a4a]"
          />
          {errors.stopPrice && (
            <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errors.stopPrice}
            </div>
          )}
        </div>
      )}

      {/* Size Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#888] mb-2">
          Size ({market.split('-')[0] || 'BTC'})
        </label>
        <Input
          value={orderData.size}
          onChange={(e) => setOrderData(prev => ({ ...prev, size: e.target.value }))}
          placeholder="0.0000"
          className="bg-[#2a2a2a] border-[#3a3a3a] text-white focus:border-[#4a4a4a]"
        />
        {errors.size && (
          <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            {errors.size}
          </div>
        )}
      </div>

      {/* Percentage Buttons */}
      <div className="flex gap-1 mb-4">
        {percentageButtons.map((percentage) => (
          <Button
            key={percentage}
            variant="ghost"
            size="sm"
            onClick={() => handlePercentageClick(percentage)}
            className="flex-1 h-7 text-xs bg-[#2a2a2a] text-[#d1d5db] hover:bg-[#3a3a3a]"
          >
            {percentage}%
          </Button>
        ))}
      </div>

      {/* Total */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#888] mb-2">
          Total ({market.split('-')[1] || 'USDT'})
        </label>
        <Input
          value={orderData.total}
          onChange={(e) => setOrderData(prev => ({ ...prev, total: e.target.value }))}
          placeholder="0.00"
          className="bg-[#2a2a2a] border-[#3a3a3a] text-white focus:border-[#4a4a4a]"
        />
      </div>

      {/* Order Summary */}
      {calculatorMode && (
        <div className="mb-4 p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
          <div className="text-xs text-[#888] mb-2">Order Summary</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[#888]">Est. Fee:</span>
              <span className="text-white">${formatNumber(getEstimatedFee(), 2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Margin Required:</span>
              <span className="text-white">${formatNumber(getMarginRequired(), 2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Margin Available:</span>
              <span className="text-green-400">${formatNumber(portfolio.marginAvailable, 2)}</span>
            </div>
          </div>
          {errors.margin && (
            <div className="text-xs text-red-400 mt-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {errors.margin}
            </div>
          )}
        </div>
      )}

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="mb-4 p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#888]">Reduce Only</label>
              <input
                type="checkbox"
                checked={orderData.reduceOnly}
                onChange={(e) => setOrderData(prev => ({ ...prev, reduceOnly: e.target.checked }))}
                className="rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs text-[#888]">Post Only</label>
              <input
                type="checkbox"
                checked={orderData.postOnly}
                onChange={(e) => setOrderData(prev => ({ ...prev, postOnly: e.target.checked }))}
                className="rounded"
              />
            </div>
            <div>
              <label className="text-xs text-[#888] mb-1 block">Time in Force</label>
              <select
                value={orderData.timeInForce}
                onChange={(e) => setOrderData(prev => ({ ...prev, timeInForce: e.target.value as any }))}
                className="w-full h-8 bg-[#2a2a2a] border border-[#3a3a3a] rounded text-white text-xs"
              >
                <option value="GTC">Good Till Cancel</option>
                <option value="IOC">Immediate or Cancel</option>
                <option value="FOK">Fill or Kill</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full h-8 mb-4 text-xs text-[#888] hover:text-white"
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
      </Button>

      {/* Submit Button */}
      <Button
        onClick={handleSubmitOrder}
        disabled={createOrderMutation.isPending}
        className={cn(
          "w-full h-12 font-semibold mt-auto",
          orderData.side === 'buy'
            ? "bg-green-500 hover:bg-green-600 text-white disabled:bg-green-500/50"
            : "bg-red-500 hover:bg-red-600 text-white disabled:bg-red-500/50"
        )}
      >
        {createOrderMutation.isPending ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            {orderData.side === 'buy' ? 'Buy' : 'Sell'} {market.split('-')[0]}
            {orderData.total && ` (~$${formatNumber(parseFloat(orderData.total), 2)})`}
          </>
        )}
      </Button>

      {/* Portfolio Summary */}
      <div className="mt-4 p-3 bg-[#0f0f0f] rounded-lg border border-[#2a2a2a]">
        <div className="text-xs text-[#888] mb-2">Portfolio</div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-[#888]">Margin Available:</span>
            <span className="text-white">${formatNumber(portfolio.marginAvailable, 2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#888]">Unrealized PnL:</span>
            <span className={cn(
              "font-medium",
              portfolio.unrealizedPnL >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {portfolio.unrealizedPnL >= 0 ? '+' : ''}${formatNumber(portfolio.unrealizedPnL, 2)}
            </span>
          </div>
          {portfolio.positions.length > 0 && (
            <div className="flex justify-between">
              <span className="text-[#888]">Position:</span>
              <span className="text-white">
                {formatNumber(portfolio.positions[0]?.size || 0, 4)} BTC
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}