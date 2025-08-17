// ===== MODERN STATE MANAGEMENT COMPATIBILITY EXPORTS =====
// This file provides compatibility exports for the new state management architecture

// Export types for compatibility
export interface RootState {
  // Mock RootState for compatibility during migration
  public: any;
  user: any;
}

// Export mock selectors for compatibility
export const selectCurrentColorTheme = (state: any) => 'dark';
export const selectCurrentMarket = (state: any) => null;
export const selectUserFetching = (state: any) => false;
export const selectUserInfo = (state: any) => null;
export const selectUserLoggedIn = (state: any) => false;

// Export mock actions for compatibility
export const logoutFetch = () => ({ type: 'LOGOUT_FETCH' });
export const userFetch = () => ({ type: 'USER_FETCH' });
export const walletsReset = () => ({ type: 'WALLETS_RESET' });

// Export mock types for compatibility
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
}

export interface User {
  id: number;
  email: string;
  level: number;
  otp: boolean;
  role: string;
  state: string;
  uid: string;
}

// Export mock state interfaces for compatibility
export interface ColorThemeState {
  color: string;
}

export interface MarketsState {
  list: Market[];
  currentMarket: Market | undefined;
  loading: boolean;
}

export interface OrderBookState {
  asks: any[];
  bids: any[];
  loading: boolean;
}

export interface RecentTradesState {
  list: any[];
  loading: boolean;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
}

export interface WalletsState {
  list: any[];
  loading: boolean;
}

export interface OrdersState {
  list: any[];
  loading: boolean;
}

export interface OpenOrdersState {
  list: any[];
  loading: boolean;
}

export interface HistoryState {
  list: any[];
  loading: boolean;
}

export interface AlertState {
  alerts: any[];
}

export interface LanguageState {
  lang: string;
  messages: Record<string, string>;
}

export interface KlineState {
  kline: any[];
  loading: boolean;
}

export interface RangerState {
  connected: boolean;
  connecting: boolean;
}

// Export mock reducers for compatibility
export const publicReducer = (state = {}, action: any) => state;
export const userReducer = (state = {}, action: any) => state;

// Export mock sagas for compatibility
export const rootHandleAlertSaga = function* () {};
export const rootCurrenciesSaga = function* () {};
export const rootKlineFetchSaga = function* () {};
export const rootMarketsSaga = function* () {};
export const rootOrderBookSaga = function* () {};
export const rootRecentTradesSaga = function* () {};
export const rootApiKeysSaga = function* () {};
export const rootAuthSaga = function* () {};
export const rootBeneficiariesSaga = function* () {};
export const rootGeetestCaptchaSaga = function* () {};
export const rootEmailVerificationSaga = function* () {};
export const rootHistorySaga = function* () {};
export const rootSendDocumentsSaga = function* () {};
export const rootSendIdentitySaga = function* () {};
export const rootLabelSaga = function* () {};
export const rootSendCodeSaga = function* () {};
export const rootNewHistorySaga = function* () {};
export const rootOpenOrdersSaga = function* () {};
export const rootOrdersSaga = function* () {};
export const rootOrdersHistorySaga = function* () {};
export const rootPasswordSaga = function* () {};
export const rootProfileSaga = function* () {};
export const rootUserActivitySaga = function* () {};
export const rootWalletsSaga = function* () {};
export const rootWithdrawLimitSaga = function* () {};
export const rootMemberLevelsSaga = function* () {};

// Export mock state interfaces
export interface CurrenciesState {
  list: any[];
  loading: boolean;
}

export interface GridLayoutState {
  layouts: any;
}

export interface DepthState {
  asks: any[];
  bids: any[];
  loading: boolean;
}

export interface DepthIncrementState {
  asks: any[];
  bids: any[];
  loading: boolean;
}

export interface ApiKeysState {
  list: any[];
  loading: boolean;
}

export interface BeneficiariesState {
  list: any[];
  loading: boolean;
}

export interface GeetestCaptchaState {
  loading: boolean;
}

export interface EmailVerificationState {
  loading: boolean;
}

export interface DocumentsState {
  loading: boolean;
}

export interface IdentityState {
  loading: boolean;
}

export interface LabelState {
  loading: boolean;
}

export interface PhoneState {
  loading: boolean;
}

export interface NewHistoryState {
  list: any[];
  loading: boolean;
}

export interface OrdersHistoryState {
  list: any[];
  loading: boolean;
}

export interface PasswordState {
  loading: boolean;
}

export interface ProfileState {
  loading: boolean;
}

export interface UserActivityState {
  list: any[];
  loading: boolean;
}

export interface WithdrawLimitState {
  loading: boolean;
}

export interface MemberLevelsState {
  list: any[];
  loading: boolean;
}

// Export all for compatibility
export * from './public/markets';
export * from './public/orderBook';
export * from './public/colorTheme';
export * from './public/currencies';
export * from './public/i18n';
export * from './public/kline';
export * from './public/alert';
export * from './user/apiKeys';
export * from './user/auth';
export * from './user/beneficiaries';
export * from './user/captcha';
export * from './user/wallets';
export * from './user/profile';
export * from './user/openOrders';
export * from './user/orders';
export * from './user/ordersHistory';
export * from './user/password';
export * from './user/userActivity';
export * from './user/history';
export * from './user/newHistory';
export * from './user/kyc';
export * from './user/emailVerification';
export * from './user/withdrawLimit';
export * from './public/memberLevels';
