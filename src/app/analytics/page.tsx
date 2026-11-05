"use client";

import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, BookOpen, LineChart, RadioTower, Sigma } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePublicMarkets, usePublicTickers } from '@/lib/api/services/public';
import { useKline, useMarketTrades, useOrderBook } from '@/lib/api/services/trading';
import { buildAgentInsights, buildPortfolioSnapshot, displayMarket, normalizeTickers } from '@/lib/ambient-exchange';
import { formatCurrency, formatNumber, formatPercentage, toFiniteNumber } from '@/lib/utils';
import { AgentConsole, AmbientPageShell, AmbientPanel, MetricTile } from '@/components/ambient/AmbientExchange';

function sumBook(rows: unknown): number {
  if (!Array.isArray(rows)) return 0;
  return rows.reduce((sum, row: any) => sum + toFiniteNumber(Array.isArray(row) ? row[1] : row?.remaining_volume ?? row?.volume ?? row?.amount), 0);
}

function candleClose(row: any): number {
  return Array.isArray(row) ? toFiniteNumber(row[4]) : toFiniteNumber(row?.close);
}

function candleHigh(row: any): number {
  return Array.isArray(row) ? toFiniteNumber(row[2]) : toFiniteNumber(row?.high);
}

function candleLow(row: any): number {
  return Array.isArray(row) ? toFiniteNumber(row[3]) : toFiniteNumber(row?.low);
}

function candleVolume(row: any): number {
  return Array.isArray(row) ? toFiniteNumber(row[5]) : toFiniteNumber(row?.volume);
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [selectedMarket, setSelectedMarket] = useState('btcusd');
  const { data: markets = [] } = usePublicMarkets();
  const { data: rawTickers = [] } = usePublicTickers();
  const { data: orderBook } = useOrderBook(selectedMarket, 25);
  const { data: trades = [] } = useMarketTrades(selectedMarket, 50);
  const { data: kline } = useKline(selectedMarket, '1m', 60);

  useEffect(() => {
    if (markets.length && !markets.some((market) => market.id === selectedMarket)) {
      setSelectedMarket(markets[0]?.id || 'btcusd');
    }
  }, [markets, selectedMarket]);

  const tickers = useMemo(() => normalizeTickers(rawTickers, markets), [rawTickers, markets]);
  const selectedTicker = tickers.find((ticker) => ticker.market === selectedMarket);
  const asks = Array.isArray((orderBook as any)?.asks) ? (orderBook as any).asks : [];
  const bids = Array.isArray((orderBook as any)?.bids) ? (orderBook as any).bids : [];
  const askDepth = sumBook(asks);
  const bidDepth = sumBook(bids);
  const imbalance = askDepth + bidDepth > 0 ? ((bidDepth - askDepth) / (askDepth + bidDepth)) * 100 : 0;
  const candles = Array.isArray((kline as any)?.k_line) ? (kline as any).k_line : [];
  const lastClose = candles.length ? candleClose(candles[candles.length - 1]) : selectedTicker?.last ?? 0;
  const high = candles.reduce((max: number, row: any) => Math.max(max, candleHigh(row)), 0);
  const low = candles.reduce((min: number, row: any) => {
    const value = candleLow(row);
    return min === 0 ? value : Math.min(min, value || min);
  }, 0);
  const candleVolumeTotal = candles.reduce((sum: number, row: any) => sum + candleVolume(row), 0);
  const pseudoPortfolio = buildPortfolioSnapshot([], rawTickers, markets);
  const insights = buildAgentInsights(pseudoPortfolio, tickers);

  return (
    <AmbientPageShell
      user={user}
      title="Market Analytics"
      description="HTTP-live microstructure analytics from verified backend-rust market endpoints. Disabled HFT endpoints are intentionally not used."
      tickers={tickers}
      actions={
        <select value={selectedMarket} onChange={(event) => setSelectedMarket(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-white outline-none">
          {markets.map((market) => <option key={market.id} value={market.id}>{displayMarket(market.id, markets)}</option>)}
        </select>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Last Price" value={lastClose ? formatCurrency(lastClose) : '--'} detail={displayMarket(selectedMarket, markets)} icon={LineChart} tone="success" />
        <MetricTile label="24h Change" value={formatPercentage(selectedTicker?.change ?? 0)} detail="Public ticker stream" icon={Activity} tone={(selectedTicker?.change ?? 0) >= 0 ? 'success' : 'danger'} />
        <MetricTile label="Book Imbalance" value={formatPercentage(imbalance)} detail="Positive means bid-heavy" icon={BookOpen} tone={Math.abs(imbalance) > 25 ? 'warning' : 'info'} />
        <MetricTile label="Candle Volume" value={formatNumber(candleVolumeTotal, 4)} detail="Last 60 one-minute rows" icon={BarChart3} tone="neutral" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <AmbientPanel title="Microstructure Board" icon={Sigma}>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-md border border-slate-700 bg-slate-950/55 p-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Range</div>
              <div className="mt-1.5 text-lg font-bold text-white">{high && low ? formatCurrency(high - low) : '--'}</div>
              <div className="mt-1 text-sm text-slate-400">High {high ? formatCurrency(high) : '--'} / Low {low ? formatCurrency(low) : '--'}</div>
            </div>
            <div className="rounded-md border border-slate-700 bg-slate-950/55 p-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Bid Depth</div>
              <div className="mt-1.5 text-lg font-bold text-emerald-300">{formatNumber(bidDepth, 6)}</div>
              <div className="mt-1 text-sm text-slate-400">Top {bids.length} normalized bid rows</div>
            </div>
            <div className="rounded-md border border-slate-700 bg-slate-950/55 p-3">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Ask Depth</div>
              <div className="mt-1.5 text-lg font-bold text-red-300">{formatNumber(askDepth, 6)}</div>
              <div className="mt-1 text-sm text-slate-400">Top {asks.length} normalized ask rows</div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <div className="rounded-md border border-slate-700 bg-slate-950/55 p-3">
              <h3 className="mb-3 font-bold text-white">Top Bids</h3>
              <div className="space-y-2">
                {bids.slice(0, 10).map((row: any, index: number) => (
                  <div key={`bid-${index}`} className="grid grid-cols-3 gap-3 font-mono text-sm"><span className="text-emerald-300">{formatCurrency(row[0])}</span><span className="text-slate-300">{formatNumber(row[1], 6)}</span><span className="text-right text-slate-500">#{index + 1}</span></div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-slate-700 bg-slate-950/55 p-3">
              <h3 className="mb-3 font-bold text-white">Top Asks</h3>
              <div className="space-y-2">
                {asks.slice(0, 10).map((row: any, index: number) => (
                  <div key={`ask-${index}`} className="grid grid-cols-3 gap-3 font-mono text-sm"><span className="text-red-300">{formatCurrency(row[0])}</span><span className="text-slate-300">{formatNumber(row[1], 6)}</span><span className="text-right text-slate-500">#{index + 1}</span></div>
                ))}
              </div>
            </div>
          </div>
        </AmbientPanel>

        <div className="space-y-6">
          <AgentConsole insights={insights} />
          <AmbientPanel title="Recent Prints" icon={RadioTower}>
            <div className="space-y-2">
              {trades.slice(0, 12).map((trade: any, index: number) => (
                <div key={`${trade.id || index}-${trade.created_at}`} className="flex items-center justify-between rounded-xl bg-slate-950/55 p-3 font-mono text-sm">
                  <span className={(trade.side || trade.taker_type) === 'sell' ? 'text-red-300' : 'text-emerald-300'}>{String(trade.side || trade.taker_type || 'trade').toUpperCase()}</span>
                  <span className="text-white">{formatCurrency(trade.price)}</span>
                  <span className="text-slate-400">{formatNumber(trade.amount ?? trade.volume, 6)}</span>
                </div>
              ))}
              {!trades.length && <div className="rounded-md border border-slate-700 bg-slate-950/55 p-3 text-xs text-slate-400">No recent public trades returned.</div>}
            </div>
          </AmbientPanel>
        </div>
      </section>
    </AmbientPageShell>
  );
}
