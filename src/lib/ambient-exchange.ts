import { formatCurrency, formatNumber, formatPercentage, normalizeMarketId, toFiniteNumber } from '@/lib/utils';

export interface AmbientTicker {
  market: string;
  base: string;
  quote: string;
  last: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  amount: number;
  change: number;
  at: number | undefined;
}

export interface AmbientAsset {
  currency: string;
  name: string;
  available: number;
  locked: number;
  total: number;
  price: number;
  value: number;
  change: number;
  market: string | undefined;
  isFiat: boolean;
}

export interface PortfolioSnapshot {
  assets: AmbientAsset[];
  totalValue: number;
  availableValue: number;
  lockedValue: number;
  highestAsset: AmbientAsset | undefined;
  activeAssets: number;
  change24h: number;
}

export interface AgentInsight {
  id: string;
  agent: string;
  title: string;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'critical';
  metric?: string;
}

const FIAT_UNITS = new Set(['usd', 'usdt', 'usdc', 'eur', 'zar', 'gbp']);
const QUOTE_SUFFIXES = ['usdt', 'usdc', 'usd', 'eur', 'zar', 'btc', 'eth'];

export function hasBrowserToken(): boolean {
  return typeof window !== 'undefined' && Boolean(window.localStorage.getItem('access_token'));
}

export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

export function splitMarketId(market: unknown, marketMeta?: { id?: string; base_unit?: string; quote_unit?: string }[]): {
  base: string;
  quote: string;
} {
  const id = normalizeMarketId(market);
  const meta = marketMeta?.find((item) => normalizeMarketId(item.id) === id);
  if (meta?.base_unit && meta?.quote_unit) {
    return { base: String(meta.base_unit).toLowerCase(), quote: String(meta.quote_unit).toLowerCase() };
  }

  const suffix = QUOTE_SUFFIXES.find((quote) => id.endsWith(quote) && id.length > quote.length);
  if (!suffix) return { base: id.slice(0, 3) || id, quote: id.slice(3) || 'usd' };
  return { base: id.slice(0, -suffix.length), quote: suffix };
}

export function normalizeTickerEntry(entry: any, marketMeta?: { id?: string; base_unit?: string; quote_unit?: string }[]): AmbientTicker | null {
  const market = normalizeMarketId(entry?.market ?? entry?.id ?? entry?.symbol);
  const rawTicker = entry?.ticker?.ticker ?? entry?.ticker ?? entry;
  if (!market || !rawTicker) return null;

  const { base, quote } = splitMarketId(market, marketMeta);
  return {
    market,
    base,
    quote,
    last: toFiniteNumber(rawTicker.last ?? rawTicker.close ?? rawTicker.price),
    high: toFiniteNumber(rawTicker.high),
    low: toFiniteNumber(rawTicker.low),
    open: toFiniteNumber(rawTicker.open),
    volume: toFiniteNumber(rawTicker.volume ?? rawTicker.vol),
    amount: toFiniteNumber(rawTicker.amount),
    change: toFiniteNumber(rawTicker.price_change_percent ?? rawTicker.change ?? rawTicker.change_percent),
    at: entry?.ticker?.at ?? entry?.at ? toFiniteNumber(entry?.ticker?.at ?? entry?.at) : undefined,
  };
}

export function normalizeTickers(entries: unknown, marketMeta?: { id?: string; base_unit?: string; quote_unit?: string }[]): AmbientTicker[] {
  if (Array.isArray(entries)) {
    return entries.map((entry) => normalizeTickerEntry(entry, marketMeta)).filter((ticker): ticker is AmbientTicker => Boolean(ticker));
  }

  if (entries && typeof entries === 'object') {
    return Object.entries(entries).map(([market, ticker]) => normalizeTickerEntry({ market, ticker }, marketMeta)).filter((ticker): ticker is AmbientTicker => Boolean(ticker));
  }

  return [];
}

export function displayMarket(market: unknown, marketMeta?: { id?: string; base_unit?: string; quote_unit?: string }[]): string {
  const { base, quote } = splitMarketId(market, marketMeta);
  return `${base.toUpperCase()}/${quote.toUpperCase()}`;
}

export function findTickerForCurrency(currency: string, tickers: AmbientTicker[]): AmbientTicker | undefined {
  const unit = currency.toLowerCase();
  return tickers.find((ticker) => ticker.base === unit && ['usd', 'usdt', 'usdc'].includes(ticker.quote)) ||
    tickers.find((ticker) => ticker.base === unit) ||
    tickers.find((ticker) => ticker.market.startsWith(unit));
}

export function buildPortfolioSnapshot(
  balances: unknown,
  tickerEntries: unknown,
  marketMeta?: { id?: string; base_unit?: string; quote_unit?: string }[]
): PortfolioSnapshot {
  const tickers = normalizeTickers(tickerEntries, marketMeta);
  const assets = asArray<any>(balances).map((balance) => {
    const currency = String(balance?.currency || '').toUpperCase();
    const unit = currency.toLowerCase();
    const available = toFiniteNumber(balance?.balance ?? balance?.available);
    const locked = toFiniteNumber(balance?.locked);
    const total = available + locked;
    const ticker = findTickerForCurrency(unit, tickers);
    const isFiat = FIAT_UNITS.has(unit);
    const price = isFiat ? 1 : toFiniteNumber(ticker?.last);
    const value = total * price;

    return {
      currency,
      name: currencyName(currency),
      available,
      locked,
      total,
      price,
      value,
      change: toFiniteNumber(ticker?.change),
      market: ticker?.market,
      isFiat,
    };
  }).filter((asset) => asset.currency);

  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  const availableValue = assets.reduce((sum, asset) => sum + asset.available * asset.price, 0);
  const lockedValue = assets.reduce((sum, asset) => sum + asset.locked * asset.price, 0);
  const highestAsset = [...assets].sort((a, b) => b.value - a.value)[0];
  const weightedChange = totalValue > 0
    ? assets.reduce((sum, asset) => sum + asset.change * (asset.value / totalValue), 0)
    : 0;

  return {
    assets,
    totalValue,
    availableValue,
    lockedValue,
    highestAsset,
    activeAssets: assets.filter((asset) => asset.total > 0).length,
    change24h: weightedChange,
  };
}

export function buildAgentInsights(snapshot: PortfolioSnapshot, tickers: AmbientTicker[], orders: unknown[] = []): AgentInsight[] {
  const insights: AgentInsight[] = [];
  const concentration = snapshot.highestAsset && snapshot.totalValue > 0 ? snapshot.highestAsset.value / snapshot.totalValue : 0;
  const hotMarket = [...tickers].sort((a, b) => Math.abs(b.change) - Math.abs(a.change))[0];
  const openOrders = asArray<any>(orders).filter((order) => ['wait', 'pending', 'open'].includes(String(order?.state || '').toLowerCase()));

  insights.push({
    id: 'risk-concentration',
    agent: 'Risk Agent',
    title: concentration > 0.65 ? 'Concentration risk elevated' : 'Portfolio concentration normal',
    message: concentration > 0.65 && snapshot.highestAsset
      ? `${snapshot.highestAsset.currency} represents ${formatPercentage(concentration * 100)} of marked portfolio value.`
      : `${snapshot.activeAssets} active assets detected with ${formatCurrency(snapshot.lockedValue)} locked in orders or holds.`,
    severity: concentration > 0.65 ? 'warning' : 'success',
    metric: snapshot.highestAsset ? snapshot.highestAsset.currency : 'Balanced',
  });

  insights.push({
    id: 'market-velocity',
    agent: 'Market Agent',
    title: hotMarket ? `${displayMarket(hotMarket.market)} leads 24h movement` : 'Market data warming up',
    message: hotMarket
      ? `Last ${formatCurrency(hotMarket.last)} with ${formatPercentage(hotMarket.change)} change and ${formatNumber(hotMarket.volume, 4)} base volume.`
      : 'Live ticker polling is online, but no market rows were returned yet.',
    severity: hotMarket && Math.abs(hotMarket.change) > 5 ? 'warning' : 'info',
    metric: hotMarket ? formatPercentage(hotMarket.change) : 'Polling',
  });

  insights.push({
    id: 'execution-watch',
    agent: 'Execution Agent',
    title: openOrders.length > 0 ? 'Open orders require monitoring' : 'No resting orders detected',
    message: openOrders.length > 0
      ? `${openOrders.length} open order${openOrders.length === 1 ? '' : 's'} are active. Review spread and stale order age before adding size.`
      : 'Execution surface is clear. Use limit orders for tight-spread markets and avoid market orders in thin books.',
    severity: openOrders.length > 5 ? 'warning' : 'info',
    metric: `${openOrders.length} open`,
  });

  return insights;
}

export function currencyName(currency: string): string {
  const names: Record<string, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USD: 'US Dollar',
    USDT: 'Tether',
    USDC: 'USD Coin',
    EUR: 'Euro',
    ZAR: 'South African Rand',
    SOL: 'Solana',
    TRX: 'TRON',
    BNB: 'BNB',
    BONK: 'Bonk',
    ONDO: 'Ondo',
    OP: 'Optimism',
  };

  return names[currency.toUpperCase()] || currency.toUpperCase();
}

export function formatDateTime(value: unknown): string {
  const raw = typeof value === 'number' && value < 10_000_000_000 ? value * 1000 : value;
  const date = new Date(raw as string | number | Date);
  return Number.isFinite(date.getTime()) ? date.toLocaleString() : '--';
}

export function safeStatus(value: unknown): string {
  return String(value || 'unknown').replace(/_/g, ' ');
}
