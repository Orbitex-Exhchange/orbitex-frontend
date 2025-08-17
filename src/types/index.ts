// ===== CORE TYPES =====

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// ===== USER & AUTHENTICATION TYPES =====

export interface User extends BaseEntity {
  email: string;
  username: string;
  profile: UserProfile;
  documents: Document[];
  labels: string[];
  phones: string[];
  state: UserState;
  referral_id: string;
  level: number;
  otp: boolean;
  role: UserRole;
  data: string;
}

export interface UserProfile {
  first_name: string;
  last_name: string;
  dob: string;
  address: string;
  postcode: string;
  city: string;
  country: string;
  state: string;
  phone: string;
}

export interface Document {
  label: string;
  upload: string;
  state: DocumentState;
}

export type UserState = 'active' | 'pending' | 'banned';
export type UserRole = 'admin' | 'member' | 'accountant' | 'compliance' | 'technical' | 'support';
export type DocumentState = 'pending' | 'approved' | 'rejected';

// ===== MARKET & TRADING TYPES =====

export interface Market extends BaseEntity {
  id: string;
  name: string;
  base_unit: string;
  quote_unit: string;
  min_price: string;
  max_price: string;
  min_amount: string;
  amount_precision: number;
  price_precision: number;
  state: MarketState;
  position: number;
  data: MarketData;
}

export interface MarketData {
  price: string;
  change: string;
  volume: string;
  high: string;
  low: string;
}

export type MarketState = 'enabled' | 'disabled' | 'hidden';

export interface Ticker {
  at: number;
  name: string;
  base_unit: string;
  quote_unit: string;
  low: string;
  high: string;
  last: string;
  open: string;
  volume: string;
  sell: string;
  buy: string;
  avg_price: string;
  price_change_percent: string;
}

// ===== ORDER TYPES =====

export interface Order extends BaseEntity {
  id: number;
  uuid: string;
  side: OrderSide;
  ord_type: OrderType;
  price: string;
  avg_price: string;
  state: OrderState;
  market: string;
  origin_volume: string;
  remaining_volume: string;
  executed_volume: string;
  trades_count: number;
  trades: Trade[];
}

export type OrderSide = 'buy' | 'sell';
export type OrderType = 'limit' | 'market' | 'stop' | 'stop_limit';
export type OrderState = 'wait' | 'done' | 'cancel' | 'reject';

export interface Trade extends BaseEntity {
  id: number;
  price: string;
  amount: string;
  total: string;
  fee_currency: string;
  fee: string;
  market: string;
  side: OrderSide;
  order_id: number;
}

// ===== WALLET & BALANCE TYPES =====

export interface Wallet extends BaseEntity {
  currency: string;
  balance: string;
  locked: string;
  type: WalletType;
  deposit_address?: string;
  deposit_addresses?: string[];
}

export type WalletType = 'fiat' | 'coin';

export interface Currency extends BaseEntity {
  id: string;
  code: string;
  type: WalletType;
  precision: number;
  position: number;
  icon_url?: string;
  min_deposit_amount: string;
  min_withdraw_amount: string;
  withdraw_fee: string;
  deposit_enabled: boolean;
  withdrawal_enabled: boolean;
  deposit_fee: string;
  min_confirmations: number;
  blockchain_key: string;
  min_collection_amount: string;
  has_memo: boolean;
  visible: boolean;
  networks: CurrencyNetwork[];
}

export interface CurrencyNetwork {
  blockchain_key: string;
  protocol: string;
  currency_id: string;
  contract_address?: string;
  deposit_enabled: boolean;
  withdrawal_enabled: boolean;
  deposit_fee: string;
  withdraw_fee: string;
  min_deposit_amount: string;
  min_withdraw_amount: string;
  min_collection_amount: string;
  min_confirmations: number;
  has_memo: boolean;
}

// ===== ORDER BOOK TYPES =====

export interface OrderBook {
  asks: [string, string][];
  bids: [string, string][];
}

export interface OrderBookEntry {
  price: string;
  amount: string;
  total: string;
  cumulative: string;
}

// ===== K-LINE TYPES =====

export interface KLine {
  time: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

// ===== BENEFICIARY TYPES =====

export interface Beneficiary extends BaseEntity {
  currency: string;
  name: string;
  description?: string;
  data: BeneficiaryData;
  state: BeneficiaryState;
}

export interface BeneficiaryData {
  address?: string;
  account_number?: string;
  bank_name?: string;
  bank_swift_code?: string;
  intermediary_bank_name?: string;
  intermediary_bank_swift_code?: string;
}

export type BeneficiaryState = 'pending' | 'active' | 'disabled';

// ===== DEPOSIT & WITHDRAWAL TYPES =====

export interface Deposit extends BaseEntity {
  currency: string;
  amount: string;
  fee: string;
  txid: string;
  state: DepositState;
  completed_at?: string;
}

export interface Withdrawal extends BaseEntity {
  currency: string;
  amount: string;
  fee: string;
  txid: string;
  state: WithdrawalState;
  completed_at?: string;
}

export type DepositState = 'submitted' | 'canceled' | 'rejected' | 'accepted' | 'collected' | 'skipped' | 'dispatched';
export type WithdrawalState = 'prepared' | 'submitted' | 'canceled' | 'accepted' | 'rejected' | 'processing' | 'succeed' | 'failed' | 'errored';

// ===== API KEY TYPES =====

export interface ApiKey extends BaseEntity {
  kid: string;
  algorithm: 'HS256' | 'RS256';
  scope: string[];
  state: 'active' | 'inactive';
}

// ===== LABEL TYPES =====

export interface Label extends BaseEntity {
  key: string;
  value: string;
  scope: string;
}

// ===== NOTIFICATION TYPES =====

export interface Notification extends BaseEntity {
  title: string;
  content: string;
  type: NotificationType;
  read: boolean;
}

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

// ===== ACTIVITY TYPES =====

export interface UserActivity extends BaseEntity {
  action: string;
  result: 'succeed' | 'failed';
  user_agent: string;
  user_ip: string;
  user_geo: string;
}

// ===== REFERRAL TYPES =====

export interface Referral extends BaseEntity {
  code: string;
  total_referrals: number;
  total_earnings: string;
  referrals: ReferralItem[];
}

export interface ReferralItem extends BaseEntity {
  email: string;
  username: string;
  state: 'pending' | 'active';
}

// ===== COMMON TYPES =====

export interface CommonError {
  code: number;
  message: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ===== WEBSOCKET TYPES =====

export interface WebSocketMessage {
  event: string;
  data: any;
}

export interface TickerEvent {
  event: 'ticker';
  data: Ticker;
}

export interface OrderEvent {
  event: 'order';
  data: Order;
}

export interface TradeEvent {
  event: 'trade';
  data: Trade;
}

export type RangerEvent = TickerEvent | OrderEvent | TradeEvent;

// ===== FORM TYPES =====

export interface OrderFormData {
  market: string;
  side: OrderSide;
  ord_type: OrderType;
  price?: string;
  volume: string;
  stop_price?: string;
}

export interface WithdrawalFormData {
  currency: string;
  amount: string;
  beneficiary_id: string;
  otp_code?: string;
}

// ===== UI TYPES =====

export interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
}

export interface DropdownItem {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: number;
  fixed?: 'left' | 'right';
  sorter?: boolean | ((a: T, b: T) => number);
}

// ===== THEME TYPES =====

export type ColorTheme = 'light' | 'dark';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko' | 'ru' | 'ar';

// ===== CONFIG TYPES =====

export interface AppConfig {
  api: {
    authUrl: string;
    tradeUrl: string;
    applogicUrl: string;
    rangerUrl: string;
    arkeUrl: string;
  };
  minutesUntilAutoLogout?: string;
  rangerReconnectPeriod?: string;
  withCredentials: boolean;
  storage: {
    defaultStorageLimit?: number;
  };
  captcha: {
    captchaType: 'recaptcha' | 'geetest' | 'none';
    siteKey: string;
  };
  gaTrackerKey?: string;
  msAlertDisplayTime?: string;
  incrementalOrderBook: boolean;
}

// ===== REDUX TYPES =====

export interface RootState {
  user: UserState;
  markets: MarketsState;
  orders: OrdersState;
  wallets: WalletsState;
  ui: UIState;
  alerts: AlertsState;
  ranger: RangerState;
}

export interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  error?: CommonError;
}

export interface MarketsState {
  markets: Market[];
  currentMarket?: Market;
  tickers: Record<string, Ticker>;
  loading: boolean;
  error?: CommonError;
}

export interface OrdersState {
  orders: Order[];
  loading: boolean;
  error?: CommonError;
}

export interface WalletsState {
  wallets: Wallet[];
  loading: boolean;
  error?: CommonError;
}

export interface UIState {
  colorTheme: ColorTheme;
  language: Language;
  sidebarOpened: boolean;
  marketSelectorOpened: boolean;
  mobileWallet: string;
}

export interface AlertsState {
  alerts: Alert[];
}

export interface Alert {
  type: NotificationType;
  message: string[];
  code?: number;
}

export interface RangerState {
  connected: boolean;
  connecting: boolean;
  error?: CommonError;
}

// ===== UTILITY TYPES =====

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ValueOf<T> = T[keyof T];

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: CommonError | null;
};

// ===== HIGH-FREQUENCY TRADING SPECIFIC TYPES =====

export interface MarketDepth {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  timestamp: number;
}

export interface TradeStream {
  id: number;
  price: string;
  amount: string;
  side: OrderSide;
  market: string;
  timestamp: number;
}

export interface OrderBookUpdate {
  market: string;
  asks: [string, string][];
  bids: [string, string][];
  timestamp: number;
}

export interface MarketTickerUpdate {
  market: string;
  ticker: Ticker;
  timestamp: number;
}

export interface TradingSession {
  id: string;
  user_id: string;
  market: string;
  start_time: number;
  end_time?: number;
  total_volume: string;
  total_trades: number;
  pnl: string;
}

export interface TradingPerformance {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  total_volume: string;
  total_pnl: string;
  win_rate: number;
  avg_trade_size: string;
  best_trade: string;
  worst_trade: string;
}

// ===== WEBSOCKET CONNECTION TYPES =====

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

export interface WebSocketConnection {
  connected: boolean;
  connecting: boolean;
  reconnectAttempts: number;
  lastHeartbeat: number;
  subscriptions: string[];
}

// ===== REAL-TIME DATA TYPES =====

export interface RealTimeData {
  market: string;
  ticker?: Ticker;
  orderBook?: OrderBook;
  trades?: Trade[];
  klines?: KLine[];
  timestamp: number;
}

export interface DataSubscription {
  id: string;
  type: 'ticker' | 'orderbook' | 'trades' | 'klines';
  market: string;
  interval?: string;
  active: boolean;
}

// ===== PERFORMANCE MONITORING TYPES =====

export interface PerformanceMetrics {
  latency: number;
  throughput: number;
  errorRate: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: number;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  responseTime: number;
  message?: string;
}
