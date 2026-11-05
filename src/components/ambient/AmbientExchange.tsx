"use client";

import Link from 'next/link';
import { ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  ChevronRight,
  Loader2,
  Radar,
  RefreshCw,
  Satellite,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/layout/Navigation';
import { AgentInsight, AmbientTicker, displayMarket } from '@/lib/ambient-exchange';
import { cn, formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';

interface AmbientPageShellProps {
  user?: any;
  title: string;
  eyebrow?: string;
  description: string;
  tickers?: AmbientTicker[];
  actions?: ReactNode;
  children: ReactNode;
}

export function AmbientPageShell({ user, title, eyebrow = 'Orbitex Command', description, tickers = [], actions, children }: AmbientPageShellProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-[hsl(var(--trading-bg))] text-[hsl(var(--trading-text))]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-20%] h-[34rem] w-[34rem] rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute right-[-12%] top-[10%] h-[38rem] w-[38rem] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[30%] h-[26rem] w-[26rem] rounded-full bg-slate-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:44px_44px]" />
      </div>
      <Navigation user={user} />
      <main className="mx-auto flex w-full max-w-[1800px] flex-col gap-4 px-4 py-4 sm:px-5 lg:px-6">
        <section className="ambient-card relative overflow-hidden p-4">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-md border border-emerald-300/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
                <Satellite className="h-3.5 w-3.5" />
                {eyebrow}
              </div>
              <h1 className="text-xl font-semibold text-white sm:text-2xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          </div>
        </section>
        <MarketPulseTape tickers={tickers} />
        {children}
      </main>
    </div>
  );
}

export function MarketPulseTape({ tickers }: { tickers: AmbientTicker[] }) {
  const visible = tickers.slice(0, 8);
  return (
    <div className="ambient-card overflow-hidden px-3 py-2">
      <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar">
        <div className="sticky left-0 z-10 flex shrink-0 items-center gap-2 rounded-md bg-slate-950/90 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300 backdrop-blur">
          <Radar className="h-4 w-4 text-emerald-300" />
          Market Pulse
        </div>
        {visible.length ? visible.map((ticker) => (
          <Link
            key={ticker.market}
            href={`/trade?market=${ticker.market}`}
            className="group flex min-w-[12rem] shrink-0 items-center justify-between rounded-md border border-slate-700/60 bg-slate-950/55 px-3 py-2 transition hover:border-emerald-300/50 hover:bg-slate-900"
          >
            <div>
              <div className="text-xs font-bold text-white group-hover:text-emerald-200">{displayMarket(ticker.market)}</div>
              <div className="font-mono text-xs text-slate-400">Vol {formatNumber(ticker.volume, 4)}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-xs text-white">{formatCurrency(ticker.last)}</div>
              <div className={cn('font-mono text-xs', ticker.change >= 0 ? 'text-emerald-300' : 'text-red-300')}>
                {ticker.change >= 0 ? <TrendingUp className="mr-1 inline h-3 w-3" /> : <TrendingDown className="mr-1 inline h-3 w-3" />}
                {formatPercentage(ticker.change)}
              </div>
            </div>
          </Link>
        )) : (
          <div className="rounded-md border border-slate-700/60 bg-slate-950/55 px-3 py-2 text-xs text-slate-400">Waiting for market data...</div>
        )}
      </div>
    </div>
  );
}

export function AmbientPanel({ title, icon: Icon = Activity, children, action, className }: {
  title: string;
  icon?: any;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('ambient-card p-4', className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-md border border-emerald-300/20 bg-emerald-400/10 p-1.5 text-emerald-200">
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MetricTile({ label, value, detail, tone = 'neutral', icon: Icon }: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  icon?: any;
}) {
  const toneClass = {
    neutral: 'border-slate-700/70 bg-slate-950/55 text-slate-300',
    success: 'border-emerald-300/25 bg-emerald-400/10 text-emerald-200',
    warning: 'border-amber-300/25 bg-amber-400/10 text-amber-200',
    danger: 'border-red-300/25 bg-red-400/10 text-red-200',
    info: 'border-cyan-300/25 bg-cyan-400/10 text-cyan-200',
  }[tone];

  return (
    <div className={cn('rounded-md border p-3 shadow-inner', toneClass)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
          <div className="mt-1.5 text-lg font-bold text-white">{value}</div>
        </div>
        {Icon && <Icon className="h-4 w-4 text-current" />}
      </div>
      {detail && <div className="mt-1.5 text-xs text-slate-400">{detail}</div>}
    </div>
  );
}

export function AgentConsole({ insights }: { insights: AgentInsight[] }) {
  return (
    <AmbientPanel title="Local Trading Agents" icon={Bot}>
      <div className="space-y-2">
        {insights.map((insight) => (
          <div key={insight.id} className="rounded-md border border-slate-700/70 bg-slate-950/55 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                <Sparkles className={cn('h-3.5 w-3.5', insight.severity === 'warning' ? 'text-amber-300' : insight.severity === 'critical' ? 'text-red-300' : 'text-emerald-300')} />
                {insight.agent}
              </div>
              {insight.metric && <span className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 font-mono text-[10px] text-slate-300">{insight.metric}</span>}
            </div>
            <div className="text-sm font-semibold text-white">{insight.title}</div>
            <p className="mt-1 text-xs leading-5 text-slate-300">{insight.message}</p>
          </div>
        ))}
      </div>
    </AmbientPanel>
  );
}

export function LoadingState({ label = 'Loading live exchange data...' }: { label?: string }) {
  return (
    <div className="ambient-card flex min-h-[14rem] flex-col items-center justify-center gap-2 p-5 text-center">
      <Loader2 className="h-7 w-7 animate-spin text-emerald-300" />
      <p className="text-sm text-slate-300">{label}</p>
    </div>
  );
}

export function AuthRequiredState() {
  return (
    <div className="ambient-card flex min-h-[16rem] flex-col items-center justify-center gap-3 p-5 text-center">
      <div className="rounded-md border border-amber-300/25 bg-amber-400/10 p-3 text-amber-200">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-white">Authentication required</h2>
        <p className="mt-2 max-w-md text-sm text-slate-300">Sign in to load protected balances, orders, history, and account analytics.</p>
      </div>
      <Link href="/auth/signin">
        <Button className="btn-gradient-primary">Sign In <ChevronRight className="ml-2 h-4 w-4" /></Button>
      </Link>
    </div>
  );
}

export function EmptyState({ title, message, icon: Icon = Wallet, action }: {
  title: string;
  message: string;
  icon?: any;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-md border border-dashed border-slate-700 bg-slate-950/40 p-5 text-center">
      <Icon className="mx-auto mb-2 h-6 w-6 text-slate-400" />
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-1.5 max-w-lg text-xs leading-5 text-slate-400">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function RefreshButton({ onClick, label = 'Refresh' }: { onClick?: () => void; label?: string }) {
  return (
    <Button type="button" variant="outline" onClick={onClick} className="border-slate-700 bg-slate-950/50 text-slate-200 hover:bg-slate-900 hover:text-white">
      <RefreshCw className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
