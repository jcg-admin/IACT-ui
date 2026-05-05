/**
 * User Slice
 * Manages user authentication and profile state
 */

import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.isAuthenticated = true
      state.user = action.payload
      state.error = null
    },
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.error = null
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { setUser, logout, setLoading, setError } = userSlice.actions

export default userSlice.reducer
