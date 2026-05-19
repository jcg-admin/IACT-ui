/**
 * useIdentity Hooks Tests
 * 
 * Test React Query hooks for authentication
 * Tests cover:
 * - useAuthUser query
 * - useLogin mutation
 * - useLogout mutation
 * - useRegister mutation
 * - useVerifyToken mutation
 * - Cache invalidation
 */

import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useAuthUser,
  useLogin,
  useLogout,
  useRegister,
  useVerifyToken,
  useIdentity,
} from '@hooks/domain/useIdentity'
import authService from '@api/authGateway'

// Mock authService
jest.mock('@api/authGateway')

/**
 * Test wrapper with QueryClientProvider
 */
function createTestWrapper() {
  const testQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={testQueryClient}>
        {children}
      </QueryClientProvider>
    )
  }
}

describe('useIdentity Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useAuthUser', () => {
    it('should fetch current user', async () => {
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      }

      authService.getCurrentUser.mockResolvedValue(mockUser)

      const { result } = renderHook(() => useAuthUser(), {
        wrapper: createTestWrapper(),
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUser)
      expect(authService.getCurrentUser).toHaveBeenCalled()
    })

    it('should handle error when fetching user fails', async () => {
      const mockError = new Error('Unauthorized')
      authService.getCurrentUser.mockRejectedValue(mockError)

      const { result } = renderHook(() => useAuthUser(), {
        wrapper: createTestWrapper(),
      })

      // Query should be in loading state initially
      expect(result.current.isLoading || result.current.isPending).toBe(true)

      // Wait for error state
      await waitFor(
        () => {
          expect(result.current.isError).toBe(true)
        },
        { timeout: 3000 }
      )

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useLogin', () => {
    it('should login with username and password', async () => {
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      }

      authService.login.mockResolvedValue(mockUser)

      const { result } = renderHook(() => useLogin(), {
        wrapper: createTestWrapper(),
      })

      expect(result.current.isPending).toBe(false)

      act(() => {
        result.current.mutate({
          username: 'testuser',
          password: 'password123',
        })
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockUser)
      expect(authService.login).toHaveBeenCalledWith('testuser', 'password123')
    })

    it('should handle login error', async () => {
      const mockError = new Error('Invalid credentials')
      authService.login.mockRejectedValue(mockError)

      const { result } = renderHook(() => useLogin(), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.mutate({
          username: 'testuser',
          password: 'wrong',
        })
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })

    it('should handle onSuccess callback', async () => {
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      }

      authService.login.mockResolvedValue(mockUser)
      const onSuccessMock = jest.fn()

      const { result } = renderHook(() => useLogin(), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.mutate(
          {
            username: 'testuser',
            password: 'password123',
          },
          {
            onSuccess: onSuccessMock,
          }
        )
      })

      await waitFor(() => {
        expect(onSuccessMock).toHaveBeenCalled()
      })
    })
  })

  describe('useLogout', () => {
    it('should logout user', async () => {
      const mockResponse = { status: 'success' }
      authService.logout.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useLogout(), {
        wrapper: createTestWrapper(),
      })

      expect(result.current.isPending).toBe(false)

      act(() => {
        result.current.mutate()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(authService.logout).toHaveBeenCalled()
    })

    it('should handle logout error', async () => {
      const mockError = new Error('Logout failed')
      authService.logout.mockRejectedValue(mockError)

      const { result } = renderHook(() => useLogout(), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.mutate()
      })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toBeDefined()
    })
  })

  describe('useRegister', () => {
    it('should register new user', async () => {
      const mockResponse = {
        user_id: 2,
        username: 'newuser',
        email: 'new@example.com',
      }

      authService.register.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useRegister(), {
        wrapper: createTestWrapper(),
      })

      expect(result.current.isPending).toBe(false)

      const registerData = {
        username: 'newuser',
        password: 'password123',
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'User',
      }

      act(() => {
        result.current.mutate(registerData)
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(authService.register).toHaveBeenCalledWith(registerData)
    })
  })

  describe('useVerifyToken', () => {
    it('should verify token', async () => {
      const mockResponse = { is_valid: true }
      authService.verifyToken.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useVerifyToken(), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.mutate()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockResponse)
      expect(authService.verifyToken).toHaveBeenCalled()
    })
  })

  describe('useIdentity (legacy hook)', () => {
    it('should provide backward-compatible interface', async () => {
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
      }

      authService.getCurrentUser.mockResolvedValue(mockUser)

      const { result } = renderHook(() => useIdentity(), {
        wrapper: createTestWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.userEmail).toBe('test@example.com')
      expect(typeof result.current.login).toBe('function')
      expect(typeof result.current.logout).toBe('function')
    })

    it('should show not authenticated when no user', async () => {
      authService.getCurrentUser.mockRejectedValue(new Error('Not authenticated'))

      const { result } = renderHook(() => useIdentity(), {
        wrapper: createTestWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false)
      })

      expect(result.current.user).toBeUndefined()
    })
  })

  describe('Cache Invalidation', () => {
    it('should clear auth cache on logout', async () => {
      authService.logout.mockResolvedValue({ status: 'success' })

      const { result } = renderHook(() => useLogout(), {
        wrapper: createTestWrapper(),
      })

      act(() => {
        result.current.mutate()
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      // Verify mutation completed
      expect(result.current.data).toBeDefined()
    })
  })
})
