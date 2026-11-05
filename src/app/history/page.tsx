"use client";

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Clock, Download, History, Search, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAccountDeposits, useAccountTransactions, useAccountWithdraws } from '@/lib/api/services/account';
import { usePublicMarkets, usePublicTickers } from '@/lib/api/services/public';
import { useTrades } from '@/lib/api/services/trading';
import { asArray, displayMarket, formatDateTime, normalizeTickers, safeStatus } from '@/lib/ambient-exchange';
import { cn, formatCurrency, formatNumber, toFiniteNumber } from '@/lib/utils';
import { AmbientPageShell, AmbientPanel, AuthRequiredState, EmptyState, LoadingState, MetricTile, RefreshButton } from '@/components/ambient/AmbientExchange';

interface HistoryEntry {
  id: string;
  type: 'deposit' | 'withdraw' | 'trade' | 'transaction';
  currency: string;
  market?: string;
  side?: string;
  amount: number;
  price?: number;
  fee: number;
  status: string;
  address?: string;
  txid?: string;
  createdAt: unknown;
}

function statusClass(status: string): string {
  const normalized = status.toLowerCase();
  if (['accepted', 'completed', 'done', 'success'].includes(normalized)) return 'bg-emerald-400/15 text-emerald-200 border-emerald-300/25';
  if (['pending', 'wait', 'submitted', 'processing'].includes(normalized)) return 'bg-amber-400/15 text-amber-200 border-amber-300/25';
  if (['failed', 'rejected', 'cancel', 'canceled'].includes(normalized)) return 'bg-red-400/15 text-red-200 border-red-300/25';
  return 'bg-slate-700/60 text-slate-300 border-slate-600';
}

function typeIcon(type: HistoryEntry['type']) {
  if (type === 'deposit') return <ArrowDown className="h-4 w-4 text-emerald-300" />;
  if (type === 'withdraw') return <ArrowUp className="h-4 w-4 text-red-300" />;
  if (type === 'trade') return <TrendingUp className="h-4 w-4 text-cyan-300" />;
  return <Clock className="h-4 w-4 text-slate-300" />;
}

export default function HistoryPage() {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const [tab, setTab] = useState<'all' | 'deposit' | 'withdraw' | 'trade' | 'transaction'>('all');
  const [search, setSearch] = useState('');
  const { data: markets = [] } = usePublicMarkets();
  const { data: rawTickers = [] } = usePublicTickers();
  const depositsQuery = useAccountDeposits({ limit: 100 });
  const withdrawsQuery = useAccountWithdraws({ limit: 100 });
  const transactionsQuery = useAccountTransactions({ limit: 100 });
  const tradesQuery = useTrades({ limit: 100 });

  const tickers = useMemo(() => normalizeTickers(rawTickers, markets), [rawTickers, markets]);
  const entries = useMemo<HistoryEntry[]>(() => {
    const deposits = asArray<any>(depositsQuery.data).map((deposit) => ({
      id: String(deposit.txid || deposit.id || `deposit-${deposit.created_at}`),
      type: 'deposit' as const,
      currency: String(deposit.currency || '').toUpperCase(),
      amount: toFiniteNumber(deposit.amount),
      fee: toFiniteNumber(deposit.fee),
      status: String(deposit.state || 'unknown'),
      txid: deposit.txid,
      address: deposit.to_address,
      createdAt: deposit.created_at,
    }));

    const withdraws = asArray<any>(withdrawsQuery.data).map((withdraw) => ({
      id: String(withdraw.txid || withdraw.id || `withdraw-${withdraw.created_at}`),
      type: 'withdraw' as const,
      currency: String(withdraw.currency || '').toUpperCase(),
      amount: toFiniteNumber(withdraw.amount),
      fee: toFiniteNumber(withdraw.fee),
      status: String(withdraw.state || withdraw.aasm_state || 'unknown'),
      txid: withdraw.txid,
      address: withdraw.rid,
      createdAt: withdraw.created_at,
    }));

    const trades = asArray<any>(tradesQuery.data).map((trade) => ({
      id: String(trade.id || `${trade.market}-${trade.created_at}`),
      type: 'trade' as const,
      currency: String(trade.market || '').toUpperCase(),
      market: trade.market,
      side: trade.side || trade.taker_type,
      amount: toFiniteNumber(trade.amount ?? trade.volume),
      price: toFiniteNumber(trade.price),
      fee: toFiniteNumber(trade.fee),
      status: 'completed',
      createdAt: trade.created_at,
    }));

    const transactions = asArray<any>(transactionsQuery.data).map((tx) => ({
      id: String(tx.txid || tx.id || `transaction-${tx.created_at}`),
      type: 'transaction' as const,
      currency: String(tx.currency || '').toUpperCase(),
      amount: toFiniteNumber(tx.amount),
      fee: toFiniteNumber(tx.fee),
      status: String(tx.state || 'unknown'),
      txid: tx.txid,
      address: tx.to_address,
      createdAt: tx.created_at,
    }));

    return [...deposits, ...withdraws, ...trades, ...transactions].sort((a, b) => {
      const aTime = new Date(typeof a.createdAt === 'number' && a.createdAt < 10_000_000_000 ? a.createdAt * 1000 : a.createdAt as any).getTime();
      const bTime = new Date(typeof b.createdAt === 'number' && b.createdAt < 10_000_000_000 ? b.createdAt * 1000 : b.createdAt as any).getTime();
      return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
    });
  }, [depositsQuery.data, withdrawsQuery.data, tradesQuery.data, transactionsQuery.data]);

  const visibleEntries = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesTab = tab === 'all' || entry.type === tab;
      const haystack = [entry.currency, entry.market, entry.status, entry.txid, entry.address, entry.side].filter(Boolean).join(' ').toLowerCase();
      return matchesTab && (!needle || haystack.includes(needle));
    });
  }, [entries, search, tab]);

  const isLoading = depositsQuery.isLoading || withdrawsQuery.isLoading || tradesQuery.isLoading || transactionsQuery.isLoading;
  const hasPartialError = depositsQuery.error || withdrawsQuery.error || tradesQuery.error || transactionsQuery.error;

  if (!isAuthReady) return <LoadingState label="Loading history session..." />;

  if (!isAuthenticated) {
    return (
      <AmbientPageShell user={user} title="History" description="Account activity history requires authentication." tickers={tickers}>
        <AuthRequiredState />
      </AmbientPageShell>
    );
  }

  return (
    <AmbientPageShell
      user={user}
      title="Activity History"
      description="Deposits, withdrawals, trades, and account transactions normalized from protected backend-rust APIs."
      tickers={tickers}
      actions={<RefreshButton onClick={() => { depositsQuery.refetch(); withdrawsQuery.refetch(); transactionsQuery.refetch(); tradesQuery.refetch(); }} />}
    >
      <section className="grid gap-4 md:grid-cols-4">
        <MetricTile label="Rows" value={entries.length} detail="Fetched activity entries" icon={History} tone="info" />
        <MetricTile label="Deposits" value={entries.filter((entry) => entry.type === 'deposit').length} detail="Funding events" icon={ArrowDown} tone="success" />
        <MetricTile label="Withdraws" value={entries.filter((entry) => entry.type === 'withdraw').length} detail="Outbound events" icon={ArrowUp} tone="warning" />
        <MetricTile label="Trades" value={entries.filter((entry) => entry.type === 'trade').length} detail="Executed fills" icon={TrendingUp} tone="neutral" />
      </section>

      <AmbientPanel title="Timeline" icon={History} action={<span className={cn('rounded-full border px-3 py-1 text-xs', hasPartialError ? 'border-amber-300/30 bg-amber-400/10 text-amber-200' : 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200')}>{hasPartialError ? 'Partial API response' : 'Live APIs'}</span>}>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search activity, txid, address, market..." className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60" />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'deposit', 'withdraw', 'trade', 'transaction'] as const).map((item) => (
              <button key={item} onClick={() => setTab(item)} className={cn('rounded-xl border px-3 py-2 text-sm capitalize transition', tab === item ? 'border-emerald-300/50 bg-emerald-400/10 text-emerald-200' : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:bg-slate-900')}>{item}</button>
            ))}
          </div>
        </div>

        {isLoading ? <LoadingState label="Loading account activity..." /> : visibleEntries.length ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="ambient-table min-w-[960px]">
              <thead><tr><th>Type</th><th>Asset / Market</th><th>Side</th><th>Amount</th><th>Price</th><th>Fee</th><th>Status</th><th>Reference</th><th>Time</th></tr></thead>
              <tbody>
                {visibleEntries.map((entry) => (
                  <tr key={`${entry.type}-${entry.id}`}>
                    <td><div className="flex items-center gap-2 font-semibold capitalize text-white">{typeIcon(entry.type)}{entry.type}</div></td>
                    <td className="font-semibold text-white">{entry.market ? displayMarket(entry.market, markets) : entry.currency}</td>
                    <td className={entry.side === 'sell' ? 'font-mono uppercase text-red-300' : entry.side ? 'font-mono uppercase text-emerald-300' : 'text-slate-500'}>{entry.side || '--'}</td>
                    <td className="font-mono">{formatNumber(entry.amount, 8)}</td>
                    <td className="font-mono">{entry.price ? formatCurrency(entry.price) : '--'}</td>
                    <td className="font-mono">{entry.fee ? formatNumber(entry.fee, 8) : '--'}</td>
                    <td><span className={cn('rounded-full border px-2 py-1 text-xs font-semibold capitalize', statusClass(entry.status))}>{safeStatus(entry.status)}</span></td>
                    <td className="max-w-[14rem] truncate font-mono text-xs text-slate-400">{entry.txid || entry.address || entry.id}</td>
                    <td className="text-slate-400">{formatDateTime(entry.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No activity found" message="Activity rows will appear once backend-rust returns deposits, withdrawals, trades, or transaction entries." icon={Download} />}
      </AmbientPanel>
    </AmbientPageShell>
  );
}
