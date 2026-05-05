/**
 * App Component
 * Main application entry point
 * 
 * Single Responsibility: Render app router with providers
 */

import React, { Suspense } from 'react'
import { AppRouter } from '@router'
import { AppProviders } from './AppProviders'
import ToastContainer from '@components/shared/Toast/ToastContainer'
import ApiErrorAlert from '@components/feedback/ApiErrorAlert'
import ServerErrorBanner from '@components/feedback/ServerErrorBanner'
import '@styles/main.scss'

/**
 * Loading fallback shown while app initializes
 */
function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#6b7280',
      }}
    >
      Loading...
    </div>
  )
}

/**
 * App
 * 
 * Main application component
 * Wraps router and UI with all necessary providers
 */
export default function App() {
  return (
    <AppProviders>
      <ServerErrorBanner />
      <Suspense fallback={<LoadingFallback />}>
        <AppRouter />
      </Suspense>
      <ToastContainer />
      <ApiErrorAlert />
    </AppProviders>
  )
}

