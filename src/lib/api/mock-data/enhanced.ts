// Enhanced mock data for all API endpoints

// ===== IDENTITY API MOCK DATA =====
export interface IdentityUser {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'member' | 'accountant' | 'compliance' | 'technical' | 'support';
  level: number;
  otp: boolean;
  state: 'active' | 'pending' | 'banned';
  created_at: string;
  updated_at: string;
}

export interface IdentitySession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: IdentityUser;
}

export interface IdentityConfig {
  captcha_type: 'recaptcha' | 'geetest' | 'none';
  captcha_id?: string;
  session_timeout: number;
  password_min_entropy: number;
}

// ===== NOTIFICATION API MOCK DATA =====
export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  trading_notifications: boolean;
  security_notifications: boolean;
  marketing_notifications: boolean;
}

// ===== ACTIVITY API MOCK DATA =====
export interface UserActivity {
  id: string;
  action: string;
  result: 'succeed' | 'failed';
  user_agent: string;
  user_ip: string;
  user_geo: string;
  created_at: string;
}

// ===== REFERRAL API MOCK DATA =====
export interface Referral {
  id: string;
  code: string;
  total_referrals: number;
  total_earnings: string;
  referrals: {
    id: string;
    email: string;
    username: string;
    state: 'pending' | 'active';
    created_at: string;
  }[];
  created_at: string;
  updated_at: string;
}

// ===== RESOURCE API MOCK DATA =====
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  profile: {
    first_name: string;
    last_name: string;
    dob: string;
    address: string;
    postcode: string;
    city: string;
    country: string;
    state: string;
    phone: string;
  };
  documents: {
    label: string;
    upload: string;
    state: 'pending' | 'approved' | 'rejected';
  }[];
  labels: string[];
  phones: string[];
  created_at: string;
  updated_at: string;
  state: string;
  referral_id: string;
  level: number;
  otp: boolean;
  role: string;
  data: string;
}

export interface ApiKey {
  id: string;
  kid: string;
  algorithm: 'HS256' | 'RS256';
  scope: string[];
  state: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Label {
  id: string;
  key: string;
  value: string;
  scope: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  upload: string;
  doc_type: string;
  doc_number: string;
  doc_expire: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Phone {
  id: string;
  country: string;
  number: string;
  validated_at: string;
  created_at: string;
  updated_at: string;
}

// ===== LEADS API MOCK DATA =====
export interface Lead {
  id: string;
  email: string;
  state: 'pending' | 'contacted' | 'converted' | 'rejected';
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// ===== ACCOUNT API MOCK DATA =====
export interface AccountBalance {
  currency: string;
  balance: string;
  locked: string;
  type: 'fiat' | 'coin';
  deposit_address?: string;
  deposit_addresses?: string[];
}

export interface AccountDeposit {
  id: string;
  currency: string;
  amount: string;
  fee: string;
  txid: string;
  state: 'submitted' | 'canceled' | 'rejected' | 'accepted' | 'collected' | 'skipped' | 'dispatched';
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface AccountWithdraw {
  id: string;
  currency: string;
  amount: string;
  fee: string;
  txid: string;
  state: 'prepared' | 'submitted' | 'canceled' | 'accepted' | 'rejected' | 'processing' | 'succeed' | 'failed' | 'errored';
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Beneficiary {
  id: string;
  currency: string;
  name: string;
  description?: string;
  data: {
    address?: string;
    account_number?: string;
    bank_name?: string;
    bank_swift_code?: string;
    intermediary_bank_name?: string;
    intermediary_bank_swift_code?: string;
  };
  state: 'pending' | 'active' | 'disabled';
  created_at: string;
  updated_at: string;
}

// ===== MARKET API MOCK DATA =====
export interface MarketOrder {
  id: number;
  uuid: string;
  side: 'buy' | 'sell';
  ord_type: 'limit' | 'market' | 'stop' | 'stop_limit';
  price: string;
  avg_price: string;
  state: 'wait' | 'done' | 'cancel' | 'reject';
  market: string;
  created_at: string;
  updated_at: string;
  origin_volume: string;
  remaining_volume: string;
  executed_volume: string;
  trades_count: number;
  trades: MarketTrade[];
}

export interface MarketTrade {
  id: number;
  price: string;
  amount: string;
  total: string;
  fee_currency: string;
  fee: string;
  market: string;
  created_at: string;
  side: 'buy' | 'sell';
  order_id: number;
}

// ===== PUBLIC API MOCK DATA =====
export interface PublicMarket {
  id: string;
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
  data: {
    price: string;
    change: string;
    volume: string;
    high: string;
    low: string;
  };
}

export interface PublicCurrency {
  id: string;
  code: string;
  type: 'fiat' | 'coin';
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
  code: string;
  blockchain_key: string;
  min_collection_amount: string;
  has_memo: boolean;
  visible: boolean;
  networks: {
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
  }[];
}

export interface PublicTicker {
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

export interface PublicOrderBook {
  asks: [string, string][];
  bids: [string, string][];
}

export interface PublicTrade {
  id: number;
  price: string;
  amount: string;
  total: string;
  market: string;
  created_at: string;
  side: 'buy' | 'sell';
}

export interface PublicKLine {
  time: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface PublicDepth {
  asks: [string, string][];
  bids: [string, string][];
}

export interface PublicMemberLevel {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface PublicFeeGroup {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PublicFee {
  group: string;
  market_id: string;
  maker: string;
  taker: string;
  created_at: string;
  updated_at: string;
}

// ===== MOCK DATA INSTANCES =====

// Identity Users
export const mockIdentityUsers: IdentityUser[] = [
  {
    id: "1",
    email: "admin@mobidax.com",
    username: "admin",
    role: "admin",
    level: 3,
    otp: true,
    state: "active",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-12-01T00:00:00Z",
  },
  {
    id: "2",
    email: "user@mobidax.com",
    username: "trader",
    role: "member",
    level: 1,
    otp: false,
    state: "active",
    created_at: "2023-06-01T00:00:00Z",
    updated_at: "2023-12-01T00:00:00Z",
  },
];

// User Profiles
export const mockUserProfiles: UserProfile[] = [
  {
    id: "1",
    email: "user@mobidax.com",
    username: "trader",
    profile: {
      first_name: "John",
      last_name: "Doe",
      dob: "1990-01-01",
      address: "123 Trading St",
      postcode: "12345",
      city: "Crypto City",
      country: "US",
      state: "CA",
      phone: "+1234567890",
    },
    documents: [
      {
        label: "passport",
        upload: "https://example.com/uploads/passport.pdf",
        state: "approved",
      },
    ],
    labels: ["verified", "trader"],
    phones: ["+1234567890"],
    created_at: "2023-06-01T00:00:00Z",
    updated_at: "2023-12-01T00:00:00Z",
    state: "active",
    referral_id: "REF123",
    level: 1,
    otp: false,
    role: "member",
    data: "",
  },
];

// API Keys
export const mockApiKeys: ApiKey[] = [
  {
    id: "1",
    kid: "api_key_1",
    algorithm: "HS256",
    scope: ["read", "trade"],
    state: "active",
    created_at: "2023-12-01T00:00:00Z",
    updated_at: "2023-12-01T00:00:00Z",
  },
];

// Labels
export const mockLabels: Label[] = [
  {
    id: "1",
    key: "verified",
    value: "true",
    scope: "private",
    created_at: "2023-12-01T00:00:00Z",
    updated_at: "2023-12-01T00:00:00Z",
  },
];

// Documents
export const mockDocuments: Document[] = [
  {
    id: "1",
    upload: "https://example.com/uploads/passport.pdf",
    doc_type: "passport",
    doc_number: "123456789",
    doc_expire: "2025-12-31",
    metadata: { country: "US" },
    created_at: "2023-12-01T00:00:00Z",
    updated_at: "2023-12-01T00:00:00Z",
  },
];

// Phones
export const mockPhones: Phone[] = [
  {
    id: "1",
    country: "US",
    number: "+1234567890",
    validated_at: "2023-12-01T00:00:00Z",
    created_at: "2023-12-01T00:00:00Z",
    updated_at: "2023-12-01T00:00:00Z",
  },
];

// Leads
export const mockLeads: Lead[] = [
  {
    id: "1",
    email: "lead@example.com",
    state: "pending",
    data: { source: "website", interest: "trading" },
    created_at: "2023-12-01T00:00:00Z",
    updated_at: "2023-12-01T00:00:00Z",
  },
];

// Account Balances
export const mockAccountBalances: AccountBalance[] = [
  {
    currency: "usdt",
    balance: "12500.50",
    locked: "500.50",
    type: "fiat",
  },
  {
    currency: "btc",
    balance: "0.25",
    locked: "0.05",
    type: "coin",
    deposit_address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  },
  {
    currency: "eth",
    balance: "2.5",
    locked: "0.1",
    type: "coin",
    deposit_address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  },
];

// Deposits
export const mockDeposits: AccountDeposit[] = [
  {
    id: "1",
    currency: "btc",
    amount: "0.1",
    fee: "0.0001",
    txid: "abc123def456",
    state: "collected",
    created_at: "2023-12-01T10:00:00Z",
    updated_at: "2023-12-01T10:30:00Z",
    completed_at: "2023-12-01T10:30:00Z",
  },
];

// Withdrawals
export const mockWithdrawals: AccountWithdraw[] = [
  {
    id: "1",
    currency: "usdt",
    amount: "1000",
    fee: "1",
    txid: "xyz789abc123",
    state: "succeed",
    created_at: "2023-12-01T11:00:00Z",
    updated_at: "2023-12-01T11:30:00Z",
    completed_at: "2023-12-01T11:30:00Z",
  },
];

// Beneficiaries
export const mockBeneficiaries: Beneficiary[] = [
  {
    id: "1",
    currency: "btc",
    name: "My Bitcoin Wallet",
    description: "Personal Bitcoin wallet",
    data: {
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    },
    state: "active",
    created_at: "2023-12-01T00:00:00Z",
    updated_at: "2023-12-01T00:00:00Z",
  },
];

// Market Orders
export const mockMarketOrders: MarketOrder[] = [
  {
    id: 1,
    uuid: "order-1",
    side: "buy",
    ord_type: "limit",
    price: "43000.00",
    avg_price: "43000.00",
    state: "wait",
    market: "btcusdt",
    created_at: "2023-12-01T10:00:00Z",
    updated_at: "2023-12-01T10:00:00Z",
    origin_volume: "0.1",
    remaining_volume: "0.1",
    executed_volume: "0",
    trades_count: 0,
    trades: [],
  },
];

// Market Trades
export const mockMarketTrades: MarketTrade[] = [
  {
    id: 1,
    price: "43250.50",
    amount: "0.1",
    total: "4325.05",
    fee_currency: "usdt",
    fee: "4.33",
    market: "btcusdt",
    created_at: "2023-12-01T10:30:00Z",
    side: "buy",
    order_id: 1,
  },
];

// Public Markets
export const mockPublicMarkets: PublicMarket[] = [
  {
    id: "btcusdt",
    name: "BTC/USDT",
    base_unit: "btc",
    quote_unit: "usdt",
    min_price: "0.01",
    max_price: "1000000",
    min_amount: "0.0001",
    amount_precision: 4,
    price_precision: 2,
    state: "enabled",
    position: 1,
    data: {
      price: "43250.50",
      change: "2.45",
      volume: "1234567.89",
      high: "44000.00",
      low: "42000.00",
    },
  },
  {
    id: "ethusdt",
    name: "ETH/USDT",
    base_unit: "eth",
    quote_unit: "usdt",
    min_price: "0.01",
    max_price: "100000",
    min_amount: "0.001",
    amount_precision: 3,
    price_precision: 2,
    state: "enabled",
    position: 2,
    data: {
      price: "2650.25",
      change: "-1.23",
      volume: "987654.32",
      high: "2700.00",
      low: "2600.00",
    },
  },
];

// Public Currencies
export const mockPublicCurrencies: PublicCurrency[] = [
  {
    id: "btc",
    code: "BTC",
    type: "coin",
    precision: 8,
    position: 1,
    icon_url: "https://example.com/btc.png",
    min_deposit_amount: "0.001",
    min_withdraw_amount: "0.001",
    withdraw_fee: "0.0005",
    deposit_enabled: true,
    withdrawal_enabled: true,
    deposit_fee: "0",
    min_confirmations: 6,
    blockchain_key: "btc",
    min_collection_amount: "0.001",
    has_memo: false,
    visible: true,
    networks: [
      {
        blockchain_key: "btc",
        protocol: "bitcoin",
        currency_id: "btc",
        deposit_enabled: true,
        withdrawal_enabled: true,
        deposit_fee: "0",
        withdraw_fee: "0.0005",
        min_deposit_amount: "0.001",
        min_withdraw_amount: "0.001",
        min_collection_amount: "0.001",
        min_confirmations: 6,
        has_memo: false,
      },
    ],
  },
];

// Public Tickers
export const mockPublicTickers: PublicTicker[] = [
  {
    at: 1701446400,
    name: "BTC/USDT",
    base_unit: "btc",
    quote_unit: "usdt",
    low: "42000.00",
    high: "44000.00",
    last: "43250.50",
    open: "43000.00",
    volume: "1234567.89",
    sell: "43251.00",
    buy: "43250.00",
    avg_price: "43250.25",
    price_change_percent: "2.45",
  },
];

// Public Order Book
export const mockPublicOrderBook: PublicOrderBook = {
  asks: [
    ["43250.50", "0.5"],
    ["43251.00", "1.2"],
    ["43252.00", "0.8"],
    ["43253.00", "2.1"],
    ["43254.00", "1.5"],
  ],
  bids: [
    ["43249.50", "0.3"],
    ["43249.00", "0.9"],
    ["43248.00", "1.7"],
    ["43247.00", "0.6"],
    ["43246.00", "2.3"],
  ],
};

// Public Trades
export const mockPublicTrades: PublicTrade[] = [
  {
    id: 1,
    price: "43250.50",
    amount: "0.1",
    total: "4325.05",
    market: "btcusdt",
    created_at: "2023-12-01T10:30:00Z",
    side: "buy",
  },
];

// Public K-Lines
export const mockPublicKLines: PublicKLine[] = [
  {
    time: 1701446400,
    open: "43000.00",
    high: "43500.00",
    low: "42800.00",
    close: "43250.50",
    volume: "1234567.89",
  },
];

// Public Member Levels
export const mockPublicMemberLevels: PublicMemberLevel[] = [
  {
    id: "1",
    key: "level_1",
    value: "1",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
];

// Public Fee Groups
export const mockPublicFeeGroups: PublicFeeGroup[] = [
  {
    id: "1",
    name: "Standard",
    description: "Standard trading fees",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
];

// Public Fees
export const mockPublicFees: PublicFee[] = [
  {
    group: "Standard",
    market_id: "btcusdt",
    maker: "0.1",
    taker: "0.2",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
];

// ===== ADDITIONAL MOCK DATA INSTANCES =====

// Notifications
export const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Order Executed",
    content: "Your buy order for 0.1 BTC has been executed at $43,250.50",
    type: "success",
    read: false,
    created_at: "2023-12-01T10:30:00Z",
    updated_at: "2023-12-01T10:30:00Z",
  },
  {
    id: "2",
    title: "Security Alert",
    content: "New login detected from a new device",
    type: "warning",
    read: true,
    created_at: "2023-12-01T09:00:00Z",
    updated_at: "2023-12-01T09:00:00Z",
  },
  {
    id: "3",
    title: "Deposit Confirmed",
    content: "Your deposit of 0.1 BTC has been confirmed",
    type: "info",
    read: false,
    created_at: "2023-12-01T08:00:00Z",
    updated_at: "2023-12-01T08:00:00Z",
  },
];

// Notification Settings
export const mockNotificationSettings: NotificationSettings = {
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  trading_notifications: true,
  security_notifications: true,
  marketing_notifications: false,
};

// User Activities
export const mockUserActivities: UserActivity[] = [
  {
    id: "1",
    action: "login",
    result: "succeed",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    user_ip: "192.168.1.1",
    user_geo: "US",
    created_at: "2023-12-01T10:00:00Z",
  },
  {
    id: "2",
    action: "create_order",
    result: "succeed",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    user_ip: "192.168.1.1",
    user_geo: "US",
    created_at: "2023-12-01T10:15:00Z",
  },
  {
    id: "3",
    action: "withdraw",
    result: "succeed",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    user_ip: "192.168.1.1",
    user_geo: "US",
    created_at: "2023-12-01T09:30:00Z",
  },
];

// Referrals
export const mockReferrals: Referral[] = [
  {
    id: "1",
    code: "REF123",
    total_referrals: 5,
    total_earnings: "125.50",
    referrals: [
      {
        id: "1",
        email: "friend1@example.com",
        username: "friend1",
        state: "active",
        created_at: "2023-11-15T00:00:00Z",
      },
      {
        id: "2",
        email: "friend2@example.com",
        username: "friend2",
        state: "pending",
        created_at: "2023-11-20T00:00:00Z",
      },
    ],
    created_at: "2023-11-01T00:00:00Z",
    updated_at: "2023-12-01T00:00:00Z",
  },
];

// ===== ENHANCED MARKET DATA =====

// Additional Markets
export const mockAdditionalMarkets: PublicMarket[] = [
  {
    id: "ltcusdt",
    name: "LTC/USDT",
    base_unit: "ltc",
    quote_unit: "usdt",
    min_price: "0.01",
    max_price: "10000",
    min_amount: "0.01",
    amount_precision: 2,
    price_precision: 2,
    state: "enabled",
    position: 3,
    data: {
      price: "75.25",
      change: "0.85",
      volume: "54321.67",
      high: "76.00",
      low: "74.50",
    },
  },
  {
    id: "adausdt",
    name: "ADA/USDT",
    base_unit: "ada",
    quote_unit: "usdt",
    min_price: "0.001",
    max_price: "1000",
    min_amount: "1",
    amount_precision: 0,
    price_precision: 4,
    state: "enabled",
    position: 4,
    data: {
      price: "0.4850",
      change: "-2.15",
      volume: "987654.32",
      high: "0.4950",
      low: "0.4750",
    },
  },
];

// Additional Currencies
export const mockAdditionalCurrencies: PublicCurrency[] = [
  {
    id: "ltc",
    code: "LTC",
    type: "coin",
    precision: 8,
    position: 3,
    icon_url: "https://example.com/ltc.png",
    min_deposit_amount: "0.01",
    min_withdraw_amount: "0.01",
    withdraw_fee: "0.001",
    deposit_enabled: true,
    withdrawal_enabled: true,
    deposit_fee: "0",
    min_confirmations: 6,
    blockchain_key: "ltc",
    min_collection_amount: "0.01",
    has_memo: false,
    visible: true,
    networks: [
      {
        blockchain_key: "ltc",
        protocol: "litecoin",
        currency_id: "ltc",
        deposit_enabled: true,
        withdrawal_enabled: true,
        deposit_fee: "0",
        withdraw_fee: "0.001",
        min_deposit_amount: "0.01",
        min_withdraw_amount: "0.01",
        min_collection_amount: "0.01",
        min_confirmations: 6,
        has_memo: false,
      },
    ],
  },
  {
    id: "ada",
    code: "ADA",
    type: "coin",
    precision: 6,
    position: 4,
    icon_url: "https://example.com/ada.png",
    min_deposit_amount: "1",
    min_withdraw_amount: "1",
    withdraw_fee: "1",
    deposit_enabled: true,
    withdrawal_enabled: true,
    deposit_fee: "0",
    min_confirmations: 20,
    blockchain_key: "ada",
    min_collection_amount: "1",
    has_memo: true,
    visible: true,
    networks: [
      {
        blockchain_key: "ada",
        protocol: "cardano",
        currency_id: "ada",
        deposit_enabled: true,
        withdrawal_enabled: true,
        deposit_fee: "0",
        withdraw_fee: "1",
        min_deposit_amount: "1",
        min_withdraw_amount: "1",
        min_collection_amount: "1",
        min_confirmations: 20,
        has_memo: true,
      },
    ],
  },
];

// ===== UTILITY FUNCTIONS =====

export const generateMockId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const generateMockTimestamp = (): string => {
  return new Date().toISOString();
};

export const generateMockPrice = (basePrice: number, volatility: number = 0.05): string => {
  const change = (Math.random() - 0.5) * 2 * volatility;
  const newPrice = basePrice * (1 + change);
  return newPrice.toFixed(2);
};

export const generateMockVolume = (baseVolume: number): string => {
  const change = Math.random() * 0.5 + 0.5; // 50% to 100% of base volume
  return (baseVolume * change).toFixed(2);
};
