/**
 * Redux Store Configuration
 * Centralizes application state management
 */

import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/auth'
import uiReducer from './slices/ui'
import userReducer from './slices/user'
import sessionReducer from './slices/session'
import accessReducer from './slices/access'
import alertsReducer from './slices/alerts'
import auditReducer from './slices/audit'
import formReducer from './slices/form'
import reportsReducer from './slices/reports'
import errorReducer from './slices/error'
import adminReducer from './slices/admin'
import logsReducer from './slices/logs'
import savedFiltersReducer from './slices/savedFilters'
import loadingReducer from './slices/loading'
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
