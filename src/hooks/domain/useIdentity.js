/**
 * useAuth Hook
 * 
 * React Query hooks for authentication
 * Provides queries and mutations for auth operations
 * 
 * Handles:
 * - Fetching current user
 * - Login
 * - Logout
 * - Register
 * - Token verification
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import authService from '@api/authGateway'

/**
 * useAuthUser - Fetch current authenticated user
 * 
 * @returns {Object} Query object with { data, isLoading, error, isSuccess, isError }
 * 
 * Example:
 *   const { data: user, isLoading, error } = useAuthUser()
 *   if (isLoading) return <Spinner />
 *   if (error) return <Error error={error} />
 *   return <UserProfile user={user} />
 */
export function useAuthUser() {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authService.getCurrentUser(),
    // Try to keep user data fresh
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Keep user data around longer (doesn't hurt to have it)
    gcTime: 30 * 60 * 1000, // 30 minutes
    // Don't fail silently on error
    retry: 1,
  })
}

/**
 * useLogin - Login mutation
 * 
 * @returns {Object} Mutation object with { mutate, isPending, error, data, isSuccess }
 * 
 * Example:
 *   const { mutate: login, isPending, error } = useLogin()
 *   
 *   const handleLogin = (username, password) => {
 *     login(
 *       { username, password },
 *       {
 *         onSuccess: (user) => {
 *           navigate('/dashboard')
 *         },
 *         onError: (error) => {
 *           console.error('Login failed:', error)
 *         }
 *       }
 *     )
 *   }
 */
export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ username, password }) =>
      authService.login(username, password),
    onSuccess: (data) => {
      // After login, refetch user data
      queryClient.setQueryData(['auth', 'user'], data)
      // Mark auth queries as no longer stale
      queryClient.invalidateQueries({
        queryKey: ['auth'],
        exact: false,
      })
    },
    onError: (error) => {
      // Clear any stale user data on login error
      queryClient.removeQueries({
        queryKey: ['auth', 'user'],
      })
    },
  })
}

/**
 * useLogout - Logout mutation
 * 
 * @returns {Object} Mutation object with { mutate, isPending, error, data, isSuccess }
 * 
 * Example:
 *   const { mutate: logout, isPending } = useLogout()
 *   
 *   const handleLogout = () => {
 *     logout(undefined, {
 *       onSuccess: () => {
 *         navigate('/login')
 *       }
 *     })
 *   }
 */
export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear all auth-related data
      queryClient.removeQueries({
        queryKey: ['auth'],
      })
    },
  })
}

/**
 * useRegister - Register mutation
 * 
 * @returns {Object} Mutation object with { mutate, isPending, error, data, isSuccess }
 * 
 * Example:
 *   const { mutate: register, isPending } = useRegister()
 *   
 *   const handleRegister = (formData) => {
 *     register(formData, {
 *       onSuccess: (user) => {
 *         navigate('/login')
 *       }
 *     })
 *   }
 */
export function useRegister() {
  return useMutation({
    mutationFn: (data) => authService.register(data),
    // No cache invalidation for registration
  })
}

/**
 * useVerifyToken - Verify token mutation
 * 
 * @returns {Object} Mutation object with { mutate, isPending, error, data, isSuccess }
 */
export function useVerifyToken() {
  return useMutation({
    mutationFn: () => authService.verifyToken(),
  })
}

/**
 * Legacy hook for backward compatibility
 * Wraps React Query hooks with Redux-like interface
 * 
 * NOTE: This is for migration period only
 * Eventually migrate components to use individual hooks
 */
export function useIdentity() {
  const { data: user, isLoading: loading, error } = useAuthUser()
  const { mutate: login } = useLogin()
  const { mutate: logout } = useLogout()

  return {
    // State
    isAuthenticated: !!user,
    user,
    loading,
    error: error?.message || null,
    userEmail: user?.email || null,
    // Actions
    login,
    logout,
    clearError: () => {}, // No-op for compatibility
  }
}

export default useIdentity
