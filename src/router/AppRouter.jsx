/**
 * AppRouter Component
 * Main routing configuration for the application
 *
 * Routes:
 * - / : redirect → /dashboard
 * - /dashboard : Dashboard (requires VIEW_DASHBOARD)
 * - /profile : User profile (public within auth session)
 * - /settings : Settings (requires VIEW_CONFIG)
 * - /access/* : Access control module ITER4 (requires VIEW_ACCESS)
 * - /audit/* : Audit module ITER6 (requires VIEW_AUDIT)
 * - /alerts/* : Alerts module ITER5 (requires VIEW_ALERTS)
 * - /access-denied : shown by ProtectedRoute on permission failure
 * - * : 404 Not Found
 */

import React, { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { DashboardLayout } from '@layouts/DashboardLayout'
import { PageTransition, AnimatedLoadingSpinner } from '@components/animations'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { FunctionCatalog } from '../permissions/catalog'

const DashboardPage = lazy(() => Promise.resolve({
  default: () => <div id="dashboard-page"><h1>Dashboard</h1></div>
}))
const SettingsPage = lazy(() => Promise.resolve({
  default: () => <div><h1>Settings</h1></div>
}))
const ProfilePage = lazy(() => Promise.resolve({
  default: () => <div><h1>Profile</h1></div>
}))
const AccessPage = lazy(() => Promise.resolve({
  default: () => <div><h1>Access Control</h1></div>
}))
const AuditPage = lazy(() => Promise.resolve({
  default: () => <div><h1>Audit Log</h1></div>
}))
const AlertsPage = lazy(() => Promise.resolve({
  default: () => <div><h1>Alerts</h1></div>
}))
const AccessDeniedPage = () => <div><h1>Access Denied</h1><p>You do not have permission to view this page.</p></div>
const NotFoundPage = () => <div><h1>404 Not Found</h1></div>

const RouteLoadingFallback = () => (
  <AnimatedLoadingSpinner
    fullScreen={false}
    size="md"
    message="Cargando página..."
  />
)

function RoutesWithTransitions() {
  const location = useLocation()

  return (
    <PageTransition key={location.pathname}>
      <Routes>
        <Route
          element={
            <DashboardLayout
              navLinks={[
                { id: 1, label: 'Dashboard', icon: 'grid-alt', path: '/dashboard' },
                { id: 2, label: 'Profile', icon: 'user', path: '/profile' },
                { id: 3, label: 'Settings', icon: 'cog', path: '/settings' },
                { id: 4, label: 'Access', icon: 'lock', path: '/access' },
                { id: 5, label: 'Audit', icon: 'history', path: '/audit' },
                { id: 6, label: 'Alerts', icon: 'bell', path: '/alerts' },
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
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_DASHBOARD}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <DashboardPage />
                </Suspense>
              </ProtectedRoute>
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
              <ProtectedRoute permission={FunctionCatalog.VIEW_CONFIG}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SettingsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/access/*"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_ACCESS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AccessPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/audit/*"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_AUDIT}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AuditPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/alerts/*"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_ALERTS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AlertsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route path="/access-denied" element={<AccessDeniedPage />} />
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
