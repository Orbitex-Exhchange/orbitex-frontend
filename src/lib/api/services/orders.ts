import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api-client';

// Order interface based on the real backend response
export interface Order {
  id: number;
  uuid: string;
  side: 'buy' | 'sell';
  ord_type: 'limit' | 'market';
  price: string;
  avg_price: string;
  state: string;
  market: string;
  created_at: string;
  updated_at: string;
  origin_volume: string;
  remaining_volume: string;
  executed_volume: string;
  trades_count: number;
  trades: any[];
}

// Orders API endpoints
const ORDERS_ENDPOINTS = {
  list: '/api/api_v2/market/orders',
  create: '/api/api_v2/market/orders',
  cancel: '/api/api_v2/market/orders/:id/cancel',
  get: '/api/api_v2/market/orders/:id',
} as const;

// Real API functions - Connected to our backend
// Real API functions - Connected to our backend (Standalone to avoid TDZ)
export const getOrders = async (authToken: string, market?: string): Promise<Order[]> => {
  let url = ORDERS_ENDPOINTS.list;
  if (market) {
    url += `?market=${market}`;
  }
  const response = await api.get(url, { authToken });
  return response;
};

export const getOrder = async (id: number, authToken: string): Promise<Order | null> => {
  const url = ORDERS_ENDPOINTS.get.replace(':id', id.toString());
  const response = await api.get(url, { authToken });
  return response;
};

export const createOrder = async (orderData: {
  market: string;
  side: 'buy' | 'sell';
  ord_type: 'limit' | 'market';
  price?: string;
  volume: string;
}, authToken: string): Promise<Order> => {
  const response = await api.post(ORDERS_ENDPOINTS.create, orderData, { authToken });
  return response;
};

export const cancelOrder = async (id: number, authToken: string): Promise<Order> => {
  const url = ORDERS_ENDPOINTS.cancel.replace(':id', id.toString());
  const response = await api.post(url, {}, { authToken });
  return response;
};

// React Query hooks
export const useOrders = (authToken?: string, market?: string) => {
  return useQuery({
    queryKey: ['orders', market],
    queryFn: () => getOrders(authToken || '', market),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 10 * 1000, // Refetch every 10 seconds
    enabled: !!authToken,
  });
};

export const useOrder = (id: number, authToken?: string) => {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => getOrder(id, authToken || ''),
    staleTime: 10 * 1000, // 10 seconds
    enabled: !!id && !!authToken,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderData, authToken }: { orderData: any; authToken: string }) =>
      createOrder(orderData, authToken),
    onSuccess: (newOrder) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['markets'] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, authToken }: { id: number; authToken: string }) =>
      cancelOrder(id, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
};
