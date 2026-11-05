"use client";

import Link from 'next/link';
import { useMemo } from 'react';
import { Gauge, PieChart, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAccountBalances, useAccountStats } from '@/lib/api/services/account';
import { usePublicMarkets, usePublicTickers } from '@/lib/api/services/public';
import { useOrders, useTrades } from '@/lib/api/services/trading';
import { buildAgentInsights, buildPortfolioSnapshot, displayMarket, normalizeTickers } from '@/lib/ambient-exchange';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import { AgentConsole, AmbientPageShell, AmbientPanel, AuthRequiredState, EmptyState, LoadingState, MetricTile, RefreshButton } from '@/components/ambient/AmbientExchange';

export default function PortfolioPage() {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const { data: markets = [] } = usePublicMarkets();
  const { data: rawTickers = [], refetch: refetchTickers } = usePublicTickers();
  const { data: balances = [], isLoading, refetch: refetchBalances } = useAccountBalances();
  const { data: stats } = useAccountStats();
  const { data: orders = [] } = useOrders({ limit: 100 });
  const { data: trades = [] } = useTrades({ limit: 25 });

  const tickers = useMemo(() => normalizeTickers(rawTickers, markets), [rawTickers, markets]);
  const portfolio = useMemo(() => buildPortfolioSnapshot(balances, rawTickers, markets), [balances, rawTickers, markets]);
  const insights = useMemo(() => buildAgentInsights(portfolio, tickers, orders), [portfolio, tickers, orders]);
  const funded = portfolio.assets.filter((asset) => asset.total > 0);
  const topAssets = [...funded].sort((a, b) => b.value - a.value).slice(0, 10);
  const concentration = portfolio.highestAsset && portfolio.totalValue > 0 ? (portfolio.highestAsset.value / portfolio.totalValue) * 100 : 0;

  if (!isAuthReady) return <LoadingState label="Loading portfolio session..." />;

  if (!isAuthenticated) {
    return (
      <AmbientPageShell user={user} title="Portfolio" description="Portfolio intelligence is available after sign-in." tickers={tickers}>
        <AuthRequiredState />
      </AmbientPageShell>
    );
  }

  return (
    <AmbientPageShell
      user={user}
      title="Portfolio Intelligence"
      description="Professional exposure, concentration, locked capital, and execution telemetry from live Orbitex account data."
      tickers={tickers}
      actions={<RefreshButton onClick={() => { refetchBalances(); refetchTickers(); }} />}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Portfolio NAV" value={formatCurrency(portfolio.totalValue)} detail={`${funded.length} funded assets`} icon={PieChart} tone="success" />
        <MetricTile label="Concentration" value={formatPercentage(concentration)} detail={portfolio.highestAsset?.currency || 'No dominant asset'} icon={ShieldCheck} tone={concentration > 65 ? 'warning' : 'info'} />
        <MetricTile label="Locked Capital" value={formatCurrency(portfolio.lockedValue)} detail={`${orders.length} tracked orders`} icon={Gauge} tone={portfolio.lockedValue > 0 ? 'warning' : 'neutral'} />
        <MetricTile label="Trading Volume" value={formatNumber(stats?.total_volume ?? 0, 6)} detail={`${stats?.total_trades ?? trades.length} trades`} icon={TrendingUp} tone="neutral" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <AmbientPanel title="Allocation Map" icon={PieChart}>
          {isLoading ? <LoadingState label="Calculating portfolio exposure..." /> : topAssets.length ? (
            <div className="space-y-4">
              {topAssets.map((asset) => {
                const weight = portfolio.totalValue > 0 ? (asset.value / portfolio.totalValue) * 100 : 0;
                return (
                  <div key={asset.currency} className="rounded-md border border-slate-700/70 bg-slate-950/55 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-lg font-bold text-white">{asset.currency}</div>
                        <div className="text-sm text-slate-400">{asset.market ? displayMarket(asset.market, markets) : asset.name}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-white">{formatCurrency(asset.value)}</div>
                        <div className={asset.change >= 0 ? 'text-emerald-300' : 'text-red-300'}>{formatPercentage(asset.change)}</div>
                      </div>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400" style={{ width: `${Math.min(100, Math.max(0, weight))}%` }} />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-slate-500">
                      <span>{formatNumber(asset.total, 8)} units</span>
                      <span>{formatPercentage(weight)} allocation</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState title="No funded assets" message="Funded balances will appear as allocation rows once returned by backend-rust." icon={Wallet} />}
        </AmbientPanel>

        <AgentConsole insights={insights} />
      </section>

      <AmbientPanel title="Execution Inventory" icon={Gauge} action={<Link href="/orders"><Button size="sm" variant="outline" className="border-slate-700 bg-slate-950/60 text-slate-200">Open Orders</Button></Link>}>
        {orders.length ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="ambient-table min-w-[780px]">
              <thead><tr><th>Market</th><th>Side</th><th>Type</th><th>State</th><th>Price</th><th>Remaining</th></tr></thead>
              <tbody>
                {orders.slice(0, 12).map((order: any) => (
                  <tr key={order.uuid || order.id}>
                    <td className="font-semibold text-white">{displayMarket(order.market, markets)}</td>
                    <td className={String(order.side).toLowerCase() === 'sell' ? 'font-mono text-red-300' : 'font-mono text-emerald-300'}>{String(order.side || 'order').toUpperCase()}</td>
                    <td>{order.ord_type || '--'}</td>
                    <td>{order.state || '--'}</td>
                    <td className="font-mono">{formatCurrency(order.price)}</td>
                    <td className="font-mono">{formatNumber(order.remaining_volume ?? order.volume ?? order.origin_volume, 8)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title="No order inventory" message="Open and historical orders will be summarized here once the account has order activity." />}
      </AmbientPanel>
    </AmbientPageShell>
  );
}
