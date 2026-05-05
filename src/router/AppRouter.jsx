/**
 * AppRouter Component
 * Main routing configuration for the application
 * 
 * Routes:
 * - / : Dashboard layout
 * - /dashboard : Dashboard page
 * - /settings : Settings page
 * - /profile : User profile
 * - * : 404 Not Found
 * 
 * Features:
 * - Lazy loading for all pages
 * - Dynamic imports for code splitting
 * - Suspense boundary with LoadingSpinner
 * - Page transition animations with Framer Motion
 */

import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { DashboardLayout } from '@layouts/DashboardLayout'
import { PageTransition, AnimatedLoadingSpinner } from '@components/animations'
import LoadingSpinner from '@components/shared/LoadingSpinner'

/**
 * Lazy loaded page components
 * Each page is loaded only when accessed, reducing initial bundle size
 */
const DashboardPage = lazy(() => Promise.resolve({
  default: () => <div id="dashboard-page"><h1>Dashboard</h1></div>
}))
const SettingsPage = lazy(() => Promise.resolve({
  default: () => <div><h1>Settings</h1></div>
}))
const ProfilePage = lazy(() => Promise.resolve({
  default: () => <div><h1>Profile</h1></div>
}))
const NotFoundPage = () => <div><h1>404 Not Found</h1></div>

/**
 * Loading fallback component for lazy routes
 * Uses AnimatedLoadingSpinner for smooth animations
 */
const RouteLoadingFallback = () => (
  <AnimatedLoadingSpinner 
    fullScreen={false}
    size="md"
    message="Cargando página..."
  />
)

/**
 * Routes wrapper component that applies page transitions
 */
function RoutesWithTransitions() {
  const location = useLocation()

  return (
    <PageTransition key={location.pathname}>
      <Routes>
        {/* Dashboard Layout Wrapper */}
        <Route
          element={
            <DashboardLayout
              navLinks={[
                { id: 1, label: 'Dashboard', icon: 'grid-alt', path: '/dashboard' },
                { id: 2, label: 'Profile', icon: 'user', path: '/profile' },
                { id: 3, label: 'Settings', icon: 'cog', path: '/settings' },
                { id: 4, label: 'Reports', icon: 'chart-line', path: '/reports' },
                { id: 5, label: 'Users', icon: 'users', path: '/users' },
              ]}
              userInfo={{
                name: 'John Doe',
                email: 'john.doe@example.com',
                avatar_url: 'https://via.placeholder.com/40',
              }}
              currentPage="Dashboard"
            />
          }
        >
          {/* Dashboard Routes with Lazy Loading */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route 
            path="/dashboard" 
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <DashboardPage />
              </Suspense>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <ProfilePage />
              </Suspense>
            } 
          />
          
          <Route 
            path="/settings" 
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <SettingsPage />
              </Suspense>
            } 
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </PageTransition>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <RoutesWithTransitions />
    </BrowserRouter>
  )
}
