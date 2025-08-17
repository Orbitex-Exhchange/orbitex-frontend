# Enhanced Mock Data Documentation

This directory contains comprehensive mock data for the trading application's API endpoints. The mock data is designed to simulate a real trading platform with realistic data structures and relationships.

## File Structure

- `enhanced.ts` - Main mock data file with all interfaces and data instances
- `index.ts` - Export file for easy importing of all mock data
- `README.md` - This documentation file

## API Endpoints Covered

### 1. Identity API (`/api/v2/barong/identity/`)
- **Users**: User authentication and management
- **Sessions**: Login/logout and session management
- **Configs**: Platform configuration settings

### 2. Resource API (`/api/v2/barong/resource/`)
- **User Profiles**: User profile information and settings
- **API Keys**: Trading API key management
- **Labels**: User labels and tags
- **Documents**: KYC document management
- **Phones**: Phone number verification

### 3. Leads API (`/api/v2/barong/leads/`)
- **Leads**: Lead management for marketing

### 4. Account API (`/api/v2/peatio/account/`)
- **Balances**: User wallet balances
- **Deposits**: Deposit history and management
- **Withdrawals**: Withdrawal history and management
- **Beneficiaries**: Withdrawal address management

### 5. Market API (`/api/v2/peatio/market/`)
- **Orders**: Trading order management
- **Trades**: Trade history and execution

### 6. Public API (`/api/v2/peatio/public/`)
- **Markets**: Available trading pairs
- **Currencies**: Supported cryptocurrencies and fiat
- **Tickers**: Real-time market data
- **Order Books**: Market depth information
- **Trades**: Recent market trades
- **K-Lines**: Historical price data
- **Fees**: Trading fee structure

### 7. Notification API
- **Notifications**: User notifications
- **Notification Settings**: User notification preferences

### 8. Activity API
- **User Activities**: User activity logs

### 9. Referral API
- **Referrals**: Referral program management

## Usage Examples

### Basic Import
```typescript
import { mockUserProfiles, mockAccountBalances } from '@/lib/api/mock-data';
```

### Import All Mock Data
```typescript
import { allMockData } from '@/lib/api/mock-data';

// Access any mock data
const users = allMockData.userProfiles;
const balances = allMockData.accountBalances;
```

### Using Utility Functions
```typescript
import { 
  generateMockId, 
  generateMockTimestamp, 
  generateMockPrice 
} from '@/lib/api/mock-data';

const newId = generateMockId();
const timestamp = generateMockTimestamp();
const price = generateMockPrice(43000, 0.05); // Base price with 5% volatility
```

## Data Structure Examples

### User Profile
```typescript
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
}
```

### Market Order
```typescript
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
}
```

### Account Balance
```typescript
{
  currency: "btc",
  balance: "0.25",
  locked: "0.05",
  type: "coin",
  deposit_address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
}
```

## Supported Markets

The mock data includes the following trading pairs:
- BTC/USDT (Bitcoin)
- ETH/USDT (Ethereum)
- LTC/USDT (Litecoin)
- ADA/USDT (Cardano)

## Supported Currencies

### Cryptocurrencies
- BTC (Bitcoin)
- ETH (Ethereum)
- LTC (Litecoin)
- ADA (Cardano)

### Fiat Currencies
- USDT (Tether)

## State Values

### Order States
- `wait` - Order is waiting to be executed
- `done` - Order is fully executed
- `cancel` - Order is cancelled
- `reject` - Order is rejected

### Deposit States
- `submitted` - Deposit is submitted
- `canceled` - Deposit is cancelled
- `rejected` - Deposit is rejected
- `accepted` - Deposit is accepted
- `collected` - Deposit is collected
- `skipped` - Deposit is skipped
- `dispatched` - Deposit is dispatched

### Withdrawal States
- `prepared` - Withdrawal is prepared
- `submitted` - Withdrawal is submitted
- `canceled` - Withdrawal is cancelled
- `accepted` - Withdrawal is accepted
- `rejected` - Withdrawal is rejected
- `processing` - Withdrawal is processing
- `succeed` - Withdrawal is successful
- `failed` - Withdrawal failed
- `errored` - Withdrawal encountered an error

### User States
- `active` - User account is active
- `pending` - User account is pending verification
- `banned` - User account is banned

## Contributing

When adding new mock data:

1. Define the TypeScript interface in `enhanced.ts`
2. Create realistic mock data instances
3. Export the interface and data from `index.ts`
4. Update this README with new endpoint documentation
5. Ensure data relationships are consistent across endpoints

## Best Practices

1. **Realistic Data**: Use realistic values for prices, volumes, and timestamps
2. **Consistent Relationships**: Ensure IDs and references are consistent across related data
3. **Type Safety**: Use proper TypeScript interfaces for all data structures
4. **Documentation**: Keep this README updated with new endpoints and data structures
5. **Backward Compatibility**: Maintain compatibility with existing mock data usage
