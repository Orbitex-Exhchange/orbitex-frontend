'use client';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: any, query) => {
            // Handle 403 permission errors specifically
            if (error?.status === 403 || error?.code === 'user.ability.not_permitted') {
              console.error('Permission error in query:', {
                queryKey: query.queryKey,
                error: error.message || error.code
              });
              // Don't invalidate all queries on permission error - might be specific to this query
            } else if (error?.status === 401) {
              console.warn('Unauthorized error - token may be invalid');
              // Clear queries on 401 to force re-authentication
              queryClient.clear();
              // Dispatch storage event to notify auth context
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('storage'));
              }
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any) => {
            // Handle auth errors in mutations
            if (error?.status === 401 || error?.status === 403) {
              console.error('Auth error in mutation:', error.message || error.code);
            }
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30 seconds for faster updates in trading
            gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
            retry: (failureCount, error: any) => {
              // Don't retry on 401/403 errors - they're auth/permission issues
              if (error?.status === 401 || error?.status === 403) {
                return false;
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            // Note: enabled is set per-query for auth-dependent queries
            // Public queries (markets, tickers) don't need auth
          },
          mutations: {
            retry: (failureCount, error: any) => {
              // Don't retry on 401/403 errors
              if (error?.status === 401 || error?.status === 403) {
                return false;
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  // Ensure the provider is properly mounted
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Listen for auth state changes and invalidate queries
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        if (e.newValue) {
          // Token was added/updated - refetch queries
          queryClient.invalidateQueries();
        } else {
          // Token was removed - clear all queries
          queryClient.clear();
        }
      }
    };
    
    // Listen for custom auth events
    const handleAuthChange = () => {
      queryClient.invalidateQueries();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:changed', handleAuthChange);
    };
  }, [queryClient]);

  if (!isMounted) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
