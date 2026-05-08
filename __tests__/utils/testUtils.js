/**
 * Test Utilities
 * Common helpers for testing
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import authReducer from '@redux/slices/auth'
import sessionReducer from '@redux/slices/session'

/**
 * Custom render function with Redux provider
 */
export function renderWithRedux(
  _component,
  {
    _initialState = {},
    _store = configureStore({
      reducer: {
        auth: authReducer,
        session: sessionReducer,
      },
      preloadedState: _initialState,
    }),
  } = {}
) {
  return {
    ...render(<Provider store={_store}>{_component}</Provider>),
    _store,
  }
}

/**
 * Wait for async operations
 */
export async function waitFor(_callback, _options = {}) {
  const { timeout = 1000 } = _options
  const _start = Date.now()

  while (true) {
    try {
      _callback()
      return
    } catch (_error) {
      if (Date.now() - _start > timeout) {
        throw _error
      }
      await new Promise(_resolve => setTimeout(_resolve, 50))
    }
  }
}

/**
 * Mock form values
 */
export const _mockFormValues = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
}

/**
 * Mock user data
 */
export const _mockUser = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
}

/**
 * Mock API responses
 */
export const _mockApiResponses = {
  login: {
    access: 'token123',
    refresh: 'refresh123',
    user: _mockUser,
  },
  error: {
    message: 'Something went wrong',
    status: 500,
  },
}

/**
 * Create mock Redux state
 */
export function createMockReduxState(_overrides = {}) {
  return {
    auth: {
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      ..._overrides.auth,
    },
    session: {
      id: null,
      expiresAt: null,
      tx: null,
      jobs: {},
      alerts: [],
      ..._overrides.session,
    },
  }
}

// Re-export common testing library functions
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
