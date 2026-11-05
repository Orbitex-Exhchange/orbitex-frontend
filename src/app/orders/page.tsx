"use client";

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  X,
  AlertTriangle,
  Search,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { useOrders, useCancelOrder } from '@/lib/api/services/trading';
import { useToast } from '@/hooks/use-toast';

type SortField = 'date' | 'amount' | 'price' | 'status';

// Peatio order state -> display label + accent class.
const STATE_META: Record<string, { label: string; cls: string }> = {
  wait: { label: 'Open', cls: 'bg-[hsl(var(--trading-accent))]/15 text-[hsl(var(--trading-accent))] border border-[hsl(var(--trading-accent))]/40' },
  done: { label: 'Filled', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/40' },
  cancel: { label: 'Cancelled', cls: 'bg-[hsl(var(--trading-bg-tertiary))] text-[hsl(var(--trading-text-muted))] border border-[hsl(var(--trading-border))]' },
  pending: { label: 'Pending', cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/40' },
  reject: { label: 'Rejected', cls: 'bg-red-500/15 text-red-400 border border-red-500/40' },
};

const stateMeta = (state: string) =>
  STATE_META[state] ?? { label: state, cls: 'bg-[hsl(var(--trading-bg-tertiary))] text-[hsl(var(--trading-text-secondary))]' };

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<'open' | 'all'>('open');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showTrades, setShowTrades] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { toast } = useToast();

  const { data: orders = [], isLoading, error, refetch, isFetching } = useOrders(
    activeTab === 'open' ? { state: 'wait', limit: 100 } : { limit: 100 }
  );

  const cancelOrderMutation = useCancelOrder();

  const handleCancelOrder = async (orderId: number) => {
    try {
      await cancelOrderMutation.mutateAsync(orderId);
      toast({ title: 'Order cancelled', description: 'Your order has been cancelled.' });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Failed to cancel order. Please try again.' });
    }
  };

  const markets = useMemo(
    () => Array.from(new Set(orders.map((o: any) => o.market))).sort(),
    [orders]
  );

  const sortedOrders = useMemo(() => {
    const filtered = orders.filter((order: any) => {
      const matchesTab = activeTab === 'all' || order.state === 'wait';
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        String(order.market).toLowerCase().includes(term) ||
        String(order.id).includes(term);
      const matchesStatus = statusFilter === 'all' || order.state === statusFilter;
      return matchesTab && matchesSearch && matchesStatus;
    });
    return [...filtered].sort((a: any, b: any) => {
      let av: any;
      let bv: any;
      switch (sortBy) {
        case 'date': av = new Date(a.created_at).getTime(); bv = new Date(b.created_at).getTime(); break;
        case 'amount': av = parseFloat(a.volume); bv = parseFloat(b.volume); break;
        case 'price': av = parseFloat(a.price); bv = parseFloat(b.price); break;
        case 'status': av = a.state; bv = b.state; break;
        default: return 0;
      }
      const dir = sortOrder === 'asc' ? 1 : -1;
      return av > bv ? dir : av < bv ? -dir : 0;
    });
  }, [orders, activeTab, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const toggleTrades = (id: string) =>
    setShowTrades((prev) => ({ ...prev, [id]: !prev[id] }));

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied', description: `Order ${text}` });
    } catch {
      /* clipboard may be unavailable */
    }
  };

  const exportCsv = () => {
    const header = ['id', 'market', 'side', 'type', 'volume', 'price', 'executed', 'state', 'created_at'];
    const rows = sortedOrders.map((o: any) =>
      [o.id, o.market, o.side, o.ord_type, o.volume, o.price, o.executed_volume, o.state, o.created_at].join(',')
    );
    const blob = new Blob([[header.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orbitex-orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const th = 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[hsl(var(--trading-text-muted))]';
  const sortBtn = 'flex items-center gap-1 hover:text-[hsl(var(--trading-text))]';

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--trading-text))] flex items-center gap-2">
            <Clock className="h-6 w-6 text-[hsl(var(--trading-accent))]" />
            Orders
          </h1>
          <p className="text-sm text-[hsl(var(--trading-text-muted))]">Manage your open and historical orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isFetching && 'animate-spin')} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={sortedOrders.length === 0}
            className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex gap-1 bg-[hsl(var(--trading-bg-secondary))] border border-[hsl(var(--trading-border))] rounded-lg p-1 mb-6">
        {([['open', 'Open Orders'], ['all', 'All Orders']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === id
                ? 'bg-[hsl(var(--trading-accent))]/15 text-[hsl(var(--trading-accent))]'
                : 'text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))] hover:bg-[hsl(var(--trading-bg-tertiary))]'
            )}
          >
            <Clock className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--trading-text-muted))] w-4 h-4" />
            <Input
              placeholder="Search by market or order ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[hsl(var(--trading-bg-tertiary))] border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[hsl(var(--trading-bg-tertiary))] border border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))] rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--trading-accent))]"
          >
            <option value="all">All Status</option>
            <option value="wait">Open</option>
            <option value="done">Filled</option>
            <option value="cancel">Cancelled</option>
            <option value="reject">Rejected</option>
          </select>
        </div>
      </div>

      <div className="mb-3 text-sm text-[hsl(var(--trading-text-muted))]">
        Showing {sortedOrders.length} of {orders.length} orders
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12 text-[hsl(var(--trading-text-secondary))]">
          <RefreshCw className="w-5 h-5 animate-spin text-[hsl(var(--trading-accent))]" />
          Loading orders…
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 mb-6 text-sm text-red-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Failed to load orders. Please try again.
        </div>
      )}

      {!isLoading && !error && sortedOrders.length > 0 && (
        <div className="rounded-xl border border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(var(--trading-bg-tertiary))]/40">
                <tr>
                  <th className={th}>Market</th>
                  <th className={th}>Side</th>
                  <th className={th}>Type</th>
                  <th className={th}><button onClick={() => handleSort('amount')} className={sortBtn}>Amount <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th className={th}><button onClick={() => handleSort('price')} className={sortBtn}>Price <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th className={th}>Executed</th>
                  <th className={th}><button onClick={() => handleSort('status')} className={sortBtn}>Status <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th className={th}><button onClick={() => handleSort('date')} className={sortBtn}>Date <ArrowUpDown className="w-3 h-3" /></button></th>
                  <th className={th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order: any) => {
                  const meta = stateMeta(order.state);
                  const isBuy = order.side === 'buy';
                  return (
                    <>
                      <tr key={order.id} className="border-t border-[hsl(var(--trading-border))]/50 hover:bg-[hsl(var(--trading-bg-tertiary))]/40">
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-[hsl(var(--trading-text))]">{order.market}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn('inline-flex items-center gap-1.5 font-semibold', isBuy ? 'text-emerald-400' : 'text-red-400')}>
                            {isBuy ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {order.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap capitalize text-[hsl(var(--trading-text-secondary))]">{order.ord_type}</td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums text-[hsl(var(--trading-text))]">
                          {formatNumber(parseFloat(order.volume), 8)}
                          {parseFloat(order.remaining_volume) > 0 && (
                            <div className="text-xs text-[hsl(var(--trading-text-muted))]">rem {formatNumber(parseFloat(order.remaining_volume), 8)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums text-[hsl(var(--trading-text))]">
                          {order.ord_type === 'market' ? 'Market' : formatNumber(parseFloat(order.price), 2)}
                          {parseFloat(order.avg_price || '0') > 0 && (
                            <div className="text-xs text-[hsl(var(--trading-text-muted))]">avg {formatNumber(parseFloat(order.avg_price), 2)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap tabular-nums text-[hsl(var(--trading-text-secondary))]">{formatNumber(parseFloat(order.executed_volume), 8)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn('px-2 py-1 rounded-md text-xs font-medium', meta.cls)}>{meta.label}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-[hsl(var(--trading-text-muted))]">
                          {new Date(order.created_at).toLocaleDateString()}<br />
                          {new Date(order.created_at).toLocaleTimeString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {order.state === 'wait' && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                disabled={cancelOrderMutation.isPending}
                                className="p-1.5 rounded-md text-red-400 hover:bg-red-500/10"
                                aria-label="Cancel order"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                            {order.trades_count > 0 && (
                              <button
                                onClick={() => toggleTrades(String(order.id))}
                                className="p-1.5 rounded-md text-[hsl(var(--trading-text-secondary))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
                                aria-label="Toggle trades"
                              >
                                {showTrades[String(order.id)] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            )}
                            <button
                              onClick={() => copyToClipboard(String(order.id))}
                              className="p-1.5 rounded-md text-[hsl(var(--trading-text-secondary))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
                              aria-label="Copy order ID"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {showTrades[String(order.id)] && order.trades_count > 0 && (
                        <tr className="bg-[hsl(var(--trading-bg-tertiary))]/30">
                          <td colSpan={9} className="px-4 py-3">
                            <div className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--trading-text-muted))] mb-2">Trades</div>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-[hsl(var(--trading-text-muted))]">
                                  <th className="text-left py-1">Price</th>
                                  <th className="text-left py-1">Amount</th>
                                  <th className="text-left py-1">Fee</th>
                                  <th className="text-left py-1">Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(order.trades ?? []).map((t: any) => (
                                  <tr key={t.id} className="text-[hsl(var(--trading-text-secondary))]">
                                    <td className="py-1 tabular-nums text-[hsl(var(--trading-text))]">{formatNumber(parseFloat(t.price), 2)}</td>
                                    <td className="py-1 tabular-nums">{formatNumber(parseFloat(t.amount), 8)}</td>
                                    <td className="py-1 tabular-nums">{formatNumber(parseFloat(t.fee ?? '0'), 8)}</td>
                                    <td className="py-1">{new Date(t.created_at ?? Date.now()).toLocaleTimeString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && !error && sortedOrders.length === 0 && (
        <div className="rounded-xl border border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] p-12 text-center">
          <Clock className="w-12 h-12 text-[hsl(var(--trading-text-muted))] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[hsl(var(--trading-text))] mb-1">No orders found</h3>
          <p className="text-sm text-[hsl(var(--trading-text-muted))]">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
