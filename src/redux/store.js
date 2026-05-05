/**
 * Redux Store Configuration
 * Centralizes application state management
 */

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import userReducer from './slices/userSlice'
import sessionReducer from './slices/sessionSlice'
import accessReducer from './slices/accessSlice'
import alertsReducer from './slices/alertsSlice'
import auditReducer from './slices/auditSlice'
import formReducer from './slices/formSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    user: userReducer,
    session: sessionReducer,
    access: accessReducer,
    alerts: alertsReducer,
    audit: auditReducer,
    form: formReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore certain actions if needed
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export default store
