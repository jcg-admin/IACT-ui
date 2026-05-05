/**
 * React Query Client Configuration
 * 
 * Centralized configuration for React Query
 * Handles caching, refetching, retry logic
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Create and configure QueryClient
 * 
 * Configuration:
 * - staleTime: 5 minutes (data is fresh for 5 min after fetch)
 * - gcTime: 10 minutes (garbage collect after 10 min of no use)
 * - retry: 1 (retry failed requests once)
 * - refetchOnWindowFocus: false (don't refetch when window regains focus)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data considered fresh for 5 minutes
      // After 5 min, marked as stale (but still cached)
      staleTime: 1000 * 60 * 5,
      
      // Remove unused data after 10 minutes
      // This is garbage collection for memory management
      gcTime: 1000 * 60 * 10,
      
      // Retry failed requests once
      // Handles transient network errors
      retry: 1,
      
      // Don't refetch when window regains focus
      // Set to true if you want aggressive refetching
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

export default queryClient;
