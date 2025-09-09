// Example usage of the new API client
import { api, APIError } from './index';

// Example interfaces for API responses
interface User {
  id: string;
  email: string;
  name: string;
}

interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
}

// Trading API interfaces based on Peatio Management API v2
interface Market {
  id: string;
  name: string;
  base_unit: string;
  quote_unit: string;
  min_price: number;
  max_price: number;
  min_amount: number;
  amount_precision: number;
  price_precision: number;
  state: string;
  position: number;
}

interface Ticker {
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

interface OrderBookEntry {
  price: string;
  amount: string;
}

interface OrderBook {
  market: string;
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  timestamp: number;
}

interface Trade {
  id: string;
  price: string;
  amount: string;
  total: string;
  market: string;
  created_at: string;
  taker_type: string;
  side: string;
}

interface Balance {
  uid: string;
  balance: string;
  locked: string;
  currency: string;
}

// Example API functions using the new client
export const userApi = {
  // Get user by ID
  getUser: async (id: string): Promise<User> => {
    try {
      return await api.get<User>(`/users/${id}`);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Get all users
  getUsers: async (): Promise<User[]> => {
    try {
      return await api.get<User[]>('/users');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    try {
      return await api.post<User>('/users', userData);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Update user
  updateUser: async (id: string, userData: Partial<User>): Promise<User> => {
    try {
      return await api.put<User>(`/users/${id}`, userData);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },
};

// Trading API functions based on Peatio Management API v2
export const tradingApi = {
  // Get all markets
  getMarkets: async (): Promise<Market[]> => {
    try {
      const data = await api.get<Market[]>('/api/v2/public/markets');
      // Handle empty response by providing fallback data
      if (!data || data.length === 0) {
        return [
          { id: 'btcusdt', name: 'BTC/USDT', base_unit: 'btc', quote_unit: 'usdt', min_price: 0, max_price: 0, min_amount: 0, amount_precision: 8, price_precision: 2, state: 'enabled', position: 1 },
          { id: 'ethusdt', name: 'ETH/USDT', base_unit: 'eth', quote_unit: 'usdt', min_price: 0, max_price: 0, min_amount: 0, amount_precision: 8, price_precision: 2, state: 'enabled', position: 2 },
          { id: 'nearusdc', name: 'NEAR/USDC', base_unit: 'near', quote_unit: 'usdc', min_price: 0, max_price: 0, min_amount: 0, amount_precision: 8, price_precision: 4, state: 'enabled', position: 3 }
        ];
      }
      return data;
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Get market tickers
  getTickers: async (markets?: string): Promise<Ticker[]> => {
    try {
      if (markets) {
        // Fetch individual tickers for specified markets
        const marketList = markets.split(',');
        const tickers: Ticker[] = [];
        for (const market of marketList) {
          try {
            const data = await api.get<{ticker: Ticker}>(`/api/v2/public/tickers/${market}`);
            if (data && data.ticker) {
              tickers.push({...data.ticker, market});
            }
          } catch (error) {
            console.warn(`Failed to fetch ticker for ${market}:`, error);
          }
        }
        return tickers;
      } else {
        return await api.get<Ticker[]>('/api/v2/public/tickers');
      }
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Get order book for a specific market
  getOrderBook: async (market: string, limit?: number): Promise<OrderBook> => {
    try {
      const endpoint = limit 
        ? `/api/v2/public/order_book/${market}?asks_limit=${limit}&bids_limit=${limit}`
        : `/api/v2/public/order_book/${market}`;
      return await api.get<OrderBook>(endpoint);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Get recent trades for a market
  getTrades: async (market: string, limit?: number): Promise<Trade[]> => {
    try {
      const endpoint = limit 
        ? `/api/v2/public/trades/${market}?limit=${limit}`
        : `/api/v2/public/trades/${market}`;
      return await api.get<Trade[]>(endpoint);
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Get user balance (requires authentication)
  getBalance: async (uid: string, currency: string, authToken: string): Promise<Balance> => {
    try {
      const formData = new FormData();
      formData.append('uid', uid);
      formData.append('currency', currency);
      
      return await api.post<Balance>('/api/v2/management/orbitex/accounts/balance', formData, {
        authToken,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Get user balances (requires authentication)
  getBalances: async (currency: string, authToken: string, page?: number, limit?: number): Promise<Balance[]> => {
    try {
      const formData = new FormData();
      formData.append('currency', currency);
      if (page) formData.append('page', page.toString());
      if (limit) formData.append('limit', limit.toString());
      
      return await api.post<Balance[]>('/api/v2/management/orbitex/accounts/balances', formData, {
        authToken,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },

  // Get server timestamp
  getTimestamp: async (): Promise<number> => {
    try {
      return await api.post<number>('/api/v2/management/orbitex/timestamp');
    } catch (error) {
      if (error instanceof APIError) {
        console.error(`API Error: ${error.message} (${error.status})`);
      }
      throw error;
    }
  },
};

// Example usage in a React component or server action
export const exampleUsage = {
  // Example server action (Next.js 15)
  createUserAction: async (formData: FormData) => {
    'use server';
    
    try {
      const userData = {
        email: formData.get('email') as string,
        name: formData.get('name') as string,
        password: formData.get('password') as string,
      };

      const newUser = await userApi.createUser(userData);
      return { success: true, user: newUser };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Example client-side usage
  fetchUserData: async (userId: string) => {
    try {
      const user = await userApi.getUser(userId);
      return user;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  },

  // Example trading data fetching
  fetchTradingData: async (market: string) => {
    try {
      const [markets, tickers, orderBook, trades] = await Promise.all([
        tradingApi.getMarkets(),
        tradingApi.getTickers(market),
        tradingApi.getOrderBook(market, 20),
        tradingApi.getTrades(market, 50)
      ]);

      return {
        markets,
        tickers,
        orderBook,
        trades
      };
    } catch (error) {
      console.error('Failed to fetch trading data:', error);
      throw error;
    }
  },

  // Example authenticated trading operations
  fetchUserBalances: async (authToken: string, currency?: string) => {
    try {
      if (currency) {
        const balance = await tradingApi.getBalance('user123', currency, authToken);
        return [balance];
      } else {
        const balances = await tradingApi.getBalances('BTC', authToken);
        return balances;
      }
    } catch (error) {
      console.error('Failed to fetch user balances:', error);
      throw error;
    }
  },
};