import { api } from '@/lib/api-client';
import { Market, TickerData, OrderBookData, Trade } from './marketService';
import {
  BACKEND_RUST_ENDPOINTS,
  normalizeBackendArray,
  normalizeBackendKline,
  normalizeBackendMarkets,
  normalizeBackendOrderBook,
  normalizeBackendTicker,
  normalizeBackendTickerMap,
  normalizeBackendTimestamp,
  normalizeBackendTrades,
} from '@/lib/api/backend-rust';

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  type: 'fiat' | 'coin';
  depositEnabled: boolean;
  withdrawalEnabled: boolean;
  depositFee: string;
  minDepositAmount: string;
  withdrawFee: string;
  minWithdrawAmount: string;
  baseFactor: number;
  precision: number;
}

class PublicApiService {
  async getMarkets(): Promise<Market[]> {
    try {
      const response = await api.get(BACKEND_RUST_ENDPOINTS.public.markets);
      return normalizeBackendMarkets(response).map((market) => ({
        id: market.id,
        symbol: market.symbol,
        name: market.name,
        base: market.base_currency,
        quote: market.quote_currency,
        base_unit: market.base_unit,
        quote_unit: market.quote_unit,
        minOrderSize: market.min_amount,
        maxOrderSize: String(market.max_amount ?? market.max_order_size ?? '0'),
        priceIncrement: market.min_price,
        sizeIncrement: String(market.amount_precision ?? '0.00000001'),
        status: market.status,
      }));
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      throw error;
    }
  }

  async getCurrencies(): Promise<Currency[]> {
    try {
      const response = await api.get(BACKEND_RUST_ENDPOINTS.public.currencies);
      return normalizeBackendArray<any>(response, 'currencies').map((currency) => ({
        id: currency.id ?? String(currency.code || '').toLowerCase(),
        name: currency.name ?? currency.code,
        symbol: currency.symbol ?? currency.code,
        type: currency.type ?? 'coin',
        depositEnabled: Boolean(currency.deposit_enabled ?? currency.depositEnabled ?? true),
        withdrawalEnabled: Boolean(currency.withdraw_enabled ?? currency.withdrawalEnabled ?? true),
        depositFee: String(currency.deposit_fee ?? '0'),
        minDepositAmount: String(currency.min_deposit_amount ?? '0'),
        withdrawFee: String(currency.withdraw_fee ?? currency.withdrawal_fee ?? '0'),
        minWithdrawAmount: String(currency.min_withdraw_amount ?? currency.min_withdrawal_amount ?? '0'),
        baseFactor: Number(currency.base_factor ?? 10 ** Number(currency.precision ?? 8)),
        precision: Number(currency.precision ?? 8),
      }));
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      throw error;
    }
  }

  async getCurrencyById(id: string): Promise<Currency> {
    try {
      const currency = await api.get(BACKEND_RUST_ENDPOINTS.public.currencies + `/${id}`);
      return (await this.getCurrencies()).find((item) => item.id === id || item.symbol?.toLowerCase() === id.toLowerCase()) || currency;
    } catch (error) {
      console.error(`Failed to fetch currency ${id}:`, error);
      throw error;
    }
  }

  async getTickers(): Promise<Record<string, TickerData>> {
    try {
      const response = await api.get(BACKEND_RUST_ENDPOINTS.public.tickers);
      const tickers = normalizeBackendTickerMap(response);
      return Object.fromEntries(
        Object.entries(tickers).map(([market, ticker]) => [market, this.toTickerData(ticker)])
      );
    } catch (error) {
      console.error('Failed to fetch tickers:', error);
      throw error;
    }
  }

  async getTicker(market: string): Promise<TickerData> {
    try {
      const response = await api.get(BACKEND_RUST_ENDPOINTS.public.ticker(market));
      return this.toTickerData(normalizeBackendTicker(response, market));
    } catch (error) {
      console.error(`Failed to fetch ticker for ${market}:`, error);
      throw error;
    }
  }

  async getOrderBook(market: string): Promise<OrderBookData> {
    try {
      const response = await api.get(BACKEND_RUST_ENDPOINTS.public.orderBook(market));
      const orderBook = normalizeBackendOrderBook(response, market);
      return {
        market: orderBook.market,
        bids: orderBook.bids.map(([price, size]: [string, string]) => ({ price, size })),
        asks: orderBook.asks.map(([price, size]: [string, string]) => ({ price, size })),
        timestamp: orderBook.at,
      };
    } catch (error) {
      console.error(`Failed to fetch orderbook for ${market}:`, error);
      throw error;
    }
  }

  async getMarketDepth(market: string): Promise<any> {
    try {
      return await this.getOrderBook(market);
    } catch (error) {
      console.error(`Failed to fetch depth for ${market}:`, error);
      throw error;
    }
  }

  async getMarketKLine(market: string, period: number, limit: number = 30): Promise<any[]> {
    try {
      const response = await api.get(`${BACKEND_RUST_ENDPOINTS.public.kline(market)}?period=${period}&limit=${limit}`);
      return normalizeBackendKline(response, market, period).k_line;
    } catch (error) {
      console.error(`Failed to fetch k-line for ${market}:`, error);
      throw error;
    }
  }

  async getTrades(market: string, limit: number = 100): Promise<Trade[]> {
    try {
      const response = await api.get(`${BACKEND_RUST_ENDPOINTS.public.trades(market)}?limit=${limit}`);
      return normalizeBackendTrades(response, market).map((trade) => ({
        id: String(trade.id),
        market: trade.market,
        price: trade.price,
        size: trade.volume,
        side: trade.side === 'sell' ? 'sell' : 'buy',
        timestamp: normalizeBackendTimestamp(trade.created_at),
      }));
    } catch (error) {
      console.error(`Failed to fetch trades for ${market}:`, error);
      throw error;
    }
  }
  
  async getTimestamp(): Promise<number> {
    try {
      const res = await api.get(BACKEND_RUST_ENDPOINTS.public.timestamp);
      return normalizeBackendTimestamp(res);
    } catch (error) {
      console.error(`Failed to fetch timestamp:`, error);
      throw error;
    }
  }

  async getVersion(): Promise<string> {
    try {
      const res = await api.get(BACKEND_RUST_ENDPOINTS.public.version);
      return res.version;
    } catch (error) {
      console.error(`Failed to fetch version:`, error);
      throw error;
    }
  }

  private toTickerData(rawTicker: any): TickerData {
    const ticker = normalizeBackendTicker(rawTicker, rawTicker?.market);
    return {
      market: ticker.market,
      lastPrice: ticker.ticker.last,
      bid: ticker.ticker.buy,
      ask: ticker.ticker.sell,
      high: ticker.ticker.high,
      low: ticker.ticker.low,
      volume: ticker.ticker.vol,
      change: String(ticker.change ?? ticker.price_change_percent ?? '0'),
      changePercent: ticker.ticker.price_change_percent,
      timestamp: ticker.at,
    };
  }
}

export const publicApiService = new PublicApiService();
export const usePublicApi = () => publicApiService;
