import { api } from '@/lib/api-client';

// Types for trading API
export interface Market {
  symbol: string;
  name: string;
  base: string;
  quote: string;
  minOrderSize: string;
  maxOrderSize: string;
  priceIncrement: string;
  sizeIncrement: string;
  status: string;
}

export interface TickerData {
  market: string;
  lastPrice: string;
  bid: string;
  ask: string;
  high: string;
  low: string;
  volume: string;
  change: string;
  changePercent: string;
  timestamp: number;
}

export interface OrderBookEntry {
  price: string;
  size: string;
}

export interface OrderBookData {
  market: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
}

export interface Trade {
  id: string;
  market: string;
  price: string;
  size: string;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface Order {
  id: string;
  userId: string;
  market: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop_loss' | 'take_profit';
  price?: string;
  quantity: string;
  filledQuantity: string;
  remainingQuantity: string;
  status: 'pending' | 'open' | 'partially_filled' | 'filled' | 'cancelled' | 'rejected';
  createdAt: number;
  updatedAt: number;
}

export interface Account {
  id: string;
  userId: string;
  currency: string;
  balance: string;
  lockedBalance: string;
  availableBalance: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateOrderRequest {
  market: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop_loss' | 'take_profit';
  price?: string;
  quantity: string;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  clientOrderId?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  clientOrderId?: string;
  status: string;
  filledQuantity: string;
  remainingQuantity: string;
  averagePrice?: string;
  timestamp: number;
}

class TradingApiService {

  // Market Data APIs
  async getMarkets(): Promise<Market[]> {
    try {
      const response = await api.get('/api/v2/markets');
      return response;
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      throw error;
    }
  }

  async getTicker(market: string): Promise<TickerData> {
    try {
      const response = await api.get(`/api/v2/markets/${market}/ticker`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch ticker for ${market}:`, error);
      throw error;
    }
  }

  async getOrderBook(market: string): Promise<OrderBookData> {
    try {
      const response = await api.get(`/api/v2/markets/${market}/orderbook`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch orderbook for ${market}:`, error);
      throw error;
    }
  }

  async getTrades(market: string, limit: number = 100): Promise<Trade[]> {
    try {
      const response = await api.get(`/api/v2/markets/${market}/trades?limit=${limit}`);
      return response;
    } catch (error) {
      console.error(`Failed to fetch trades for ${market}:`, error);
      throw error;
    }
  }

  // Trading APIs
  async createOrder(orderData: CreateOrderRequest, authToken: string): Promise<CreateOrderResponse> {
    try {
      const response = await api.post('/api/v2/orders', orderData, {
        authToken,
      });
      return response;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  async getOrders(authToken: string, market?: string, status?: string): Promise<Order[]> {
    try {
      let url = '/api/v2/orders';
      const params = new URLSearchParams();
      if (market) params.append('market', market);
      if (status) params.append('status', status);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get(url, {
        authToken,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, authToken: string): Promise<{ orderId: string; status: string }> {
    try {
      const response = await api.delete(`/api/v2/orders/${orderId}`, {
        authToken,
      });
      return response;
    } catch (error) {
      console.error(`Failed to cancel order ${orderId}:`, error);
      throw error;
    }
  }

  // Account APIs
  async getAccounts(authToken: string): Promise<Account[]> {
    try {
      const response = await api.get('/api/v2/accounts', {
        authToken,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      throw error;
    }
  }

  async getBalance(currency: string, authToken: string): Promise<Account> {
    try {
      const response = await api.get(`/api/v2/balance/${currency}`, {
        authToken,
      });
      return response;
    } catch (error) {
      console.error(`Failed to fetch balance for ${currency}:`, error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: number }> {
    try {
      const response = await api.get('/health');
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  async databaseHealthCheck(): Promise<{ status: string; database: string; timestamp: number }> {
    try {
      const response = await api.get('/db-health');
      return response;
    } catch (error) {
      console.error('Database health check failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const tradingApiService = new TradingApiService();

// React hook for trading API service
export const useTradingApi = () => {
  return tradingApiService;
};