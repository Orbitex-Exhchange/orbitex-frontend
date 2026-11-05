"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  CandlestickChart,
  Eye,
  EyeOff,
  Layers,
  RefreshCw,
  ShieldCheck,
  Zap,
} from 'lucide-react';

/** Hyperliquid perps (HIP-3) — orders are EIP-712 signed by the Orbitex
 *  backend and routed to Hyperliquid's on-chain order books. */

interface HlMarket {
  coin: string;
  asset_id: number;
  dex: string;
  szDecimals: number;
  maxLeverage: number;
  markPx?: string;
  oraclePx?: string;
  midPx?: string;
  funding?: string;
  openInterest?: string;
  dayNtlVlm?: string;
  prevDayPx?: string;
}

interface HlStatus {
  network: string;
  trading_enabled: boolean;
  master_address?: string | null;
  signer_address?: string | null;
  default_dex: string;
  venue_reachable?: boolean;
  circuit_breaker_open?: boolean;
  operator_halt?: boolean;
  builder_code?: { address: string; fee_tenths_bps: number } | null;
}

interface HlDex {
  name: string;
  full_name?: string;
}

interface HlPosition {
  position: {
    coin: string;
    szi: string;
    entryPx?: string;
    positionValue?: string;
    unrealizedPnl?: string;
    leverage?: { type: string; value: number };
    liquidationPx?: string | null;
  };
}

interface HlOpenOrder {
  coin: string;
  oid: number;
  side: string;
  limitPx: string;
  sz: string;
  timestamp: number;
}

const num = (v?: string | number | null): number => {
  const n = typeof v === 'string' ? parseFloat(v) : v ?? NaN;
  return Number.isFinite(n) ? (n as number) : NaN;
};

const fmt = (v?: string | number | null, digits = 2): string => {
  const n = num(v);
  return Number.isNaN(n)
    ? '—'
    : n.toLocaleString('en-US', { maximumFractionDigits: digits });
};

const fmtPx = (v?: string | number | null): string => {
  const n = num(v);
  if (Number.isNaN(n)) return '—';
  const digits = n >= 1000 ? 1 : n >= 10 ? 2 : n >= 0.1 ? 4 : 6;
  return n.toLocaleString('en-US', { maximumFractionDigits: digits });
};

// Shorten an EVM address for display: 0x1234…cdef
const maskAddr = (addr?: string | null): string =>
  addr && addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr || '—';

export default function PerpsPage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [status, setStatus] = useState<HlStatus | null>(null);
  const [dexs, setDexs] = useState<HlDex[]>([]);
  const [selectedDex, setSelectedDex] = useState<string>('');
  const [privacy, setPrivacy] = useState(false);
  const [markets, setMarkets] = useState<HlMarket[]>([]);
  const [positions, setPositions] = useState<HlPosition[]>([]);
  const [openOrders, setOpenOrders] = useState<HlOpenOrder[]>([]);
  const [accountValue, setAccountValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [margin, setMargin] = useState<{ currency: string; balance: string; locked: string; available: string } | null>(null);
  const [transferAmt, setTransferAmt] = useState('');
  const [transferring, setTransferring] = useState(false);

  const [selected, setSelected] = useState<string>('');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [size, setSize] = useState('');
  const [price, setPrice] = useState('');
  const [reduceOnly, setReduceOnly] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Privacy mode: mask personal monetary values (persisted locally). Public
  // market data is never masked.
  useEffect(() => {
    setPrivacy(localStorage.getItem('perps_privacy') === '1');
  }, []);
  const togglePrivacy = () => {
    setPrivacy((p) => {
      const next = !p;
      localStorage.setItem('perps_privacy', next ? '1' : '0');
      return next;
    });
  };
  const priv = (v: string): string => (privacy ? '••••' : v);

  const loadPublic = useCallback(async () => {
    try {
      const [statusRes, dexsRes, marketsRes] = await Promise.all([
        api.get('/api/v2/public/hyperliquid/status'),
        api.get('/api/v2/public/hyperliquid/dexs'),
        api.get(`/api/v2/public/hyperliquid/markets?dex=${encodeURIComponent(selectedDex)}`),
      ]);
      const st: HlStatus = statusRes.data;
      // perpDexs returns [null (validator dex), {name, fullName}, …]
      const rawDexs: HlDex[] = [{ name: '', full_name: 'Hyperliquid (core)' }];
      for (const d of dexsRes.data?.dexs ?? []) {
        if (d && d.name) rawDexs.push({ name: d.name, full_name: d.fullName || d.name });
      }
      const mk: HlMarket[] = marketsRes.data?.markets ?? [];
      setStatus(st);
      setDexs(rawDexs);
      setMarkets(mk);
      setLoadError(null);
      setSelected((prev) => (mk.some((m) => m.coin === prev) ? prev : mk[0]?.coin || ''));
    } catch (e: any) {
      setLoadError(e?.message || 'Failed to load Hyperliquid markets');
    } finally {
      setLoading(false);
    }
  }, [selectedDex]);

  const loadAccount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [posRes, ordRes] = await Promise.all([
        api.get('/api/v2/account/hyperliquid/positions'),
        api.get('/api/v2/account/hyperliquid/orders'),
      ]);
      setPositions(
        (posRes.data?.assetPositions ?? []).filter(
          (p: HlPosition) => num(p.position?.szi) !== 0
        )
      );
      setAccountValue(posRes.data?.marginSummary?.accountValue ?? null);
      setOpenOrders(ordRes.data ?? []);
    } catch {
      // account panel is best-effort; public data still renders
    }
    try {
      const m = await api.get('/api/v2/account/hyperliquid/margin');
      setMargin(m.data);
    } catch {
      // margin card is best-effort
    }
  }, [isAuthenticated]);

  const transferMargin = async (direction: 'deposit' | 'withdraw') => {
    const amt = parseFloat(transferAmt);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a positive amount.' });
      return;
    }
    setTransferring(true);
    try {
      const res = await api.post('/api/v2/account/hyperliquid/margin/transfer', {
        amount: amt,
        direction,
      });
      setMargin((prev) => ({ currency: prev?.currency ?? 'usdt', ...res.data }));
      setTransferAmt('');
      toast({
        title: direction === 'deposit' ? 'Margin funded' : 'Margin withdrawn',
        description: `${amt} ${(margin?.currency ?? 'USDT').toUpperCase()} ${direction === 'deposit' ? 'moved to perps margin' : 'returned to exchange wallet'}`,
      });
    } catch (e: any) {
      toast({ title: 'Transfer failed', description: e?.response?.data?.error || e?.message });
    } finally {
      setTransferring(false);
    }
  };

  useEffect(() => {
    loadPublic();
    const t = setInterval(loadPublic, 15000);
    return () => clearInterval(t);
  }, [loadPublic]);

  useEffect(() => {
    loadAccount();
    const t = setInterval(loadAccount, 15000);
    return () => clearInterval(t);
  }, [loadAccount]);

  const selectedMarket = useMemo(
    () => markets.find((m) => m.coin === selected || m.coin.endsWith(`:${selected}`)),
    [markets, selected]
  );

  const submitOrder = async () => {
    if (!selectedMarket) return;
    const sz = parseFloat(size);
    if (!Number.isFinite(sz) || sz <= 0) {
      toast({ title: 'Invalid size', description: 'Enter a positive contract size.' });
      return;
    }
    if (orderType === 'limit' && !(parseFloat(price) > 0)) {
      toast({ title: 'Invalid price', description: 'Enter a positive limit price.' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/api/v2/market/hyperliquid/orders', {
        coin: selectedMarket.coin,
        side,
        type: orderType,
        size: sz,
        ...(orderType === 'limit' ? { price: parseFloat(price), tif: 'Gtc' } : {}),
        reduce_only: reduceOnly,
      });
      const hlStatus = res.data?.result?.status;
      const statuses = res.data?.result?.response?.data?.statuses;
      const rejected = Array.isArray(statuses) && statuses[0]?.error;
      if (hlStatus === 'ok' && !rejected) {
        toast({
          title: 'Order routed to Hyperliquid',
          description: `${side.toUpperCase()} ${sz} ${selectedMarket.coin} (${orderType})`,
        });
        setSize('');
        loadAccount();
      } else {
        toast({ title: 'Order rejected', description: String(rejected || hlStatus || 'unknown error') });
      }
    } catch (e: any) {
      toast({
        title: 'Order failed',
        description: e?.response?.data?.error || e?.message || 'Routing error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelOrder = async (order: HlOpenOrder) => {
    try {
      await api.delete(`/api/v2/market/hyperliquid/orders/${order.oid}?coin=${encodeURIComponent(order.coin)}`);
      toast({ title: 'Cancel sent', description: `Order #${order.oid} (${order.coin})` });
      loadAccount();
    } catch (e: any) {
      toast({ title: 'Cancel failed', description: e?.response?.data?.error || e?.message });
    }
  };

  const change24h = (m: HlMarket): number => {
    const mark = num(m.markPx);
    const prev = num(m.prevDayPx);
    if (Number.isNaN(mark) || Number.isNaN(prev) || prev === 0) return NaN;
    return ((mark - prev) / prev) * 100;
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--trading-bg))] px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--trading-text))] flex items-center gap-2">
            <CandlestickChart className="h-6 w-6 text-[hsl(var(--trading-accent))]" />
            Perpetuals
          </h1>
          <p className="text-sm text-[hsl(var(--trading-text-muted))]">
            On-chain perps routed to Hyperliquid (HIP-3) with EIP-712 signed order flow
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {status && (
            <>
              <span
                className={cn(
                  'px-2 py-1 rounded-md font-medium uppercase tracking-wide',
                  status.network === 'mainnet'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                )}
              >
                {status.network}
              </span>
              <span
                className={cn(
                  'px-2 py-1 rounded-md font-medium',
                  status.trading_enabled
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-red-500/10 text-red-400'
                )}
              >
                {status.trading_enabled ? 'Trading enabled' : 'Read-only'}
              </span>
            </>
          )}

          {/* HIP-3 builder-dex selector */}
          {dexs.length > 1 && (
            <div className="flex items-center gap-1 rounded-md bg-[hsl(var(--trading-bg-tertiary))] px-2 py-1 text-[hsl(var(--trading-text-secondary))]">
              <Layers className="h-3 w-3" />
              <select
                value={selectedDex}
                onChange={(e) => {
                  setSelectedDex(e.target.value);
                  setLoading(true);
                }}
                className="bg-transparent text-[hsl(var(--trading-text))] focus:outline-none"
                aria-label="Select HIP-3 perp dex"
              >
                {dexs.map((d) => (
                  <option key={d.name || 'core'} value={d.name} className="bg-[hsl(var(--trading-bg-secondary))]">
                    {d.name ? `HIP-3: ${d.full_name}` : d.full_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Privacy mode toggle */}
          <button
            onClick={togglePrivacy}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-md transition-colors',
              privacy
                ? 'bg-[hsl(var(--trading-accent))]/15 text-[hsl(var(--trading-accent))]'
                : 'bg-[hsl(var(--trading-bg-tertiary))] text-[hsl(var(--trading-text-secondary))] hover:text-[hsl(var(--trading-text))]'
            )}
            aria-label="Toggle privacy mode"
            title="Hide personal balances & positions"
          >
            {privacy ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {privacy ? 'Private' : 'Privacy'}
          </button>

          <button
            onClick={() => {
              setLoading(true);
              loadPublic();
              loadAccount();
            }}
            className="p-2 rounded-md text-[hsl(var(--trading-text-secondary))] hover:bg-[hsl(var(--trading-bg-tertiary))]"
            aria-label="Refresh"
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Shielded routing explainer — the omnibus + backend-EIP-712 privacy model */}
      {status && (
        <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-[hsl(var(--trading-accent))]/25 bg-[hsl(var(--trading-accent))]/5 px-4 py-2.5 text-xs text-[hsl(var(--trading-text-secondary))]">
          <span className="flex items-center gap-1.5 font-medium text-[hsl(var(--trading-accent))]">
            <ShieldCheck className="h-4 w-4" /> Shielded routing
          </span>
          <span>
            Orders are EIP-712 signed by Orbitex and routed through an omnibus account — your
            wallet and identity never touch the public chain.
          </span>
          <span className="text-[hsl(var(--trading-text-muted))]">
            Venue address {maskAddr(status.master_address)}
            {status.venue_reachable === false && ' · venue unreachable'}
            {status.circuit_breaker_open && ' · breaker open'}
          </span>
        </div>
      )}

      {loadError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Markets table */}
        <div className="xl:col-span-2 rounded-xl border border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] overflow-hidden">
          <div className="px-4 py-3 border-b border-[hsl(var(--trading-border))] text-sm font-semibold text-[hsl(var(--trading-text))]">
            Markets
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[hsl(var(--trading-text-muted))]">
                  <th className="px-4 py-2">Contract</th>
                  <th className="px-4 py-2 text-right">Mark</th>
                  <th className="px-4 py-2 text-right">24h %</th>
                  <th className="px-4 py-2 text-right">Funding / 8h</th>
                  <th className="px-4 py-2 text-right">Open Interest</th>
                  <th className="px-4 py-2 text-right">24h Volume</th>
                  <th className="px-4 py-2 text-right">Max Lev</th>
                </tr>
              </thead>
              <tbody>
                {loading && markets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-[hsl(var(--trading-text-muted))]">
                      Loading Hyperliquid markets…
                    </td>
                  </tr>
                )}
                {markets.map((m) => {
                  const chg = change24h(m);
                  const isSel = selectedMarket?.coin === m.coin;
                  return (
                    <tr
                      key={m.coin}
                      onClick={() => setSelected(m.coin)}
                      className={cn(
                        'cursor-pointer border-t border-[hsl(var(--trading-border))]/50 transition-colors',
                        isSel
                          ? 'bg-[hsl(var(--trading-accent))]/10'
                          : 'hover:bg-[hsl(var(--trading-bg-tertiary))]'
                      )}
                    >
                      <td className="px-4 py-2.5 font-medium text-[hsl(var(--trading-text))]">
                        {m.coin}
                        {m.dex ? (
                          <span className="ml-2 rounded bg-[hsl(var(--trading-accent))]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[hsl(var(--trading-accent))]">
                            HIP-3
                          </span>
                        ) : (
                          <span className="ml-2 text-[10px] text-[hsl(var(--trading-text-muted))]">PERP</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[hsl(var(--trading-text))]">
                        {fmtPx(m.markPx)}
                      </td>
                      <td
                        className={cn(
                          'px-4 py-2.5 text-right tabular-nums',
                          Number.isNaN(chg)
                            ? 'text-[hsl(var(--trading-text-muted))]'
                            : chg >= 0
                              ? 'text-emerald-400'
                              : 'text-red-400'
                        )}
                      >
                        {Number.isNaN(chg) ? '—' : `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%`}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[hsl(var(--trading-text-secondary))]">
                        {Number.isNaN(num(m.funding)) ? '—' : `${(num(m.funding) * 100).toFixed(4)}%`}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[hsl(var(--trading-text-secondary))]">
                        {fmt(m.openInterest, 0)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-[hsl(var(--trading-text-secondary))]">
                        ${fmt(m.dayNtlVlm, 0)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-[hsl(var(--trading-text-secondary))]">
                        {m.maxLeverage}×
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order ticket */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-[hsl(var(--trading-text))] flex items-center gap-2">
                <Zap className="h-4 w-4 text-[hsl(var(--trading-accent))]" />
                {selectedMarket ? `${selectedMarket.coin} — Order` : 'Order'}
              </div>
              {selectedMarket && (
                <div className="text-xs text-[hsl(var(--trading-text-muted))] tabular-nums">
                  Mark {fmtPx(selectedMarket.markPx)}
                </div>
              )}
            </div>

            {/* Side */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => setSide('buy')}
                className={cn(
                  'py-2 rounded-md text-sm font-semibold transition-colors',
                  side === 'buy'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[hsl(var(--trading-bg-tertiary))] text-[hsl(var(--trading-text-secondary))]'
                )}
              >
                Long / Buy
              </button>
              <button
                onClick={() => setSide('sell')}
                className={cn(
                  'py-2 rounded-md text-sm font-semibold transition-colors',
                  side === 'sell'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-[hsl(var(--trading-bg-tertiary))] text-[hsl(var(--trading-text-secondary))]'
                )}
              >
                Short / Sell
              </button>
            </div>

            {/* Type */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {(['market', 'limit'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className={cn(
                    'py-1.5 rounded-md text-xs font-medium capitalize transition-colors',
                    orderType === t
                      ? 'bg-[hsl(var(--trading-accent))]/15 text-[hsl(var(--trading-accent))] border border-[hsl(var(--trading-accent))]/40'
                      : 'bg-[hsl(var(--trading-bg-tertiary))] text-[hsl(var(--trading-text-secondary))]'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <label className="block text-xs text-[hsl(var(--trading-text-muted))] mb-1">
              Size ({selectedMarket?.coin ?? 'contracts'})
            </label>
            <input
              value={size}
              onChange={(e) => setSize(e.target.value)}
              inputMode="decimal"
              placeholder="0.0"
              className="w-full mb-3 px-3 py-2 rounded-md bg-[hsl(var(--trading-bg-tertiary))] border border-[hsl(var(--trading-border))] text-sm text-[hsl(var(--trading-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--trading-accent))]"
            />

            {orderType === 'limit' && (
              <>
                <label className="block text-xs text-[hsl(var(--trading-text-muted))] mb-1">Limit price (USD)</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.0"
                  className="w-full mb-3 px-3 py-2 rounded-md bg-[hsl(var(--trading-bg-tertiary))] border border-[hsl(var(--trading-border))] text-sm text-[hsl(var(--trading-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--trading-accent))]"
                />
              </>
            )}

            <label className="flex items-center gap-2 mb-4 text-xs text-[hsl(var(--trading-text-secondary))]">
              <input
                type="checkbox"
                checked={reduceOnly}
                onChange={(e) => setReduceOnly(e.target.checked)}
                className="accent-[hsl(var(--trading-accent))]"
              />
              Reduce-only
            </label>

            {!isAuthenticated ? (
              <Button className="w-full" variant="outline" disabled>
                Sign in to trade perps
              </Button>
            ) : (
              <Button
                onClick={submitOrder}
                disabled={submitting || !status?.trading_enabled || !selectedMarket}
                className={cn(
                  'w-full font-semibold',
                  side === 'buy'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                )}
              >
                {submitting
                  ? 'Routing…'
                  : `${side === 'buy' ? 'Buy / Long' : 'Sell / Short'} ${selectedMarket?.coin ?? ''}`}
              </Button>
            )}
            {!status?.trading_enabled && (
              <p className="mt-2 text-[11px] text-[hsl(var(--trading-text-muted))]">
                Trading is read-only until the Hyperliquid signer key is configured on the backend.
              </p>
            )}
          </div>

          {/* Margin (collateral) card */}
          {isAuthenticated && (
            <div className="rounded-xl border border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] p-4">
              <div className="text-sm font-semibold text-[hsl(var(--trading-text))] mb-3">
                Perps Margin{margin ? ` (${margin.currency.toUpperCase()})` : ''}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                {[
                  ['Balance', margin?.balance],
                  ['Locked', margin?.locked],
                  ['Available', margin?.available],
                ].map(([label, v]) => (
                  <div key={label as string} className="rounded-md bg-[hsl(var(--trading-bg-tertiary))] px-2 py-2">
                    <div className="text-[10px] uppercase tracking-wide text-[hsl(var(--trading-text-muted))]">{label}</div>
                    <div className="text-sm font-semibold tabular-nums text-[hsl(var(--trading-text))]">{priv(fmt(v ?? '0'))}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={transferAmt}
                  onChange={(e) => setTransferAmt(e.target.value)}
                  inputMode="decimal"
                  placeholder="Amount"
                  className="flex-1 min-w-0 px-3 py-2 rounded-md bg-[hsl(var(--trading-bg-tertiary))] border border-[hsl(var(--trading-border))] text-sm text-[hsl(var(--trading-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--trading-accent))]"
                />
                <Button size="sm" disabled={transferring} onClick={() => transferMargin('deposit')} className="btn-gradient-primary">
                  Fund
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={transferring}
                  onClick={() => transferMargin('withdraw')}
                  className="border-[hsl(var(--trading-border))] text-[hsl(var(--trading-text))]"
                >
                  Withdraw
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-[hsl(var(--trading-text-muted))]">
                Orders lock initial margin (notional ÷ max leverage) from your available balance.
              </p>
            </div>
          )}

          {/* Account panel */}
          {isAuthenticated && (
            <div className="rounded-xl border border-[hsl(var(--trading-border))] bg-[hsl(var(--trading-bg-secondary))] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-semibold text-[hsl(var(--trading-text))] flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[hsl(var(--trading-accent))]" />
                  Positions
                </div>
                {accountValue && (
                  <div className="text-xs text-[hsl(var(--trading-text-muted))] tabular-nums">
                    Equity ${priv(fmt(accountValue))}
                  </div>
                )}
              </div>
              {positions.length === 0 ? (
                <p className="text-xs text-[hsl(var(--trading-text-muted))]">No open positions.</p>
              ) : (
                <div className="space-y-2">
                  {positions.map((p) => {
                    const szi = num(p.position.szi);
                    const pnl = num(p.position.unrealizedPnl);
                    return (
                      <div
                        key={p.position.coin}
                        className="flex items-center justify-between rounded-md bg-[hsl(var(--trading-bg-tertiary))] px-3 py-2 text-xs"
                      >
                        <div>
                          <span className="font-medium text-[hsl(var(--trading-text))]">{p.position.coin}</span>
                          <span className={cn('ml-2 font-semibold', szi >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                            {szi >= 0 ? 'LONG' : 'SHORT'} {priv(String(Math.abs(szi)))}
                          </span>
                        </div>
                        <div className="text-right tabular-nums">
                          <div className="text-[hsl(var(--trading-text-secondary))]">
                            entry {fmtPx(p.position.entryPx)}
                          </div>
                          <div className={cn(pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                            {Number.isNaN(pnl) ? '—' : priv(`${pnl >= 0 ? '+' : ''}$${fmt(pnl)}`)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {openOrders.length > 0 && (
                <>
                  <div className="mt-4 mb-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--trading-text-muted))]">
                    Open orders
                  </div>
                  <div className="space-y-1.5">
                    {openOrders.map((o) => (
                      <div
                        key={o.oid}
                        className="flex items-center justify-between rounded-md bg-[hsl(var(--trading-bg-tertiary))] px-3 py-1.5 text-xs"
                      >
                        <span className="text-[hsl(var(--trading-text-secondary))]">
                          <span className={cn('font-semibold', o.side === 'B' ? 'text-emerald-400' : 'text-red-400')}>
                            {o.side === 'B' ? 'BUY' : 'SELL'}
                          </span>{' '}
                          {priv(o.sz)} {o.coin} @ {fmtPx(o.limitPx)}
                        </span>
                        <button
                          onClick={() => cancelOrder(o)}
                          className="text-red-400 hover:text-red-300 font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
