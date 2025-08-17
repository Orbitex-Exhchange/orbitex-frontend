// Mock data for the trading application

export interface User {
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

export interface Market {
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

export interface Wallet {
  currency: string;
  balance: string;
  locked: string;
  type: string;
  deposit_address?: string;
  deposit_addresses?: string[];
}

export interface Order {
  id: number;
  uuid: string;
  side: 'buy' | 'sell';
  ord_type: 'limit' | 'market';
  price: string;
  avg_price: string;
  state: string;
  market: string;
  created_at: string;
  updated_at: string;
  origin_volume: string;
  remaining_volume: string;
  executed_volume: string;
  trades_count: number;
  trades: Trade[];
}

export interface Trade {
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

export interface OrderBook {
  asks: [string, string][];
  bids: [string, string][];
}

// Mock data
export const mockUsers: User[] = [
  {
    id: "1",
    email: "user@example.com",
    username: "testuser",
    profile: {
      first_name: "John",
      last_name: "Doe",
      dob: "1990-01-01",
      address: "123 Main St",
      postcode: "12345",
      city: "New York",
      country: "US",
      state: "NY",
      phone: "+1234567890",
    },
    documents: [],
    labels: [],
    phones: ["+1234567890"],
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    state: "active",
    referral_id: "REF123",
    level: 1,
    otp: false,
    role: "member",
    data: "",
  },
];

export const mockMarkets: Market[] = [
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

export const mockWallets: Wallet[] = [
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
];

export const mockOrders: Order[] = [
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

export const mockTrades: Trade[] = [
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

export const mockOrderBook: OrderBook = {
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
