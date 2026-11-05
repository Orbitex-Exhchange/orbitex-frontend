import { api } from '@/lib/api-client';
import { BACKEND_RUST_ENDPOINTS } from '@/lib/api/backend-rust';

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

export interface Deposit {
  id: string;
  currency: string;
  amount: string;
  fee: string;
  txid: string;
  state: string;
  confirmations: number;
  createdAt: number;
}

export interface Withdraw {
  id: string;
  currency: string;
  amount: string;
  fee: string;
  txid: string | null;
  state: string;
  rid: string;
  createdAt: number;
}

export interface InternalTransfer {
  id: string;
  currency: string;
  amount: string;
  senderId: string;
  receiverId: string;
  state: string;
  createdAt: number;
}

export interface Beneficiary {
  id: string;
  currency: string;
  name: string;
  data: any;
  state: string;
}

class AccountApiService {
  async getBalances(authToken: string): Promise<Account[]> {
    try {
      return await api.get(BACKEND_RUST_ENDPOINTS.account.balances, { authToken });
    } catch (error) {
      console.error('Failed to fetch balances:', error);
      throw error;
    }
  }

  async getBalanceByCurrency(currency: string, authToken: string): Promise<Account> {
    try {
      return await api.get(`/api/v2/account/balances/${currency}`, { authToken });
    } catch (error) {
      console.error(`Failed to fetch balance for ${currency}:`, error);
      throw error;
    }
  }

  async getDeposits(authToken: string, currency?: string, limit: number = 100): Promise<Deposit[]> {
    try {
      let url = BACKEND_RUST_ENDPOINTS.account.deposits;
      const params = new URLSearchParams();
      if (currency) params.append('currency', currency);
      params.append('limit', limit.toString());
      return await api.get(url + '?' + params.toString(), { authToken });
    } catch (error) {
      console.error('Failed to fetch deposits:', error);
      throw error;
    }
  }

  async getDepositByTxid(txid: string, authToken: string): Promise<Deposit> {
    try {
      return await api.get(`/api/v2/account/deposits/${txid}`, { authToken });
    } catch (error) {
      console.error(`Failed to fetch deposit ${txid}:`, error);
      throw error;
    }
  }
  
  async getDepositAddress(currency: string, network: string, authToken: string): Promise<any> {
    try {
      let url = BACKEND_RUST_ENDPOINTS.account.depositAddress(currency);
      if (network) url += `?network=${network}`;
      return await api.post(url, {}, { authToken });
    } catch (error) {
      console.error(`Failed to fetch deposit address:`, error);
      throw error;
    }
  }

  async getWithdraws(authToken: string, currency?: string, limit: number = 100): Promise<Withdraw[]> {
    try {
      let url = BACKEND_RUST_ENDPOINTS.account.withdraws;
      const params = new URLSearchParams();
      if (currency) params.append('currency', currency);
      params.append('limit', limit.toString());
      return await api.get(url + '?' + params.toString(), { authToken });
    } catch (error) {
      console.error('Failed to fetch withdraws:', error);
      throw error;
    }
  }
  
  async createWithdraw(data: { currency: string, amount: string, beneficiary_id: string, otp: string }, authToken: string): Promise<Withdraw> {
    try {
      return await api.post(BACKEND_RUST_ENDPOINTS.account.withdraws, data, { authToken });
    } catch (error) {
      console.error('Failed to create withdraw:', error);
      throw error;
    }
  }

  async getBeneficiaries(authToken: string): Promise<Beneficiary[]> {
    try {
      return await api.get(BACKEND_RUST_ENDPOINTS.account.beneficiaries, { authToken });
    } catch (error) {
      console.error('Failed to fetch beneficiaries:', error);
      throw error;
    }
  }
  
  async getInternalTransfers(authToken: string): Promise<InternalTransfer[]> {
    try {
      return await api.get(BACKEND_RUST_ENDPOINTS.account.internalTransfers, { authToken });
    } catch (error) {
      console.error('Failed to fetch internal transfers:', error);
      throw error;
    }
  }
  
  async getTransactions(authToken: string): Promise<any[]> {
    try {
      return await api.get(BACKEND_RUST_ENDPOINTS.account.transactions, { authToken });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      throw error;
    }
  }
}

export const accountApiService = new AccountApiService();
export const useAccountApi = () => accountApiService;
