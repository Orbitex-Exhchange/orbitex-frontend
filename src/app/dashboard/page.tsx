"use client";

import Link from 'next/link';
import { useMemo } from 'react';
import { Activity, ArrowRight, BarChart3, Clock, Database, Shield, Wallet, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAccountBalances, useAccountStats } from '@/lib/api/services/account';
import { usePublicMarkets, usePublicTickers } from '@/lib/api/services/public';
import { useOrders, useTrades } from '@/lib/api/services/trading';
import { buildAgentInsights, buildPortfolioSnapshot, displayMarket, formatDateTime, normalizeTickers } from '@/lib/ambient-exchange';
import { formatCurrency, formatNumber, formatPercentage, toFiniteNumber } from '@/lib/utils';
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

export default function DashboardPage() {
  const { user, isAuthenticated, isAuthReady } = useAuth();
  const { data: markets = [], refetch: refetchMarkets } = usePublicMarkets();
  const { data: rawTickers = [], refetch: refetchTickers } = usePublicTickers();
  const { data: balances = [], isLoading: balancesLoading, refetch: refetchBalances } = useAccountBalances();
  const { data: stats, refetch: refetchStats } = useAccountStats();
  const { data: openOrders = [], refetch: refetchOrders } = useOrders({ state: 'wait', limit: 25 });
  const { data: trades = [], refetch: refetchTrades } = useTrades({ limit: 8 });

  const tickers = useMemo(() => normalizeTickers(rawTickers, markets), [rawTickers, markets]);
  const portfolio = useMemo(() => buildPortfolioSnapshot(balances, rawTickers, markets), [balances, rawTickers, markets]);
  const insights = useMemo(() => buildAgentInsights(portfolio, tickers, openOrders), [portfolio, tickers, openOrders]);
  const leader = tickers[0];

  const refreshAll = () => {
    refetchMarkets();
    refetchTickers();
    refetchBalances();
    refetchStats();
    refetchOrders();
    refetchTrades();
  };

  if (!isAuthReady) {
    return <LoadingState label="Hydrating Orbitex session..." />;
  }

  if (!isAuthenticated) {
    return (
      <AmbientPageShell user={user} title="Dashboard" description="Protected account telemetry for balances, orders, and activity." tickers={tickers}>
        <AuthRequiredState />
      </AmbientPageShell>
    );
  }

  return (
    <AmbientPageShell
      user={user}
      title="Trading Dashboard"
      description="Live account command center with portfolio telemetry, exchange health, and local deterministic trading agents."
      tickers={tickers}
      actions={<RefreshButton onClick={refreshAll} />}
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Marked Portfolio" value={formatCurrency(portfolio.totalValue)} detail={`${portfolio.activeAssets} funded assets`} icon={Wallet} tone="success" />
        <MetricTile label="24h Portfolio Drift" value={formatPercentage(portfolio.change24h)} detail="Weighted from live market tickers" icon={Activity} tone={portfolio.change24h >= 0 ? 'success' : 'danger'} />
        <MetricTile label="Open Orders" value={openOrders.length} detail={`${formatCurrency(portfolio.lockedValue)} locked value`} icon={Zap} tone={openOrders.length ? 'warning' : 'info'} />
        <MetricTile label="Trades Executed" value={stats?.total_trades ?? trades.length} detail={`Fees ${formatNumber(stats?.total_fees ?? 0, 6)}`} icon={BarChart3} tone="neutral" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <AmbientPanel title="Portfolio Exposure" icon={Database}>
          {balancesLoading ? (
            <LoadingState label="Loading account balances..." />
          ) : portfolio.assets.length ? (
            <div className="space-y-3">
              {portfolio.assets.slice(0, 8).map((asset) => {
                const weight = portfolio.totalValue > 0 ? (asset.value / portfolio.totalValue) * 100 : 0;
                return (
                  <div key={asset.currency} className="rounded-md border border-slate-700/70 bg-slate-950/55 p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="rounded-md bg-emerald-400/10 px-2.5 py-1.5 text-sm font-bold text-emerald-200">{asset.currency.slice(0, 3)}</div>
                          <div>
                            <div className="font-bold text-white">{asset.name}</div>
                            <div className="text-sm text-slate-400">{asset.market ? displayMarket(asset.market, markets) : asset.isFiat ? 'Cash balance' : 'No USD ticker'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-right sm:min-w-[22rem] sm:grid-cols-4">
                        <div>
                          <div className="text-xs uppercase tracking-widest text-slate-500">Total</div>
                          <div className="font-mono text-sm text-white">{formatNumber(asset.total, 8)}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-widest text-slate-500">Value</div>
                          <div className="font-mono text-sm text-white">{formatCurrency(asset.value)}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-widest text-slate-500">24h</div>
                          <div className={asset.change >= 0 ? 'font-mono text-sm text-emerald-300' : 'font-mono text-sm text-red-300'}>{formatPercentage(asset.change)}</div>
                        </div>
                        <div>
                          <div className="text-xs uppercase tracking-widest text-slate-500">Weight</div>
                          <div className="font-mono text-sm text-white">{formatPercentage(weight)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300" style={{ width: `${Math.min(100, Math.max(0, weight))}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState title="No balances yet" message="Orbitex returned no account balances for this user. Fund a wallet or refresh once account provisioning completes." />
          )}
        </AmbientPanel>

        <AgentConsole insights={insights} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <AmbientPanel title="Account Health" icon={Shield}>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-950/55 p-3"><span className="text-slate-400">Email</span><span className="font-medium text-white">{user?.email}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-950/55 p-3"><span className="text-slate-400">Role</span><span className="font-medium capitalize text-white">{user?.role || 'member'}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-slate-950/55 p-3"><span className="text-slate-400">KYC Level</span><span className="font-mono text-emerald-200">{user?.kyc_level ?? 0}</span></div>
          </div>
        </AmbientPanel>

        <AmbientPanel title="Market Focus" icon={Activity}>
          {leader ? (
            <div className="space-y-3">
              <div className="text-xl font-bold text-white">{displayMarket(leader.market, markets)}</div>
              <div className="text-sm text-slate-400">Leading listed market by current ticker order.</div>
              <div className="grid grid-cols-2 gap-3">
                <MetricTile label="Last" value={formatCurrency(leader.last)} tone="neutral" />
                <MetricTile label="Change" value={formatPercentage(leader.change)} tone={leader.change >= 0 ? 'success' : 'danger'} />
              </div>
              <Link href={`/trade?market=${leader.market}`}><Button className="w-full btn-gradient-primary">Open Trade <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
            </div>
          ) : <EmptyState title="No ticker data" message="Public ticker polling has not returned market rows yet." />}
        </AmbientPanel>

        <AmbientPanel title="Recent Executions" icon={Clock}>
          {trades.length ? (
            <div className="space-y-3">
              {trades.slice(0, 5).map((trade: any) => (
                <div key={`${trade.id}-${trade.created_at}`} className="flex items-center justify-between rounded-xl bg-slate-950/55 p-3 text-sm">
                  <div>
                    <div className="font-semibold text-white">{displayMarket(trade.market, markets)}</div>
                    <div className="text-slate-500">{formatDateTime(trade.created_at)}</div>
                  </div>
                  <div className="text-right font-mono">
                    <div className={(trade.side || trade.taker_type) === 'sell' ? 'text-red-300' : 'text-emerald-300'}>{String(trade.side || trade.taker_type || 'trade').toUpperCase()}</div>
                    <div className="text-slate-300">{formatCurrency(toFiniteNumber(trade.price))}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No trade history" message="Executed trades will appear here once this account has fills." />}
        </AmbientPanel>
      </section>
    </AmbientPageShell>
  );
}
