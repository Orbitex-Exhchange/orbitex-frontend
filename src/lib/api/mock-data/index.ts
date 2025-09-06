// Comprehensive mock data exports for the trading application

// Identity API
export type {
  IdentityUser,
  IdentitySession,
  IdentityConfig,
} from './enhanced';

export {
  mockIdentityUsers,
} from './enhanced';

// Resource API
export type {
  UserProfile,
  ApiKey,
  Label,
  Document,
  Phone,
} from './enhanced';

export {
  mockUserProfiles,
  mockApiKeys,
  mockLabels,
  mockDocuments,
  mockPhones,
} from './enhanced';

// Leads API
export type {
  Lead,
} from './enhanced';

export {
  mockLeads,
} from './enhanced';

// Account API
export type {
  AccountBalance,
  AccountDeposit,
  AccountWithdraw,
  Beneficiary,
} from './enhanced';

export {
  mockAccountBalances,
  mockDeposits,
  mockWithdrawals,
  mockBeneficiaries,
} from './enhanced';

// Market API
export type {
  MarketOrder,
  MarketTrade,
} from './enhanced';

export {
  mockMarketOrders,
  mockMarketTrades,
} from './enhanced';

// Public API
export type {
  PublicMarket,
  PublicCurrency,
  PublicTicker,
  PublicOrderBook,
  PublicTrade,
  PublicKLine,
  PublicDepth,
  PublicMemberLevel,
  PublicFeeGroup,
  PublicFee,
} from './enhanced';

export {
  mockPublicMarkets,
  mockPublicCurrencies,
  mockPublicTickers,
  mockPublicOrderBook,
  mockPublicTrades,
  mockPublicKLines,
  mockPublicMemberLevels,
  mockPublicFeeGroups,
  mockPublicFees,
} from './enhanced';

// Notification API
export type {
  Notification,
  NotificationSettings,
} from './enhanced';

export {
  mockNotifications,
  mockNotificationSettings,
} from './enhanced';

// Activity API
export type {
  UserActivity,
} from './enhanced';

export {
  mockUserActivities,
} from './enhanced';

// Referral API
export type {
  Referral,
} from './enhanced';

export {
  mockReferrals,
} from './enhanced';

// Additional Market Data
export {
  mockAdditionalMarkets,
  mockAdditionalCurrencies,
} from './enhanced';

// Utility Functions
export {
  generateMockId,
  generateMockTimestamp,
  generateMockPrice,
  generateMockVolume,
} from './enhanced';

// Legacy mock data (for backward compatibility)
export type {
  User,
  Market,
  Wallet,
  Order,
  Trade,
  OrderBook,
} from '../mock-data';

export {
  mockUsers,
  mockMarkets,
  mockWallets,
  mockOrders,
  mockTrades,
  mockOrderBook,
} from '../mock-data';

// Combined exports for convenience
export const allMockData = {
  // Empty for now to avoid import issues
};
