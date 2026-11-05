import { api } from '@/lib/api-client';
import { BACKEND_RUST_ENDPOINTS } from '@/lib/api/backend-rust';

class AdminApiService {
  async getCurrencies(authToken: string): Promise<any[]> {
    try {
      return await api.get(BACKEND_RUST_ENDPOINTS.admin.currencies, { authToken });
    } catch (error) {
      console.error('Failed to fetch admin currencies:', error);
      throw error;
    }
  }

  async getMembers(authToken: string): Promise<any[]> {
    try {
      return await api.get(BACKEND_RUST_ENDPOINTS.admin.members, { authToken });
    } catch (error) {
      console.error('Failed to fetch admin members:', error);
      throw error;
    }
  }

  async getOrders(authToken: string): Promise<any[]> {
    try {
      return await api.get(BACKEND_RUST_ENDPOINTS.admin.orders, { authToken });
    } catch (error) {
      console.error('Failed to fetch admin orders:', error);
      throw error;
    }
  }

  async getTrades(authToken: string): Promise<any[]> {
    try {
      return await api.get(BACKEND_RUST_ENDPOINTS.admin.trades, { authToken });
    } catch (error) {
      console.error('Failed to fetch admin trades:', error);
      throw error;
    }
  }

  async getDeposits(authToken: string): Promise<any[]> {
    try {
      return await api.get(BACKEND_RUST_ENDPOINTS.admin.deposits, { authToken });
    } catch (error) {
      console.error('Failed to fetch admin deposits:', error);
      throw error;
    }
  }

  async getWithdraws(authToken: string): Promise<any[]> {
    try {
      return await api.get(BACKEND_RUST_ENDPOINTS.admin.withdraws, { authToken });
    } catch (error) {
      console.error('Failed to fetch admin withdraws:', error);
      throw error;
    }
  }

  async getWallets(authToken: string): Promise<any[]> {
    try {
      return await api.get(BACKEND_RUST_ENDPOINTS.admin.wallets, { authToken });
    } catch (error) {
      console.error('Failed to fetch admin wallets:', error);
      throw error;
    }
  }
  
  async getBlockchains(authToken: string): Promise<any[]> {
    try {
      return await api.get(BACKEND_RUST_ENDPOINTS.admin.blockchains, { authToken });
    } catch (error) {
      console.error('Failed to fetch admin blockchains:', error);
      throw error;
    }
  }
  
  async getAdjustments(authToken: string): Promise<any[]> {
    try {
      return await api.get(BACKEND_RUST_ENDPOINTS.admin.adjustments, { authToken });
    } catch (error) {
      console.error('Failed to fetch admin adjustments:', error);
      throw error;
    }
  }
}

export const adminApiService = new AdminApiService();
export const useAdminApi = () => adminApiService;
