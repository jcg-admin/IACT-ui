/**
 * UI Slice
 * Manages UI state (theme, sidebar, modals, etc.)
 */

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isSidebarOpen: false,
  isDarkMode: false,
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode
    },
    addNotification: (state, action) => {
      state.notifications.push(action.payload)
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      )
    },
  },
})

export const {
  toggleSidebar,
  closeSidebar,
  toggleDarkMode,
  addNotification,
  removeNotification,
} = uiSlice.actions

export default uiSlice.reducer
