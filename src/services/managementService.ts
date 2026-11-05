import { api } from '@/lib/api-client';
import { BACKEND_RUST_ENDPOINTS } from '@/lib/api/backend-rust';

class ManagementApiService {
  async getCurrencies(authToken: string): Promise<any[]> {
    try {
      return await api.post(BACKEND_RUST_ENDPOINTS.management.currencies, {}, { authToken });
    } catch (error) {
      console.error('Failed to fetch management currencies:', error);
      throw error;
    }
  }

  async getMembers(authToken: string): Promise<any[]> {
    try {
      return await api.post(BACKEND_RUST_ENDPOINTS.management.members, {}, { authToken });
    } catch (error) {
      console.error('Failed to fetch management members:', error);
      throw error;
    }
  }

  async getWallets(authToken: string): Promise<any[]> {
    try {
      return await api.post(BACKEND_RUST_ENDPOINTS.management.wallets, {}, { authToken });
    } catch (error) {
      console.error('Failed to fetch management wallets:', error);
      throw error;
    }
  }

  async getEngines(authToken: string): Promise<any[]> {
    try {
      return await api.post(BACKEND_RUST_ENDPOINTS.management.engines, {}, { authToken });
    } catch (error) {
      console.error('Failed to fetch management engines:', error);
      throw error;
    }
  }

  async getDeposits(authToken: string): Promise<any[]> {
    try {
      return await api.post(BACKEND_RUST_ENDPOINTS.management.deposits, {}, { authToken });
    } catch (error) {
      console.error('Failed to fetch management deposits:', error);
      throw error;
    }
  }

  async getWithdraws(authToken: string): Promise<any[]> {
    try {
      return await api.post(BACKEND_RUST_ENDPOINTS.management.withdraws, {}, { authToken });
    } catch (error) {
      console.error('Failed to fetch management withdraws:', error);
      throw error;
    }
  }
}

export const managementApiService = new ManagementApiService();
export const useManagementApi = () => managementApiService;
