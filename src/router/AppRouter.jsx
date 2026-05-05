/**
 * AppRouter Component
 * Configuración principal de rutas de la aplicación
 *
 * Rutas:
 * - /login            : LoginPage (pública; redirige a /dashboard si hay sesión)
 * - /                 : → /dashboard
 * - /dashboard        : Dashboard (requiere VIEW_DASHBOARD)
 * - /users            : Gestión de usuarios (requiere VIEW_USERS)
 * - /reports          : Analytics / reportes (requiere VIEW_REPORTS)
 * - /profile          : Perfil de usuario
 * - /profile/sessions : Gestión de sesiones activas
 * - /settings         : Configuración (requiere VIEW_CONFIG)
 * - /access/*         : Control de acceso ITER4 (requiere VIEW_ACCESS)
 * - /audit/*          : Auditoría ITER6 (requiere VIEW_AUDIT)
 * - /alerts/*         : Alertas ITER5 (requiere VIEW_ALERTS)
 * - /access-denied    : Página de acceso denegado
 * - *                 : 404 Not Found
 */

import React, { lazy, Suspense } from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { DashboardLayout } from '@layouts/DashboardLayout'
import { PageTransition, AnimatedLoadingSpinner } from '@components/animations'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { FunctionCatalog } from '../permissions/catalog'
import { selectIsAuthenticated } from '@redux/selectors'

// ── Lazy imports ────────────────────────────────────────────────────────────

const LoginPage = lazy(() =>
  import('@components/containers/LoginPage').then(m => ({ default: m.default || m.LoginPage }))
)
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

const UserManagementPage = lazy(() =>
  import('@components/pages/UserManagement').then(m => ({ default: m.UserManagement }))
)
const AnalyticsDashboardPage = lazy(() =>
  import('@components/pages/Analytics').then(m => ({ default: m.AnalyticsDashboard }))
)
const ActiveSessionsPage = lazy(() =>
  import('@components/features/SessionManagement').then(m => ({ default: m.ActiveSessions }))
)

const AccessDeniedPage = () => (
  <div>
    <h1>Acceso Denegado</h1>
    <p>No tiene permisos para ver esta página.</p>
  </div>
)
const NotFoundPage = () => <div><h1>404 Not Found</h1></div>

// ── Guards ───────────────────────────────────────────────────────────────────

/** Redirige a /dashboard si el usuario ya tiene sesión activa. */
function PublicOnlyRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}
PublicOnlyRoute.propTypes = { children: PropTypes.node.isRequired }

/** Redirige a /login si el usuario no tiene sesión. */
function AuthGuard({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const location = useLocation()
  return isAuthenticated
    ? children
    : <Navigate to="/login" replace state={{ from: location }} />
}
AuthGuard.propTypes = { children: PropTypes.node.isRequired }

// ── Fallback de carga ────────────────────────────────────────────────────────

const RouteLoadingFallback = () => (
  <AnimatedLoadingSpinner
    fullScreen={false}
    size="md"
    message="Cargando página..."
  />
)

// ── Árbol de rutas ───────────────────────────────────────────────────────────

function RoutesWithTransitions() {
  const location = useLocation()

  return (
    <PageTransition key={location.pathname}>
      <Routes>
        {/* Ruta pública: login */}
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Suspense fallback={<RouteLoadingFallback />}>
                <LoginPage />
              </Suspense>
            </PublicOnlyRoute>
          }
        />

        {/* Rutas protegidas dentro del layout principal */}
        <Route
          element={
            <AuthGuard>
              <DashboardLayout
                navLinks={[
                  { id: 1, label: 'Dashboard',  icon: 'grid-alt', path: '/dashboard' },
                  { id: 2, label: 'Usuarios',    icon: 'users',    path: '/users' },
                  { id: 3, label: 'Reportes',    icon: 'chart-bar',path: '/reports' },
                  { id: 4, label: 'Acceso',      icon: 'lock',     path: '/access' },
                  { id: 5, label: 'Auditoría',   icon: 'history',  path: '/audit' },
                  { id: 6, label: 'Alertas',     icon: 'bell',     path: '/alerts' },
                  { id: 7, label: 'Ajustes',     icon: 'cog',      path: '/settings' },
                ]}
                userInfo={{
                  name: 'John Doe',
                  email: 'john.doe@example.com',
                  avatar_url: 'https://via.placeholder.com/40',
                }}
                currentPage="Dashboard"
              />
            </AuthGuard>
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

          {/* Gestión de usuarios — UC-USR-01..04 */}
          <Route
            path="/users"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_USERS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <UserManagementPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Analytics / reportes — UC-RPT-01, 04, 07, 08 */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_REPORTS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AnalyticsDashboardPage />
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

          {/* Sesiones activas — UC-AUTH-05 */}
          <Route
            path="/profile/sessions"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <ActiveSessionsPage />
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
