/**
 * Redux Integration Tests
 * Tests state management setup
 */

import { configureStore } from '@reduxjs/toolkit'
import uiReducer, { toggleSidebar, closeSidebar } from '../../src/redux/slices/ui'
import userReducer, { setUser, logout } from '../../src/redux/slices/user'

describe('Redux Store', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      reducer: {
        ui: uiReducer,
        user: userReducer,
      },
    })
  })

  describe('UI Slice', () => {
    it('should have initial UI state', () => {
      const state = store.getState().ui
      expect(state.isSidebarOpen).toBe(false)
      expect(state.isDarkMode).toBe(false)
      expect(state.notifications).toEqual([])
    })

    it('should toggle sidebar state', () => {
      store.dispatch(toggleSidebar())
      expect(store.getState().ui.isSidebarOpen).toBe(true)

      store.dispatch(toggleSidebar())
      expect(store.getState().ui.isSidebarOpen).toBe(false)
    })

    it('should close sidebar', () => {
      store.dispatch(toggleSidebar())
      expect(store.getState().ui.isSidebarOpen).toBe(true)

      store.dispatch(closeSidebar())
      expect(store.getState().ui.isSidebarOpen).toBe(false)
    })
  })

  describe('User Slice', () => {
    it('should have initial user state', () => {
      const state = store.getState().user
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBe(null)
      expect(state.loading).toBe(false)
      expect(state.error).toBe(null)
    })

    it('should set user on login', () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' }
      store.dispatch(setUser(mockUser))

      const state = store.getState().user
      expect(state.isAuthenticated).toBe(true)
      expect(state.user).toEqual(mockUser)
      expect(state.error).toBe(null)
    })

    it('should logout user', () => {
      const mockUser = { id: 1, name: 'John Doe' }
      store.dispatch(setUser(mockUser))
      expect(store.getState().user.isAuthenticated).toBe(true)

      store.dispatch(logout())
      const state = store.getState().user
      expect(state.isAuthenticated).toBe(false)
      expect(state.user).toBe(null)
    })
  })

  describe('Multiple Slices', () => {
    it('should manage multiple slices independently', () => {
      store.dispatch(toggleSidebar())
      const mockUser = { id: 1, name: 'John Doe' }
      store.dispatch(setUser(mockUser))

      const state = store.getState()
      expect(state.ui.isSidebarOpen).toBe(true)
      expect(state.user.isAuthenticated).toBe(true)
    })
  })
})
