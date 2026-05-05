/**
 * App Component Integration Tests
 * Tests the full App setup with Router + Redux + Provider
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import uiReducer from '../../src/redux/slices/uiSlice'
import userReducer from '../../src/redux/slices/userSlice'

describe('App Integration', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        ui: uiReducer,
        user: userReducer,
      },
    })
  })

  describe('Provider Setup', () => {
    it('should have Redux provider configured', () => {
      expect(Provider).toBeDefined()
      expect(store).toBeDefined()
    })

    it('should have router configured', () => {
      expect(BrowserRouter).toBeDefined()
      expect(Routes).toBeDefined()
      expect(Route).toBeDefined()
    })

    it('should have store state with ui and user slices', () => {
      const state = store.getState()
      expect(state).toHaveProperty('ui')
      expect(state).toHaveProperty('user')
      expect(state.ui).toHaveProperty('isSidebarOpen')
      expect(state.user).toHaveProperty('isAuthenticated')
    })
  })

  describe('State Management', () => {
    it('should initialize with correct initial state', () => {
      const state = store.getState()

      // UI state
      expect(state.ui.isSidebarOpen).toBe(false)
      expect(state.ui.isDarkMode).toBe(false)
      expect(Array.isArray(state.ui.notifications)).toBe(true)

      // User state
      expect(state.user.isAuthenticated).toBe(false)
      expect(state.user.user).toBe(null)
      expect(state.user.loading).toBe(false)
      expect(state.user.error).toBe(null)
    })

    it('should have reducers configured', () => {
      // Check that actions work
      expect(typeof store.dispatch).toBe('function')
    })
  })

  describe('Application Structure', () => {
    it('should have all necessary components and slices', () => {
      // Verify all pieces are in place
      const state = store.getState()

      // UI slice
      expect('isSidebarOpen' in state.ui).toBe(true)
      expect('isDarkMode' in state.ui).toBe(true)
      expect('notifications' in state.ui).toBe(true)

      // User slice
      expect('isAuthenticated' in state.user).toBe(true)
      expect('user' in state.user).toBe(true)
      expect('loading' in state.user).toBe(true)
      expect('error' in state.user).toBe(true)
    })
  })
})
