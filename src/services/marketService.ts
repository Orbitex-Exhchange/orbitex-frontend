import { api } from '@/lib/api-client';
import { BACKEND_RUST_ENDPOINTS } from '@/lib/api/backend-rust';

export interface Market {
  id: string;
  symbol: string;
  name: string;
  base: string;
  quote: string;
  base_unit?: string;
  quote_unit?: string;
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

class MarketApiService {
  async createOrder(orderData: CreateOrderRequest, authToken: string): Promise<CreateOrderResponse> {
    try {
      const payload = {
        market: orderData.market,
        side: orderData.side,
        ord_type: orderData.orderType === 'market' ? 'market' : 'limit',
        price: orderData.price,
        volume: orderData.quantity,
        time_in_force: orderData.timeInForce,
        client_order_id: orderData.clientOrderId,
      };
      return await api.post(BACKEND_RUST_ENDPOINTS.market.orders, payload, { authToken });
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  async getOrders(authToken: string, market?: string, status?: string): Promise<Order[]> {
    try {
      let url = BACKEND_RUST_ENDPOINTS.market.orders;
      const params = new URLSearchParams();
      if (market) params.append('market', market);
      if (status) params.append('status', status);
      if (params.toString()) url += `?${params.toString()}`;

      return await api.get(url, { authToken });
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      throw error;
    }
  }

  async getOrderById(orderId: string, authToken: string): Promise<Order> {
    try {
      return await api.get(`/api/v2/market/orders/${orderId}`, { authToken });
    } catch (error) {
      console.error(`Failed to fetch order ${orderId}:`, error);
      throw error;
    }
  }

  async cancelOrder(orderId: string, authToken: string): Promise<{ orderId: string; status: string }> {
    try {
      return await api.delete(BACKEND_RUST_ENDPOINTS.market.order(orderId), { authToken });
    } catch (error) {
      console.error(`Failed to cancel order ${orderId}:`, error);
      throw error;
    }
  }

  async cancelOrdersBulk(market: string | undefined, side: string | undefined, authToken: string): Promise<any> {
    try {
      return await api.post(BACKEND_RUST_ENDPOINTS.market.cancelOrders, { market, side }, { authToken });
    } catch (error) {
      console.error(`Failed to bulk cancel orders:`, error);
      throw error;
    }
  }

  async getUserTrades(authToken: string, market?: string, limit: number = 100): Promise<Trade[]> {
    try {
      let url = BACKEND_RUST_ENDPOINTS.market.trades;
      const params = new URLSearchParams();
      if (market) params.append('market', market);
      params.append('limit', limit.toString());
      return await api.get(url + '?' + params.toString(), { authToken });
    } catch (error) {
      console.error('Failed to fetch user trades:', error);
      throw error;
    }
  }
}

export const marketApiService = new MarketApiService();
export const useMarketApi = () => marketApiService;
