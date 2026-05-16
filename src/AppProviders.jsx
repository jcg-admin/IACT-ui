/**
 * AppProviders Component
 * 
 * Encapsulates all global providers:
 * - Redux store
 * - React Query client
 * - Toast context
 * - Notification service
 * 
 * Single Responsibility: Provide all global context
 */

import React, { useEffect } from 'react'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'

import store from '@store/store'
import { queryClient } from '@lib/queryClient'
import { ToastProvider, useToast } from './context/ToastContext'
import { registerNotificationService } from '@api/notificationGateway'
import PropTypes from 'prop-types'

/**
 * Initializes notification service with toast context
 * Must be inside ToastProvider to access useToast hook
 */
function NotificationServiceInitializer({ children }) {
  const toastContext = useToast()

  useEffect(() => {
    registerNotificationService(toastContext)
  }, [toastContext])

  return children
}

/**
 * AppProviders
 * Wraps application with all required global providers
 * 
 * Order matters:
 * 1. Redux (state)
 * 2. React Query (data fetching)
 * 3. Toast Context (UI notifications)
 * 4. Notification Service Initializer (initialize service with context)
 * 5. Children
 */
export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ToastProvider>
          <NotificationServiceInitializer>
            {children}
          </NotificationServiceInitializer>
        </ToastProvider>
      </Provider>
    </QueryClientProvider>
  )
}

AppProviders.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AppProviders
