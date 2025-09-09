// V2 API Types - Matching backend response structures

// ===== BASE TYPES =====

export interface ApiResponse<T> {
  data: T;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiError {
  error: {
    code: number;
    message: string;
    errors?: string[];
  };
}

// ===== PUBLIC API TYPES =====

export interface V2Currency {
  id: string;
  code: string;
  name: string;
  type: string;
  blockchain_key?: string;
  parent_id?: string;
  precision: number;
  position: number;
  visible: boolean;
  withdraw_enabled: boolean;
  deposit_enabled: boolean;
  min_deposit_amount: string;
  withdraw_fee: string;
  min_withdraw_amount: string;
  withdraw_limit_24h: string;
  withdraw_limit_72h: string;
  base_factor: number;
  subunits: number;
  data?: any;
  created_at: string;
  updated_at: string;
}

export interface V2Market {
  id: string;
  symbol: string;
  name: string;
  base_unit: string;
  quote_unit: string;
  min_price: string;
  max_price: string;
  min_amount: string;
  amount_precision: number;
  price_precision: number;
  state: string;
  position: number;
  data?: any;
  created_at: string;
  updated_at: string;
}

export interface V2Ticker {
  at: number;
  low: string;
  high: string;
  open: string;
  last: string;
  volume: string;
  amount: string;
  avg_price: string;
  price_change_percent: string;
  bid: string;
  ask: string;
  market: string;
}

export interface V2OrderBook {
  market: string;
  asks: [string, string][];
  bids: [string, string][];
  timestamp: number;
}

export interface V2Trade {
  id: number;
  price: string;
  volume: string;
  amount: string;
  market: string;
  side: 'buy' | 'sell';
  created_at: number;
  order_id?: number;
}

export interface V2KLine {
  timestamp: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  amount: string;
}

export interface V2MemberLevel {
  id: number;
  level: number;
  name: string;
  deposit_enabled: boolean;
  withdraw_enabled: boolean;
  trading_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface V2TradingFee {
  id: number;
  group: string;
  market_id?: string;
  maker: string;
  taker: string;
  created_at: string;
  updated_at: string;
}

export interface V2WithdrawLimit {
  id: number;
  group: string;
  kyc_level: number;
  limit_24_hour: string;
  limit_1_month: string;
  created_at: string;
  updated_at: string;
}

// ===== ACCOUNT API TYPES =====

export interface V2Account {
  currency: string;
  balance: string;
  locked: string;
  created_at: string;
  updated_at: string;
}

export interface V2Deposit {
  id: number;
  currency: string;
  amount: string;
  fee: string;
  txid: string;
  confirmations: number;
  state: string;
  created_at: number;
  updated_at: number;
  completed_at?: number;
  blockchain_key: string;
  from_addresses: string[];
  to_address: string;
  spread: string;
  type: string;
}

export interface V2Withdraw {
  id: number;
  currency: string;
  amount: string;
  fee: string;
  txid: string;
  confirmations: number;
  state: string;
  created_at: number;
  updated_at: number;
  completed_at?: number;
  blockchain_key: string;
  rid: string;
  note?: string;
  type: string;
  error?: string;
}

export interface V2Transaction {
  id: number;
  currency: string;
  amount: string;
  fee: string;
  txid: string;
  state: string;
  created_at: number;
  updated_at: number;
  completed_at?: number;
  blockchain_key: string;
  from_addresses: string[];
  to_address: string;
  type: string;
  reference_type: string;
  reference_id: number;
}

export interface V2Beneficiary {
  id: number;
  currency: string;
  name: string;
  description?: string;
  data: any;
  state: string;
  created_at: string;
  updated_at: string;
}

export interface V2InternalTransfer {
  id: number;
  currency: string;
  amount: string;
  state: string;
  created_at: number;
  updated_at: number;
  completed_at?: number;
  sender_uid: string;
  receiver_uid: string;
  note?: string;
}

export interface V2Stats {
  total_trades: number;
  total_volume: string;
  total_fees: string;
  first_trade_at?: number;
  last_trade_at?: number;
}

// ===== MARKET API TYPES =====

export interface V2Order {
  id: number;
  market: string;
  side: 'buy' | 'sell';
  ord_type: 'limit' | 'market';
  price: string;
  volume: string;
  origin_volume: string;
  executed_volume: string;
  trades_count: number;
  state: string;
  created_at: number;
  updated_at: number;
  trades?: V2Trade[];
}

// ===== ADMIN API TYPES =====

export interface V2Member {
  uid: string;
  email: string;
  level: number;
  role: string;
  group: string;
  state: string;
  created_at: string;
  updated_at: string;
}

// ===== COINGECKO API TYPES =====

export interface V2CoinGeckoPair {
  market: string;
  ticker: V2Ticker;
}

// ===== COINMARKETCAP API TYPES =====

export interface V2CoinMarketCapAsset {
  symbol: string;
  ticker: V2Ticker;
}

// ===== MANAGEMENT API TYPES =====

export interface V2ManagementAccount extends V2Account {
  // Additional fields for management API
}

export interface V2ManagementMember extends V2Member {
  // Additional fields for management API
}

export interface V2ManagementCurrency extends V2Currency {
  // Additional fields for management API
}

export interface V2ManagementMarket extends V2Market {
  // Additional fields for management API
}

// ===== AUTHENTICATION TYPES =====

export interface V2AuthUser {
  sub: string;
  uid: string;
  email: string;
  role: string;
  level: number;
  state: string;
  created_at: number;
  updated_at: number;
}

export interface V2AuthSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: V2AuthUser;
}

export interface V2IdentityConfig {
  captcha_type: string;
  session_timeout: number;
  password_min_entropy: number;
}

export interface V2IdentityUser {
  id: string;
  email: string;
  username: string;
  role: string;
  level: number;
  otp: boolean;
  state: string;
  created_at: string;
  updated_at: string;
}

export interface V2IdentitySession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: V2IdentityUser;
}

// ===== UTILITY TYPES =====

export type V2ApiEndpoint = 
  | 'public/markets'
  | 'public/currencies'
  | 'public/tickers'
  | 'public/tickers/:market'
  | 'public/order_book/:market'
  | 'public/trades/:market'
  | 'public/k/:market'
  | 'public/k_with_pending_trades/:market'
  | 'public/depth/:market'
  | 'public/member_levels'
  | 'public/trading_fees'
  | 'public/withdraw_limits'
  | 'public/webhooks'
  | 'public/timestamp'
  | 'public/time'
  | 'account/balances'
  | 'account/balances/:currency'
  | 'account/deposits'
  | 'account/deposits/:txid'
  | 'account/deposit_address/:currency'
  | 'account/withdraws'
  | 'account/withdraws/:txid'
  | 'account/transactions'
  | 'account/transactions/:txid'
  | 'account/beneficiaries'
  | 'account/beneficiaries/:id'
  | 'account/internal_transfers'
  | 'account/internal_transfers/:id'
  | 'account/stats'
  | 'market/orders'
  | 'market/orders/:id'
  | 'market/orders/:id/cancel'
  | 'market/orders_cancel'
  | 'market/trades'
  | 'market/trades/:id'
  | 'admin/members'
  | 'admin/members/:uid'
  | 'admin/currencies'
  | 'admin/currencies/:id'
  | 'management/accounts'
  | 'management/accounts/:uid/:currency'
  | 'management/members'
  | 'management/members/:uid'
  | 'management/currencies'
  | 'management/currencies/:id'
  | 'management/markets'
  | 'management/markets/:id'
  | 'coingecko/pairs'
  | 'coinmarketcap/assets'
  | 'coinmarketcap/ticker';
