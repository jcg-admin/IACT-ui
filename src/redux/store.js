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
import reportsReducer from './slices/reportsSlice'
import errorReducer from './slices/errorSlice'
import adminReducer from './slices/adminSlice'
import logsReducer from './slices/logsSlice'
import savedFiltersReducer from './slices/savedFiltersSlice'
import loadingReducer from './slices/loadingSlice'
import {
  errorHandlingMiddleware,
  errorLoggingMiddleware,
} from './middleware/errorHandling'
import { loadingMiddleware } from './middleware/loadingMiddleware'

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
    reports: reportsReducer,
    error: errorReducer,
    admin: adminReducer,
    logs: logsReducer,
    savedFilters: savedFiltersReducer,
    loading: loadingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(loadingMiddleware, errorLoggingMiddleware, errorHandlingMiddleware),
})

export default store
