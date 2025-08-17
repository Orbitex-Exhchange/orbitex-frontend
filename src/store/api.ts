import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from './index';
import { 
  User, 
  Market, 
  Ticker, 
  Order, 
  Trade, 
  Wallet, 
  Currency, 
  Beneficiary,
  Deposit,
  Withdrawal,
  OrderBook,
  KLine,
  PaginationParams,
  PaginatedResponse,
  CommonError,
} from '@/types';

// ===== BASE QUERY CONFIGURATION =====

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v2',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).user.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// ===== API DEFINITION =====

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: [
    'User',
    'Markets',
    'Tickers',
    'Orders',
    'Trades',
    'Wallets',
    'Currencies',
    'Beneficiaries',
    'Deposits',
    'Withdrawals',
    'OrderBook',
    'KLines',
  ],
  endpoints: (builder) => ({
    // ===== USER ENDPOINTS =====
    
    getUser: builder.query<User, void>({
      query: () => '/resource/users/me',
      providesTags: ['User'],
    }),

    updateUser: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: '/resource/users',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // ===== MARKETS ENDPOINTS =====

    getMarkets: builder.query<Market[], void>({
      query: () => '/public/markets',
      providesTags: ['Markets'],
    }),

    getMarket: builder.query<Market, string>({
      query: (marketId) => `/public/markets/${marketId}`,
      providesTags: (result, error, marketId) => [{ type: 'Markets', id: marketId }],
    }),

    getTickers: builder.query<Record<string, Ticker>, void>({
      query: () => '/public/markets/tickers',
      providesTags: ['Tickers'],
    }),

    getTicker: builder.query<Ticker, string>({
      query: (marketId) => `/public/markets/${marketId}/ticker`,
      providesTags: (result, error, marketId) => [{ type: 'Tickers', id: marketId }],
    }),

    // ===== ORDER BOOK ENDPOINTS =====

    getOrderBook: builder.query<OrderBook, { market: string; limit?: number }>({
      query: ({ market, limit = 20 }) => `/public/markets/${market}/order-book?limit=${limit}`,
      providesTags: (result, error, { market }) => [{ type: 'OrderBook', id: market }],
    }),

    // ===== K-LINES ENDPOINTS =====

    getKLines: builder.query<KLine[], { 
      market: string; 
      period: number; 
      timeFrom: number; 
      timeTo: number; 
    }>({
      query: ({ market, period, timeFrom, timeTo }) => 
        `/public/markets/${market}/k-line?period=${period}&time_from=${timeFrom}&time_to=${timeTo}`,
      providesTags: (result, error, { market }) => [{ type: 'KLines', id: market }],
    }),

    // ===== TRADES ENDPOINTS =====

    getTrades: builder.query<Trade[], { market: string; limit?: number }>({
      query: ({ market, limit = 50 }) => `/public/markets/${market}/trades?limit=${limit}`,
      providesTags: (result, error, { market }) => [{ type: 'Trades', id: market }],
    }),

    // ===== ORDERS ENDPOINTS =====

    getOrders: builder.query<PaginatedResponse<Order>, PaginationParams>({
      query: (params) => ({
        url: '/market/orders',
        params,
      }),
      providesTags: ['Orders'],
    }),

    createOrder: builder.mutation<Order, {
      market: string;
      side: 'buy' | 'sell';
      ord_type: 'limit' | 'market' | 'stop' | 'stop_limit';
      volume: string;
      price?: string;
      stop_price?: string;
    }>({
      query: (orderData) => ({
        url: '/market/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Orders'],
    }),

    cancelOrder: builder.mutation<void, number>({
      query: (orderId) => ({
        url: `/market/orders/${orderId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Orders'],
    }),

    cancelAllOrders: builder.mutation<void, { market?: string }>({
      query: (params) => ({
        url: '/market/orders/cancel',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: ['Orders'],
    }),

    // ===== WALLETS ENDPOINTS =====

    getWallets: builder.query<Wallet[], void>({
      query: () => '/account/balances',
      providesTags: ['Wallets'],
    }),

    getWallet: builder.query<Wallet, string>({
      query: (currency) => `/account/balances/${currency}`,
      providesTags: (result, error, currency) => [{ type: 'Wallets', id: currency }],
    }),

    // ===== CURRENCIES ENDPOINTS =====

    getCurrencies: builder.query<Currency[], void>({
      query: () => '/public/currencies',
      providesTags: ['Currencies'],
    }),

    getCurrency: builder.query<Currency, string>({
      query: (currencyId) => `/public/currencies/${currencyId}`,
      providesTags: (result, error, currencyId) => [{ type: 'Currencies', id: currencyId }],
    }),

    // ===== BENEFICIARIES ENDPOINTS =====

    getBeneficiaries: builder.query<Beneficiary[], void>({
      query: () => '/account/beneficiaries',
      providesTags: ['Beneficiaries'],
    }),

    createBeneficiary: builder.mutation<Beneficiary, {
      currency: string;
      name: string;
      description?: string;
      data: any;
    }>({
      query: (beneficiaryData) => ({
        url: '/account/beneficiaries',
        method: 'POST',
        body: beneficiaryData,
      }),
      invalidatesTags: ['Beneficiaries'],
    }),

    updateBeneficiary: builder.mutation<Beneficiary, {
      id: string;
      data: Partial<Beneficiary>;
    }>({
      query: ({ id, data }) => ({
        url: `/account/beneficiaries/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Beneficiaries'],
    }),

    deleteBeneficiary: builder.mutation<void, string>({
      query: (id) => ({
        url: `/account/beneficiaries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Beneficiaries'],
    }),

    // ===== DEPOSITS ENDPOINTS =====

    getDeposits: builder.query<PaginatedResponse<Deposit>, PaginationParams>({
      query: (params) => ({
        url: '/account/deposits',
        params,
      }),
      providesTags: ['Deposits'],
    }),

    getDeposit: builder.query<Deposit, string>({
      query: (txid) => `/account/deposits/${txid}`,
      providesTags: (result, error, txid) => [{ type: 'Deposits', id: txid }],
    }),

    // ===== WITHDRAWALS ENDPOINTS =====

    getWithdrawals: builder.query<PaginatedResponse<Withdrawal>, PaginationParams>({
      query: (params) => ({
        url: '/account/withdraws',
        params,
      }),
      providesTags: ['Withdrawals'],
    }),

    createWithdrawal: builder.mutation<Withdrawal, {
      currency: string;
      amount: string;
      beneficiary_id: string;
      otp_code?: string;
    }>({
      query: (withdrawalData) => ({
        url: '/account/withdraws',
        method: 'POST',
        body: withdrawalData,
      }),
      invalidatesTags: ['Withdrawals', 'Wallets'],
    }),

    // ===== AUTHENTICATION ENDPOINTS =====

    login: builder.mutation<{ access_token: string; refresh_token: string }, {
      email: string;
      password: string;
      otp_code?: string;
    }>({
      query: (credentials) => ({
        url: '/identity/sessions',
        method: 'POST',
        body: credentials,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/identity/sessions',
        method: 'DELETE',
      }),
    }),

    register: builder.mutation<User, {
      email: string;
      password: string;
      password_confirmation: string;
      refid?: string;
    }>({
      query: (userData) => ({
        url: '/identity/users',
        method: 'POST',
        body: userData,
      }),
    }),

    // ===== HIGH-FREQUENCY TRADING ENDPOINTS =====

    getMarketDepth: builder.query<OrderBook, { market: string; limit?: number }>({
      query: ({ market, limit = 100 }) => `/public/markets/${market}/depth?limit=${limit}`,
      providesTags: (result, error, { market }) => [{ type: 'OrderBook', id: market }],
    }),

    getRecentTrades: builder.query<Trade[], { market: string; limit?: number }>({
      query: ({ market, limit = 100 }) => `/public/markets/${market}/trades?limit=${limit}`,
      providesTags: (result, error, { market }) => [{ type: 'Trades', id: market }],
    }),

    // ===== WEBSOCKET ENDPOINTS =====

    getWebSocketUrl: builder.query<string, void>({
      query: () => '/public/websocket/url',
      transformResponse: (response: { url: string }) => response.url,
    }),
  }),
});

// ===== EXPORT HOOKS =====

export const {
  // User hooks
  useGetUserQuery,
  useUpdateUserMutation,
  
  // Markets hooks
  useGetMarketsQuery,
  useGetMarketQuery,
  useGetTickersQuery,
  useGetTickerQuery,
  
  // Order book hooks
  useGetOrderBookQuery,
  
  // K-lines hooks
  useGetKLinesQuery,
  
  // Trades hooks
  useGetTradesQuery,
  
  // Orders hooks
  useGetOrdersQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
  useCancelAllOrdersMutation,
  
  // Wallets hooks
  useGetWalletsQuery,
  useGetWalletQuery,
  
  // Currencies hooks
  useGetCurrenciesQuery,
  useGetCurrencyQuery,
  
  // Beneficiaries hooks
  useGetBeneficiariesQuery,
  useCreateBeneficiaryMutation,
  useUpdateBeneficiaryMutation,
  useDeleteBeneficiaryMutation,
  
  // Deposits hooks
  useGetDepositsQuery,
  useGetDepositQuery,
  
  // Withdrawals hooks
  useGetWithdrawalsQuery,
  useCreateWithdrawalMutation,
  
  // Authentication hooks
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  
  // High-frequency trading hooks
  useGetMarketDepthQuery,
  useGetRecentTradesQuery,
  
  // WebSocket hooks
  useGetWebSocketUrlQuery,
} = api;
