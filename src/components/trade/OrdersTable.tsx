"use client";

import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  X,
  Clock,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { cn, formatNumber, formatCurrency } from '../../lib/utils';
import { useOrders, useCancelOrder, useCancelAllOrders } from '@/lib/api/services/trading';
import { useToast } from '@/hooks/use-toast';

interface OrdersTableProps {
  market?: string;
  compact?: boolean;
}

export function OrdersTable({ market, compact = false }: OrdersTableProps) {
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const { toast } = useToast();

  // API hooks
  const { data: orders = [], isLoading, error, refetch } = useOrders({
    ...(market ? { market } : {}),
    state: 'wait', // Only show open orders
    limit: 100,
    order_by: 'desc'
  });

  const cancelOrderMutation = useCancelOrder();
  const cancelAllOrdersMutation = useCancelAllOrders();

  const handleCancelOrder = async (orderId: number) => {
    try {
      await cancelOrderMutation.mutateAsync(orderId);
      toast({
        title: "Order Cancelled",
        description: `Order #${orderId} has been cancelled successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel order. Please try again.",
      });
    }
  };

  const handleCancelAllOrders = async () => {
    try {
      await cancelAllOrdersMutation.mutateAsync(market ? { market } : {});
      toast({
        title: "All Orders Cancelled",
        description: "All open orders have been cancelled successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel all orders. Please try again.",
      });
    }
  };

  const getOrderStatusColor = (state: string) => {
    switch (state) {
      case 'wait':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'done':
        return 'text-green-400 bg-green-400/10';
      case 'cancel':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getOrderStatusIcon = (state: string) => {
    switch (state) {
      case 'wait':
        return <Clock className="h-3 w-3" />;
      case 'done':
        return <CheckCircle className="h-3 w-3" />;
      case 'cancel':
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
    }
  };

  const formatOrderTime = (createdAt: string) => {
    const date = new Date(createdAt);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin text-[hsl(var(--trading-accent))]" />
        <span className="ml-2 text-[hsl(var(--trading-text-muted))]">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    // Check if it's an authentication error
    const errorMessage = error?.message || String(error);
    const isAuthError = errorMessage.includes('not_permitted') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('401');

    if (isAuthError) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          <div className="w-16 h-16 bg-[hsl(var(--trading-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-[hsl(var(--trading-text-muted))]" />
          </div>
          <p className="text-[hsl(var(--trading-text))] text-sm font-medium mb-1">Authentication Required</p>
          <p className="text-[hsl(var(--trading-text-muted))] text-xs mb-4">
            Please sign in to view your open orders
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/auth/signin'}
            className="btn-gradient-primary"
          >
            Sign In
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <AlertTriangle className="h-8 w-8 text-red-400 mb-2" />
        <p className="text-red-400 text-sm">Failed to load orders</p>
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
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 text-center">
        <div className="w-16 h-16 bg-[hsl(var(--trading-bg-tertiary))] rounded-full flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-[hsl(var(--trading-text-muted))]" />
        </div>
        <p className="text-[hsl(var(--trading-text-muted))] text-sm">No open orders found</p>
        <p className="text-[hsl(var(--trading-text-muted))] text-xs mt-1">
          Your active orders will appear here
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
            Open Orders ({orders.length})
          </h3>
          <Badge variant="outline" className="text-xs">
            {market || 'All Markets'}
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
          {orders.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelAllOrders}
              disabled={cancelAllOrdersMutation.isPending}
              className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel All
            </Button>
          )}
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
                  Type
                </th>
                <th className="text-right p-2 text-xs font-medium text-[hsl(var(--trading-text-muted))]">
                  Price
                </th>
                <th className="text-right p-2 text-xs font-medium text-[hsl(var(--trading-text-muted))]">
                  Filled/Amount
                </th>
                <th className="text-right p-2 text-xs font-medium text-[hsl(var(--trading-text-muted))]">
                  Total
                </th>
                <th className="text-center p-2 text-xs font-medium text-[hsl(var(--trading-text-muted))]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[hsl(var(--trading-border))] hover:bg-[hsl(var(--trading-bg-tertiary))] transition-colors"
                >
                  <td className="p-2 text-xs text-[hsl(var(--trading-text-muted))]">
                    {formatOrderTime(order.created_at)}
                  </td>
                  <td className="p-2 text-xs text-[hsl(var(--trading-text))] font-medium">
                    {order.market?.toUpperCase() || 'N/A'}
                  </td>
                  <td className="p-2">
                    <div className="flex items-center space-x-1">
                      {order.side === 'buy' ? (
                        <TrendingUp className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-400" />
                      )}
                      <span className={cn(
                        "text-xs font-medium",
                        order.side === 'buy' ? 'text-green-400' : 'text-red-400'
                      )}>
                        {order.side?.toUpperCase()}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getOrderStatusColor(order.state))}
                      >
                        {order.ord_type?.toUpperCase()}
                      </Badge>
                    </div>
                  </td>
                  <td className="p-2 text-right text-xs text-[hsl(var(--trading-text))] font-mono">
                    {order.price ? formatCurrency(parseFloat(order.price)) : 'Market'}
                  </td>
                  <td className="p-2 text-right text-xs">
                    <div className="space-y-1">
                      <div className="text-[hsl(var(--trading-text-muted))]">
                        {formatNumber(parseFloat(order.executed_volume || '0'), 4)}
                      </div>
                      <div className="text-[hsl(var(--trading-text))] font-mono">
                        {formatNumber(parseFloat((order as any).origin_volume || order.volume || '0'), 4)}
                      </div>
                    </div>
                  </td>
                  <td className="p-2 text-right text-xs text-[hsl(var(--trading-text))] font-mono">
                    {formatCurrency(parseFloat(order.price || '0') * parseFloat((order as any).origin_volume || order.volume || '0'))}
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Badge
                        variant="outline"
                        className={cn("text-xs flex items-center space-x-1", getOrderStatusColor(order.state))}
                      >
                        {getOrderStatusIcon(order.state)}
                        <span>{order.state?.toUpperCase()}</span>
                      </Badge>
                      {order.state === 'wait' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancelOrderMutation.isPending}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
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
            {orders.length} order{orders.length !== 1 ? 's' : ''} •
            Total Value: {formatCurrency(
              orders.reduce((sum, order) =>
                sum + (parseFloat(order.price || '0') * parseFloat((order as any).origin_volume || order.volume || '0')), 0
              )
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
