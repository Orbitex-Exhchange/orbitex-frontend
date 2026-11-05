"use client";

import Link from 'next/link';
import { startTransition, useDeferredValue, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Globe2,
  LineChart,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Navigation } from '@/components/layout/Navigation';
import { env } from '@/lib/env';
import { cn, formatCurrency, formatNumber, formatPercentage, toFiniteNumber } from '@/lib/utils';

type Market = {
  id: string;
  symbol: string;
  name: string;
  status: string;
  base_unit?: string;
  quote_unit?: string;
};

type Ticker = {
  market: string;
  last: number;
  high: number;
  low: number;
  volume: number;
  amount: number;
  change: number;
};

type OrderRow = {
  price: number;
  amount: number;
  total: number;
};

type TradeRow = {
  id: string;
  price: number;
  amount: number;
  total: number;
  side: string;
  createdAt: string;
};

type TerminalData = {
  markets: Market[];
  tickers: Ticker[];
  asks: OrderRow[];
  bids: OrderRow[];
  trades: TradeRow[];
  lastUpdated: Date | null;
};

const API_BASE = env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
const DEFAULT_MARKET = 'btcusd';

const emptyTerminalData: TerminalData = {
  markets: [],
  tickers: [],
  asks: [],
  bids: [],
  trades: [],
  lastUpdated: null,
};

function normalizeMarketId(value: unknown): string {
  return String(value || '').replace(/[-_/]/g, '').toLowerCase();
}

function displayMarket(market: Market | string | undefined): string {
  if (!market) return 'BTC/USD';
  if (typeof market === 'string') {
    return splitMarketLabel(market);
  }
  return market.name || `${String(market.base_unit || '').toUpperCase()}/${String(market.quote_unit || '').toUpperCase()}`;
}

function splitMarketLabel(marketId: string): string {
  const id = normalizeMarketId(marketId);
  const knownQuotes = ['usdt', 'usdc', 'usd', 'eur', 'zar', 'btc', 'eth'];
  const quote = knownQuotes.find((candidate) => id.endsWith(candidate) && id.length > candidate.length);
  if (!quote) return id.toUpperCase();
  return `${id.slice(0, -quote.length).toUpperCase()}/${quote.toUpperCase()}`;
}

function normalizeTickers(raw: unknown): Ticker[] {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return [];

  return Object.entries(raw).map(([market, value]) => {
    const wrapper = value as { ticker?: Record<string, unknown> };
    const ticker = wrapper.ticker || (value as Record<string, unknown>) || {};
    return {
      market: normalizeMarketId(ticker.market ?? market),
      last: toFiniteNumber(ticker.last ?? ticker.lastPrice ?? ticker.last_price ?? ticker.close ?? ticker.price),
      high: toFiniteNumber(ticker.high),
      low: toFiniteNumber(ticker.low),
      volume: toFiniteNumber(ticker.volume ?? ticker.vol),
      amount: toFiniteNumber(ticker.amount),
      change: toFiniteNumber(ticker.price_change_percent ?? ticker.change ?? ticker.change_percent),
    };
  }).filter((ticker) => ticker.market && Number.isFinite(ticker.last));
}

function normalizeOrderRows(raw: unknown): OrderRow[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((entry) => {
    const row = entry as Record<string, unknown>;
    const price = toFiniteNumber(row.price);
    const amount = toFiniteNumber(row.remaining_volume ?? row.origin_volume ?? row.volume ?? row.amount ?? row.size);
    return {
      price,
      amount,
      total: price * amount,
    };
  }).filter((row) => row.price > 0 && row.amount >= 0);
}

function normalizeTrades(raw: unknown): TradeRow[] {
  if (!Array.isArray(raw)) return [];

  return raw.map((entry, index) => {
    const trade = entry as Record<string, unknown>;
    const price = toFiniteNumber(trade.price);
    const amount = toFiniteNumber(trade.amount ?? trade.volume);
    const createdAt = trade.created_at;
    return {
      id: String(trade.id ?? `${price}-${amount}-${index}`),
      price,
      amount,
      total: toFiniteNumber(trade.total, price * amount),
      side: String(trade.taker_type ?? trade.side ?? 'trade'),
      createdAt: formatTradeTime(createdAt),
    };
  }).filter((trade) => trade.price > 0 && trade.amount >= 0);
}

function formatTradeTime(value: unknown): string {
  const numeric = toFiniteNumber(value, Number.NaN);
  const raw = Number.isFinite(numeric) ? (numeric < 10_000_000_000 ? numeric * 1000 : numeric) : value;
  const date = new Date(raw as string | number | Date);
  return Number.isFinite(date.getTime())
    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--';
}

function formatPrice(value: unknown): string {
  const amount = toFiniteNumber(value);
  return amount > 0 ? formatCurrency(amount) : '--';
}

function formatCompactNumber(value: unknown, decimals = 4): string {
  const amount = toFiniteNumber(value);
  return amount > 0 ? formatNumber(amount, decimals) : '--';
}

import { publicApiService } from '@/services/publicService';

async function loadTerminalData(marketId: string): Promise<TerminalData> {
  try {
    const [markets, tickersRaw, orderBook, trades] = await Promise.all([
      publicApiService.getMarkets(),
      publicApiService.getTickers(),
      publicApiService.getOrderBook(marketId),
      publicApiService.getTrades(marketId),
    ]);

    return {
      markets: markets.filter((market) => market.status !== 'disabled'),
      tickers: normalizeTickers(tickersRaw),
      asks: normalizeOrderRows(orderBook?.asks).slice(0, 8),
      bids: normalizeOrderRows(orderBook?.bids).slice(0, 8),
      trades: normalizeTrades(trades).slice(0, 8),
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Failed to load terminal data:', error);
    throw error;
  }
}

function metricTone(value: number): string {
  return value >= 0 ? 'text-emerald-300' : 'text-red-300';
}

export default function HomePage() {
  const [selectedMarket, setSelectedMarket] = useState(DEFAULT_MARKET);
  const deferredMarket = useDeferredValue(selectedMarket);
  const [data, setData] = useState<TerminalData>(emptyTerminalData);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async (quiet = false) => {
      if (!quiet) setIsLoading(true);
      setIsRefreshing(quiet);

      try {
        const nextData = await loadTerminalData(deferredMarket);
        if (!active) return;
        startTransition(() => {
          setData(nextData);
          setError(null);
        });
      } catch (loadError) {
        if (!active) return;
        const message = loadError instanceof Error ? loadError.message : 'Market data unavailable';
        startTransition(() => setError(message));
      } finally {
        if (active) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    load();
    const interval = window.setInterval(() => load(true), 15000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [deferredMarket]);

  const selectedMarketMeta = data.markets.find((market) => normalizeMarketId(market.symbol) === normalizeMarketId(deferredMarket));
  const selectedTicker = data.tickers.find((ticker) => normalizeMarketId(ticker.market) === normalizeMarketId(deferredMarket));
  const marketLeaders = data.tickers.slice(0, 6);
  const bestAsk = data.asks[0];
  const bestBid = data.bids[0];
  const spread = bestAsk && bestBid ? bestAsk.price - bestBid.price : 0;
  const spreadBps = bestAsk && bestBid && bestAsk.price > 0 ? (spread / bestAsk.price) * 10000 : 0;
  const quoteVolume = selectedTicker ? selectedTicker.amount || selectedTicker.volume * selectedTicker.last : 0;

  return (
    <div className="min-h-screen overflow-hidden bg-[hsl(var(--trading-bg))] text-[hsl(var(--trading-text))]">
      <Navigation />

      <main className="relative">
        <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden border-b border-slate-800/80">
          <div className="absolute inset-0">
            <img
              src="/trade.png"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover opacity-18"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--trading-bg))_0%,hsl(var(--trading-bg)/0.94)_38%,hsl(var(--trading-bg)/0.76)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.045)_1px,transparent_1px)] bg-[size:44px_44px]" />
          </div>

          <div className="relative mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-5 px-4 py-6 sm:px-5 lg:grid-cols-[0.88fr_1.12fr] lg:px-6 xl:py-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex min-h-[34rem] flex-col justify-between gap-6 py-2"
            >
              <div>
                <div className="mb-4 inline-flex items-center gap-2 border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-semibold uppercase text-emerald-200">
                  <Activity className="h-3.5 w-3.5" />
                  Global digital asset exchange
                </div>
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                  Orbitex
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                  Institutional crypto market access with live execution surfaces, guarded account operations, and dense trading intelligence built for professional desks.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href="/auth/signin"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                  >
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/trade"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-slate-700 bg-slate-950/70 px-4 text-sm font-semibold text-slate-100 transition hover:border-emerald-300/60 hover:bg-slate-900"
                  >
                    Open Trade Desk
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-slate-800 bg-slate-950/40 px-4 text-sm font-semibold text-slate-300 transition hover:text-white"
                  >
                    Dashboard
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <TrustMetric icon={ShieldCheck} label="Custody Controls" value="Layered" />
                <TrustMetric icon={Zap} label="Execution Path" value="<1s" />
                <TrustMetric icon={Globe2} label="Markets" value={`${data.markets.length || '--'}`} />
                <TrustMetric icon={Clock3} label="Uptime Target" value="99.99%" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08 }}
              className="min-w-0"
            >
              <LiveTerminal
                data={data}
                error={error}
                isLoading={isLoading}
                isRefreshing={isRefreshing}
                marketLeaders={marketLeaders}
                quoteVolume={quoteVolume}
                selectedMarket={selectedMarket}
                selectedMarketMeta={selectedMarketMeta}
                selectedTicker={selectedTicker}
                spread={spread}
                spreadBps={spreadBps}
                onMarketChange={setSelectedMarket}
              />
            </motion.div>
          </div>
        </section>

        <section className="border-b border-slate-800/80 bg-slate-950/60">
          <div className="mx-auto grid max-w-[1800px] grid-cols-1 gap-4 px-4 py-5 sm:px-5 md:grid-cols-3 lg:px-6">
            <CapabilityCard icon={LockKeyhole} title="Account Security" text="Bearer-token protected account routes, guarded role access, and hardened operational controls." />
            <CapabilityCard icon={LineChart} title="Market Intelligence" text="Live ticker, order-book, and recent trade feeds normalized for dense professional workflows." />
            <CapabilityCard icon={Sparkles} title="Local Agents" text="Deterministic in-browser agents summarize liquidity, activity, and execution posture without new secrets." />
          </div>
        </section>
      </main>
    </div>
  );
}

function TrustMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="border border-slate-800 bg-slate-950/70 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Icon className="h-4 w-4 text-emerald-300" />
        <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
      </div>
      <div className="text-lg font-semibold text-white">{value}</div>
      <div className="mt-1 text-[11px] uppercase text-slate-500">{label}</div>
    </div>
  );
}

function LiveTerminal({
  data,
  error,
  isLoading,
  isRefreshing,
  marketLeaders,
  onMarketChange,
  quoteVolume,
  selectedMarket,
  selectedMarketMeta,
  selectedTicker,
  spread,
  spreadBps,
}: {
  data: TerminalData;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  marketLeaders: Ticker[];
  onMarketChange: (market: string) => void;
  quoteVolume: number;
  selectedMarket: string;
  selectedMarketMeta: Market | undefined;
  selectedTicker: Ticker | undefined;
  spread: number;
  spreadBps: number;
}) {
  return (
    <div className="border border-slate-800 bg-slate-950/88 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="flex flex-col gap-3 border-b border-slate-800 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            HTTP live terminal
            {isRefreshing && <RefreshCw className="h-3 w-3 animate-spin text-emerald-300" />}
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <h2 className="text-xl font-semibold text-white">{displayMarket(selectedMarketMeta || selectedMarket)}</h2>
            <span className={cn('font-mono text-sm', metricTone(selectedTicker?.change || 0))}>
              {selectedTicker ? formatPercentage(selectedTicker.change) : '--'}
            </span>
          </div>
        </div>
        <select
          value={selectedMarket}
          onChange={(event) => onMarketChange(normalizeMarketId(event.target.value))}
          className="h-9 rounded-md border border-slate-700 bg-[hsl(222_40%_8%_/_1)] px-3 text-sm text-slate-100 outline-none transition focus:border-emerald-300"
        >
          {(data.markets.length ? data.markets : [{ symbol: DEFAULT_MARKET, name: 'BTC/USD' }]).map((market: any) => (
            <option key={market.symbol} value={normalizeMarketId(market.symbol)}>
              {displayMarket(market)}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="border-b border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
          Market data delayed: {error}
        </div>
      )}

      <div className="grid grid-cols-2 border-b border-slate-800 sm:grid-cols-4">
        <TerminalMetric label="Last Price" value={formatPrice(selectedTicker?.last)} />
        <TerminalMetric label="24h High" value={formatPrice(selectedTicker?.high)} />
        <TerminalMetric label="24h Low" value={formatPrice(selectedTicker?.low)} />
        <TerminalMetric label="Quote Volume" value={formatPrice(quoteVolume)} />
      </div>

      <div className="border-b border-slate-800 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase text-slate-400">Market Pulse</span>
          <span className="text-[11px] text-slate-500">
            {data.lastUpdated ? data.lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--'}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {marketLeaders.length ? marketLeaders.map((ticker) => (
            <button
              key={ticker.market}
              type="button"
              onClick={() => onMarketChange(ticker.market)}
              className={cn(
                'min-w-[9.5rem] border px-3 py-2 text-left transition',
                normalizeMarketId(selectedMarket) === normalizeMarketId(ticker.market)
                  ? 'border-emerald-300/60 bg-emerald-300/10'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-600'
              )}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-white">{splitMarketLabel(ticker.market)}</span>
                {ticker.change >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-emerald-300" /> : <TrendingDown className="h-3.5 w-3.5 text-red-300" />}
              </div>
              <div className="mt-1 font-mono text-xs text-slate-300">{formatPrice(ticker.last)}</div>
            </button>
          )) : (
            <div className="w-full border border-dashed border-slate-800 px-3 py-4 text-center text-xs text-slate-500">
              {isLoading ? 'Loading markets...' : 'No ticker rows returned.'}
            </div>
          )}
        </div>
      </div>

      <div className="grid min-h-[24rem] grid-cols-1 lg:grid-cols-[1fr_0.9fr]">
        <div className="border-b border-slate-800 lg:border-b-0 lg:border-r">
          <div className="grid grid-cols-2 border-b border-slate-800">
            <AgentTile label="Spread" value={spread > 0 ? `${formatCurrency(spread)} / ${formatNumber(spreadBps, 1)} bps` : '--'} tone="emerald" />
            <AgentTile label="Liquidity Agent" value={data.asks.length + data.bids.length > 8 ? 'Depth normal' : 'Thin book'} tone={data.asks.length + data.bids.length > 8 ? 'emerald' : 'amber'} />
          </div>
          <OrderBookTable asks={data.asks} bids={data.bids} loading={isLoading} />
        </div>
        <div>
          <div className="border-b border-slate-800 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Recent Trades</span>
              <BarChart3 className="h-4 w-4 text-slate-500" />
            </div>
          </div>
          <RecentTrades trades={data.trades} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}

function TerminalMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-r border-slate-800 p-3 last:border-r-0">
      <div className="text-[11px] uppercase text-slate-500">{label}</div>
      <div className="mt-1 font-mono text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function AgentTile({ label, value, tone }: { label: string; value: string; tone: 'emerald' | 'amber' }) {
  return (
    <div className="p-3">
      <div className="text-[11px] uppercase text-slate-500">{label}</div>
      <div className={cn('mt-1 text-sm font-semibold', tone === 'emerald' ? 'text-emerald-200' : 'text-amber-200')}>
        {value}
      </div>
    </div>
  );
}

function OrderBookTable({ asks, bids, loading }: { asks: OrderRow[]; bids: OrderRow[]; loading: boolean }) {
  const rows = [...asks.map((row) => ({ ...row, side: 'ask' })), ...bids.map((row) => ({ ...row, side: 'bid' }))];

  return (
    <div className="p-3">
      <div className="mb-2 grid grid-cols-3 text-[11px] uppercase text-slate-500">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>
      <div className="space-y-1">
        {rows.length ? rows.map((row, index) => (
          <div key={`${row.side}-${row.price}-${index}`} className="grid grid-cols-3 rounded-sm bg-slate-900/45 px-2 py-1.5 font-mono text-xs">
            <span className={row.side === 'ask' ? 'text-red-300' : 'text-emerald-300'}>{formatPrice(row.price)}</span>
            <span className="text-right text-slate-300">{formatCompactNumber(row.amount, 5)}</span>
            <span className="text-right text-slate-500">{formatPrice(row.total)}</span>
          </div>
        )) : (
          <div className="border border-dashed border-slate-800 py-12 text-center text-xs text-slate-500">
            {loading ? 'Loading order book...' : 'Order book is empty.'}
          </div>
        )}
      </div>
    </div>
  );
}

function RecentTrades({ trades, loading }: { trades: TradeRow[]; loading: boolean }) {
  return (
    <div className="p-3">
      <div className="mb-2 grid grid-cols-[0.7fr_1fr_1fr] text-[11px] uppercase text-slate-500">
        <span>Time</span>
        <span className="text-right">Price</span>
        <span className="text-right">Amount</span>
      </div>
      <div className="space-y-1">
        {trades.length ? trades.map((trade) => (
          <div key={trade.id} className="grid grid-cols-[0.7fr_1fr_1fr] rounded-sm bg-slate-900/45 px-2 py-1.5 font-mono text-xs">
            <span className="text-slate-500">{trade.createdAt}</span>
            <span className={cn('text-right', trade.side === 'sell' ? 'text-red-300' : 'text-emerald-300')}>{formatPrice(trade.price)}</span>
            <span className="text-right text-slate-300">{formatCompactNumber(trade.amount, 5)}</span>
          </div>
        )) : (
          <div className="border border-dashed border-slate-800 py-12 text-center text-xs text-slate-500">
            {loading ? 'Loading trades...' : 'No recent trades returned.'}
          </div>
        )}
      </div>
    </div>
  );
}

function CapabilityCard({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="border border-slate-800 bg-slate-950/70 p-4">
      <div className="mb-4 flex items-center justify-between">
        <Icon className="h-5 w-5 text-emerald-300" />
        <span className="h-px w-14 bg-gradient-to-r from-emerald-300/80 to-transparent" />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}
