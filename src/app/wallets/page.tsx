"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpDown, ArrowUpRight, Coins, Search, SlidersHorizontal, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAccountBalances } from '@/lib/api/services/account';
import { usePublicMarkets, usePublicTickers } from '@/lib/api/services/public';
import { buildAgentInsights, buildPortfolioSnapshot, displayMarket, normalizeTickers } from '@/lib/ambient-exchange';
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import {
  AgentConsole,
  AmbientPageShell,
  AmbientPanel,
  AuthRequiredState,
  EmptyState,
  LoadingState,
  MetricTile,
  RefreshButton,
} from '@/components/ambient/AmbientExchange';

export default function WalletsPage() {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'funded' | 'cash' | 'crypto'>('all');
  const [sortBy, setSortBy] = useState<'value' | 'currency' | 'available'>('value');

  const { data: markets = [] } = usePublicMarkets();
  const { data: rawTickers = [], refetch: refetchTickers } = usePublicTickers();
  const { data: balances = [], isLoading, refetch: refetchBalances } = useAccountBalances();

  const tickers = useMemo(() => normalizeTickers(rawTickers, markets), [rawTickers, markets]);
  const portfolio = useMemo(() => buildPortfolioSnapshot(balances, rawTickers, markets), [balances, rawTickers, markets]);
  const insights = useMemo(() => buildAgentInsights(portfolio, tickers), [portfolio, tickers]);

  const visibleAssets = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return [...portfolio.assets]
      .filter((asset) => {
        const matchesSearch = !needle || asset.currency.toLowerCase().includes(needle) || asset.name.toLowerCase().includes(needle);
        const matchesFilter = filter === 'all' ||
          (filter === 'funded' && asset.total > 0) ||
          (filter === 'cash' && asset.isFiat) ||
          (filter === 'crypto' && !asset.isFiat);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'currency') return a.currency.localeCompare(b.currency);
        if (sortBy === 'available') return b.available - a.available;
        return b.value - a.value;
      });
  }, [portfolio.assets, search, filter, sortBy]);

  const refreshAll = () => {
    refetchBalances();
    refetchTickers();
  };

  if (!isAuthReady) return <LoadingState label="Loading wallet session..." />;

  if (!isAuthenticated) {
    return (
      <AmbientPageShell user={user} title="Wallets" description="Protected funding, balance, and asset management console." tickers={tickers}>
        <AuthRequiredState />
      </AmbientPageShell>
    );
  }

  return (
    <AmbientPageShell
      user={user}
      title="Wallet Operations"
      description="Monitor available, locked, and marked balances across every Orbitex account currency."
      tickers={tickers}
      actions={<RefreshButton onClick={refreshAll} />}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Total Value" value={formatCurrency(portfolio.totalValue)} detail={`${portfolio.assets.length} listed wallet rows`} icon={Wallet} tone="success" />
        <MetricTile label="Available" value={formatCurrency(portfolio.availableValue)} detail="Free to trade or withdraw" icon={Coins} tone="info" />
        <MetricTile label="Locked" value={formatCurrency(portfolio.lockedValue)} detail="Orders, holds, or pending ops" icon={SlidersHorizontal} tone={portfolio.lockedValue > 0 ? 'warning' : 'neutral'} />
        <MetricTile label="24h Drift" value={formatPercentage(portfolio.change24h)} detail="Weighted live ticker move" icon={ArrowUpDown} tone={portfolio.change24h >= 0 ? 'success' : 'danger'} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
        <AmbientPanel title="Wallet Matrix" icon={Wallet} action={<span className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-300">{visibleAssets.length} assets</span>}>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search currencies..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/70 py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/60"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(['all', 'funded', 'cash', 'crypto'] as const).map((item) => (
                <button key={item} onClick={() => setFilter(item)} className={cn('rounded-xl border px-3 py-2 text-sm capitalize transition', filter === item ? 'border-emerald-300/50 bg-emerald-400/10 text-emerald-200' : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:bg-slate-900')}>
                  {item}
                </button>
              ))}
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)} className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none">
                <option value="value">Sort by value</option>
                <option value="currency">Sort by currency</option>
                <option value="available">Sort by available</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <LoadingState label="Loading balances from backend-rust..." />
          ) : visibleAssets.length ? (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="ambient-table min-w-[860px]">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Available</th>
                    <th>Locked</th>
                    <th>Marked Price</th>
                    <th>Value</th>
                    <th>24h</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAssets.map((asset) => (
                    <tr key={asset.currency}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="rounded-xl bg-emerald-400/10 px-3 py-2 font-black text-emerald-200">{asset.currency.slice(0, 3)}</div>
                          <div>
                            <div className="font-bold text-white">{asset.currency}</div>
                            <div className="text-xs text-slate-500">{asset.market ? displayMarket(asset.market, markets) : asset.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono">{formatNumber(asset.available, 8)}</td>
                      <td className="font-mono">{formatNumber(asset.locked, 8)}</td>
                      <td className="font-mono">{asset.price > 0 ? formatCurrency(asset.price) : '--'}</td>
                      <td className="font-mono text-white">{formatCurrency(asset.value)}</td>
                      <td className={asset.change >= 0 ? 'font-mono text-emerald-300' : 'font-mono text-red-300'}>{formatPercentage(asset.change)}</td>
                      <td>
                        <div className="flex gap-2">
                          <Link href={`/wallets/${asset.currency.toLowerCase()}`}><Button size="sm" variant="outline" className="border-slate-700 bg-slate-950/50 text-slate-200 hover:bg-slate-900">Details</Button></Link>
                          <Link href={`/trade?market=${asset.market || 'btcusd'}`}><Button size="sm" className="btn-gradient-primary">Trade</Button></Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No wallets match" message="Adjust your filters or refresh balances after funding the account." />
          )}
        </AmbientPanel>

        <div className="space-y-6">
          <AgentConsole insights={insights} />
          <AmbientPanel title="Funding Actions" icon={ArrowDownToLine}>
            <div className="grid gap-3">
              <Link href="/wallets/btc"><Button className="w-full justify-between btn-gradient-primary">Deposit BTC <ArrowUpRight className="h-4 w-4" /></Button></Link>
              <Link href="/withdraw"><Button variant="outline" className="w-full justify-between border-slate-700 bg-slate-950/60 text-slate-200 hover:bg-slate-900">Withdraw Funds <ArrowUpRight className="h-4 w-4" /></Button></Link>
              <Link href="/history"><Button variant="outline" className="w-full justify-between border-slate-700 bg-slate-950/60 text-slate-200 hover:bg-slate-900">Transaction History <ArrowUpRight className="h-4 w-4" /></Button></Link>
            </div>
          </AmbientPanel>
        </div>
      </section>
    </AmbientPageShell>
  );
}
