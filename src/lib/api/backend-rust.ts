import { normalizeMarketId, toFiniteNumber } from '@/lib/utils';

export const BACKEND_RUST_ENDPOINTS = {
  health: '/health',
  public: {
    markets: '/api/v2/public/markets',
    tickers: '/api/v2/public/tickers',
    currencies: '/api/v2/public/currencies',
    tradingFees: '/api/v2/public/trading-fees',
    memberLevels: '/api/v2/public/member-levels',
    withdrawLimits: '/api/v2/public/withdraw-limits',
    timestamp: '/api/v2/public/timestamp',
    version: '/api/v2/public/version',
    ticker: (market: string) => `/api/v2/public/markets/${normalizeMarketId(market)}/tickers`,
    orderBook: (market: string) => `/api/v2/public/markets/${normalizeMarketId(market)}/order-book`,
    trades: (market: string) => `/api/v2/public/markets/${normalizeMarketId(market)}/trades`,
    kline: (market: string) => `/api/v2/public/markets/${normalizeMarketId(market)}/k-line`,
  },
  account: {
    balances: '/api/v2/account/balances',
    balance: (currency: string) => `/api/v2/account/balances/${currency}`,
    deposits: '/api/v2/account/deposits',
    deposit: (txid: string) => `/api/v2/account/deposits/${txid}`,
    depositAddress: (currency: string) => `/api/v2/account/deposit_address/${currency}`,
    withdraws: '/api/v2/account/withdraws',
    withdraw: (txid: string) => `/api/v2/account/withdraws/${txid}`,
    transactions: '/api/v2/account/transactions',
    transaction: (txid: string) => `/api/v2/account/transactions/${txid}`,
    beneficiaries: '/api/v2/account/beneficiaries',
    beneficiary: (id: string | number) => `/api/v2/account/beneficiaries/${id}`,
    internalTransfers: '/api/v2/account/internal-transfers',
    internalTransfer: (id: string | number) => `/api/v2/account/internal-transfers/${id}`,
    stats: '/api/v2/account/stats',
  },
  market: {
    orders: '/api/v2/market/orders',
    order: (id: string | number) => `/api/v2/market/orders/${id}`,
    cancelOrders: '/api/v2/market/orders/cancel',
    trades: '/api/v2/market/trades',
    trade: (id: string | number) => `/api/v2/market/trades/${id}`,
  },
  admin: {
    currencies: '/api/v2/admin/currencies',
    members: '/api/v2/admin/members',
    orders: '/api/v2/admin/orders',
    trades: '/api/v2/admin/trades',
    deposits: '/api/v2/admin/deposits',
    withdraws: '/api/v2/admin/withdraws',
    wallets: '/api/v2/admin/wallets',
    blockchains: '/api/v2/admin/blockchains',
    adjustments: '/api/v2/admin/adjustments',
  },
  management: {
    currencies: '/api/v2/management/currencies/list',
    members: '/api/v2/management/members/list',
    wallets: '/api/v2/management/wallets',
    engines: '/api/v2/management/engines',
    deposits: '/api/v2/management/deposits/get',
    withdraws: '/api/v2/management/withdraws/get',
  },
} as const;

const ROUTE_ALIASES: Array<[RegExp, string]> = [
  [/^\/api\/api_v2\//, '/api/v2/'],
  [/^\/api\/v2\/public\/markets\/tickers\/?$/, BACKEND_RUST_ENDPOINTS.public.tickers],
  [/^\/api\/v2\/public\/trading_fees\/?$/, BACKEND_RUST_ENDPOINTS.public.tradingFees],
  [/^\/api\/v2\/public\/member_levels\/?$/, BACKEND_RUST_ENDPOINTS.public.memberLevels],
  [/^\/api\/v2\/public\/withdraw_limits\/?$/, BACKEND_RUST_ENDPOINTS.public.withdrawLimits],
  [/^\/api\/v2\/public\/health\/?$/, BACKEND_RUST_ENDPOINTS.health],
  [/^\/api\/v2\/account\/internal_transfers(\/.*)?$/, `${BACKEND_RUST_ENDPOINTS.account.internalTransfers}$1`],
  [/^\/api\/v2\/account\/deposits\/address\/([^/?#]+)(.*)?$/, '/api/v2/account/deposit_address/$1$2'],
  [/^\/api\/v2\/market\/orders\/([^/?#]+)\/cancel\/?$/, '/api/v2/market/orders/$1'],
  [/^\/api\/v2\/market\/orders\/bulk\/?$/, BACKEND_RUST_ENDPOINTS.market.cancelOrders],
];

export function normalizeBackendRustEndpoint(endpoint: string = ''): string {
  const suffixIndex = endpoint.search(/[?#]/);
  const path = suffixIndex >= 0 ? endpoint.slice(0, suffixIndex) : endpoint;
  const suffix = suffixIndex >= 0 ? endpoint.slice(suffixIndex) : '';
  let normalized = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;

  for (const [pattern, replacement] of ROUTE_ALIASES) {
    normalized = normalized.replace(pattern, replacement);
  }

  return `${normalized}${suffix}`;
}

export function unwrapBackendData<T = any>(payload: any, collectionKey?: string): T {
  if (payload && typeof payload === 'object') {
    if (collectionKey && collectionKey in payload) return payload[collectionKey] as T;
    if ('data' in payload) return payload.data as T;
  }
  return payload as T;
}

export function normalizeBackendArray<T = any>(payload: any, collectionKey?: string): T[] {
  const unwrapped = unwrapBackendData<any>(payload, collectionKey);
  if (Array.isArray(unwrapped)) return unwrapped as T[];
  if (unwrapped && typeof unwrapped === 'object') return Object.values(unwrapped) as T[];
  return [];
}

export function normalizeBackendTimestamp(value: any): number {
  const raw = value?.timestamp ?? value?.at ?? value?.created_at ?? value;
  const numeric = toFiniteNumber(raw, Number.NaN);
  if (Number.isFinite(numeric)) {
    return numeric > 10_000_000_000 ? numeric : numeric * 1000;
  }

  const parsed = Date.parse(String(raw || ''));
  return Number.isFinite(parsed) ? parsed : Date.now();
}

export function normalizeBackendMarket(raw: any): any {
  const symbol = raw?.symbol ?? raw?.id ?? raw?.market ?? '';
  const id = normalizeMarketId(symbol || `${raw?.base_unit || raw?.base || ''}${raw?.quote_unit || raw?.quote || ''}`);
  const base = raw?.base_unit ?? raw?.base_currency ?? raw?.base ?? id.replace(/(usdt|usdc|usd|eur|zar|btc|eth)$/i, '');
  const quote = raw?.quote_unit ?? raw?.quote_currency ?? raw?.quote ?? '';

  return {
    ...raw,
    id,
    symbol: raw?.symbol ?? id,
    name: raw?.name ?? `${String(base).toUpperCase()}/${String(quote).toUpperCase()}`,
    base_unit: String(base || '').toLowerCase(),
    quote_unit: String(quote || '').toLowerCase(),
    base_currency: raw?.base_currency ?? String(base || '').toUpperCase(),
    quote_currency: raw?.quote_currency ?? String(quote || '').toUpperCase(),
    status: raw?.status ?? raw?.state ?? 'enabled',
    state: raw?.state ?? raw?.status ?? 'enabled',
    min_amount: String(raw?.min_amount ?? raw?.minOrderSize ?? raw?.min_order_size ?? '0'),
    min_price: String(raw?.min_price ?? raw?.priceIncrement ?? raw?.price_increment ?? '0'),
  };
}

export function normalizeBackendMarkets(payload: any): any[] {
  return normalizeBackendArray(payload, 'markets').map(normalizeBackendMarket);
}

export function normalizeBackendTicker(raw: any, marketHint?: string): any {
  const source = raw?.ticker && typeof raw.ticker === 'object' ? raw.ticker : raw || {};
  const market = normalizeMarketId(raw?.market ?? raw?.symbol ?? marketHint ?? '');
  const last = String(source.last ?? raw?.last ?? raw?.last_price ?? raw?.close ?? raw?.price ?? '0');
  const volume = String(source.vol ?? source.volume ?? raw?.volume ?? raw?.vol ?? '0');
  const change = String(source.price_change_percent ?? raw?.price_change_percent ?? raw?.change_percent ?? raw?.change ?? '0');

  return {
    ...raw,
    market,
    at: normalizeBackendTimestamp(raw?.at ?? raw?.timestamp),
    last_price: last,
    bid: String(raw?.bid ?? source.buy ?? raw?.buy ?? last),
    ask: String(raw?.ask ?? source.sell ?? raw?.sell ?? last),
    high: String(source.high ?? raw?.high ?? last),
    low: String(source.low ?? raw?.low ?? last),
    volume,
    amount: String(source.amount ?? raw?.amount ?? '0'),
    change_percent: change,
    price_change_percent: change,
    ticker: {
      buy: String(source.buy ?? raw?.bid ?? raw?.buy ?? last),
      sell: String(source.sell ?? raw?.ask ?? raw?.sell ?? last),
      low: String(source.low ?? raw?.low ?? last),
      high: String(source.high ?? raw?.high ?? last),
      open: String(source.open ?? raw?.open ?? last),
      last,
      vol: volume,
      volume,
      amount: String(source.amount ?? raw?.amount ?? '0'),
      price_change_percent: change,
    },
  };
}

export function normalizeBackendTickers(payload: any): any[] {
  const unwrapped = unwrapBackendData<any>(payload, 'tickers') || {};
  if (Array.isArray(unwrapped)) {
    return unwrapped.map((ticker) => normalizeBackendTicker(ticker, ticker?.market));
  }
  if (unwrapped && typeof unwrapped === 'object') {
    return Object.entries(unwrapped).map(([market, ticker]) => normalizeBackendTicker(ticker, market));
  }
  return [];
}

export function normalizeBackendTickerMap(payload: any): Record<string, any> {
  return normalizeBackendTickers(payload).reduce<Record<string, any>>((acc, ticker) => {
    acc[normalizeMarketId(ticker.market)] = ticker;
    return acc;
  }, {});
}

export function normalizeBackendOrderBookSide(rows: any): [string, string][] {
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row: any): [string, string] | null => {
      if (Array.isArray(row)) return [String(row[0] ?? '0'), String(row[1] ?? '0')];

      const price = row?.price ?? row?.[0];
      const size = row?.quantity ?? row?.remaining_volume ?? row?.origin_volume ?? row?.volume ?? row?.amount ?? row?.size ?? row?.[1];
      return price === undefined || size === undefined ? null : [String(price), String(size)];
    })
    .filter((row: [string, string] | null): row is [string, string] => Boolean(row));
}

export function normalizeBackendOrderBook(payload: any, market: string): any {
  const unwrapped = unwrapBackendData<any>(payload) || {};
  return {
    ...unwrapped,
    market: normalizeMarketId(unwrapped.market ?? market),
    at: normalizeBackendTimestamp(unwrapped.at ?? unwrapped.timestamp),
    asks: normalizeBackendOrderBookSide(unwrapped.asks),
    bids: normalizeBackendOrderBookSide(unwrapped.bids),
  };
}

export function normalizeBackendTrade(raw: any, marketHint?: string, index = 0): any {
  const price = String(raw?.price ?? '0');
  const volume = String(raw?.volume ?? raw?.amount ?? raw?.quantity ?? raw?.size ?? '0');
  return {
    ...raw,
    id: raw?.id ?? index,
    market: normalizeMarketId(raw?.market ?? marketHint ?? ''),
    side: raw?.side ?? raw?.taker_type ?? 'buy',
    taker_type: raw?.taker_type ?? raw?.side ?? 'buy',
    price,
    volume,
    amount: String(raw?.amount ?? volume),
    total: String(raw?.total ?? toFiniteNumber(price) * toFiniteNumber(volume)),
    fee: String(raw?.fee ?? '0'),
    created_at: raw?.created_at ?? raw?.timestamp ?? Date.now(),
    createdAt: raw?.createdAt ?? raw?.created_at ?? raw?.timestamp ?? new Date().toISOString(),
  };
}

export function normalizeBackendTrades(payload: any, marketHint?: string): any[] {
  return normalizeBackendArray(payload, 'trades').map((trade, index) => normalizeBackendTrade(trade, marketHint, index));
}

export function normalizeBackendKline(payload: any, market: string, period: string | number = '1m'): any {
  const unwrapped = unwrapBackendData<any>(payload) || {};
  const rows = Array.isArray(unwrapped.k_line)
    ? unwrapped.k_line
    : Array.isArray(unwrapped.kline)
      ? unwrapped.kline
      : Array.isArray(unwrapped)
        ? unwrapped
        : [];

  return {
    market: normalizeMarketId(unwrapped.market ?? market),
    period: String(unwrapped.period ?? period),
    at: normalizeBackendTimestamp(unwrapped.at ?? unwrapped.timestamp),
    k_line: rows.map((row: any) => {
      if (Array.isArray(row)) {
        return {
          time: toFiniteNumber(row[0]),
          open: String(row[1] ?? '0'),
          high: String(row[2] ?? '0'),
          low: String(row[3] ?? '0'),
          close: String(row[4] ?? '0'),
          volume: String(row[5] ?? '0'),
        };
      }
      return {
        time: toFiniteNumber(row?.time ?? row?.timestamp ?? row?.created_at),
        open: String(row?.open ?? '0'),
        high: String(row?.high ?? '0'),
        low: String(row?.low ?? '0'),
        close: String(row?.close ?? '0'),
        volume: String(row?.volume ?? row?.amount ?? '0'),
      };
    }),
  };
}
