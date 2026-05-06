/**
 * AppRouter Component
 * Configuración principal de rutas de la aplicación
 *
 * Rutas:
 * - /login                        : LoginPage (pública)
 * - /recover-password             : RecoverPasswordPage (pública)
 * - /change-password              : ChangePasswordPage (requiere sesión)
 * - /                             : → /dashboard
 * - /dashboard                    : Dashboard (VIEW_DASHBOARD)
 * - /users                        : Gestión de usuarios (VIEW_USERS)
 * - /reports/*                    : Reportes IVR (VIEW_REPORTS)
 * - /profile, /profile/sessions   : Perfil de usuario
 * - /settings                     : Configuración (VIEW_CONFIG)
 * - /access/*                     : Control de acceso (VIEW_ACCESS)
 * - /audit/*                      : Auditoría (VIEW_AUDIT)
 * - /alerts/*                     : Alertas (VIEW_ALERTS)
 * - /logs/*                       : Observabilidad (VIEW_LOGS)
 * - /admin/*                      : Administración (SUPER_ADMIN)
 * - /access-denied                : Página de acceso denegado
 * - *                             : 404 Not Found
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
import { usePermisos } from '../hooks/usePermisos'

// ── Lazy imports ────────────────────────────────────────────────────────────

const LoginPage = lazy(() =>
  import('@components/containers/LoginPage').then(m => ({ default: m.default || m.LoginPage }))
)
const DashboardPage = lazy(() =>
  import('@components/containers/DashboardPage').then(m => ({ default: m.default }))
)
const SettingsPage = lazy(() =>
  import('@components/features/Settings/SettingsPage').then(m => ({ default: m.default }))
)
const ProfilePage = lazy(() =>
  import('@components/pages/Profile/ProfilePage').then(m => ({ default: m.default }))
)
const AccessPage = lazy(() =>
  import('@components/pages/Access/AccessPage').then(m => ({ default: m.default }))
)
const AuditPage = lazy(() =>
  import('@components/pages/Audit/AuditPage').then(m => ({ default: m.default }))
)
const AlertsPage = lazy(() =>
  import('@components/pages/Alerts/AlertsPage').then(m => ({ default: m.default }))
)

const UserManagementPage = lazy(() =>
  import('@components/pages/UserManagement').then(m => ({ default: m.UserManagement }))
)
const AnalyticsDashboardPage = lazy(() =>
  import('@components/pages/Analytics').then(m => ({ default: m.AnalyticsDashboard }))
)
const ActiveSessionsPage = lazy(() =>
  import('@components/features/SessionManagement').then(m => ({ default: m.ActiveSessions }))
)

const NotFoundPage = lazy(() => import('@pages/errors/NotFoundPage'))
const AccessDeniedPage = lazy(() => import('@pages/errors/AccessDeniedPage'))
const ServerErrorPage = lazy(() => import('@pages/errors/ServerErrorPage'))
const ServiceUnavailablePage = lazy(() => import('@pages/errors/ServiceUnavailablePage'))

// ── Auth pages ───────────────────────────────────────────────────────────────
const RecoverPasswordPage = lazy(() => import('@pages/auth/RecoverPasswordPage'))
const ChangePasswordPage = lazy(() => import('@pages/auth/ChangePasswordPage'))

// ── Logs pages ───────────────────────────────────────────────────────────────
const LogsPage = lazy(() => import('@pages/logs/LogsPage'))
const ETLLogsPage = lazy(() => import('@pages/logs/ETLLogsPage'))
const ETLAvailabilityPage = lazy(() => import('@pages/logs/ETLAvailabilityPage'))
const LogSearchPage = lazy(() => import('@pages/logs/LogSearchPage'))
const LogExportPage = lazy(() => import('@pages/logs/LogExportPage'))
const InfraLogsPage = lazy(() => import('@pages/logs/InfraLogsPage'))
const SystemStatusPage = lazy(() => import('@pages/logs/SystemStatusPage'))
const PerformanceMetricsPage = lazy(() => import('@pages/logs/PerformanceMetricsPage'))
const PipelineStatusPage = lazy(() => import('@pages/logs/PipelineStatusPage'))

// ── Reports pages ────────────────────────────────────────────────────────────
const AgentsReportPage = lazy(() => import('@pages/reports/AgentsReportPage'))
const QueuesReportPage = lazy(() => import('@pages/reports/QueuesReportPage'))
const CampaignsReportPage = lazy(() => import('@pages/reports/CampaignsReportPage'))
const TransfersReportPage = lazy(() => import('@pages/reports/TransfersReportPage'))
const IVRMenusReportPage = lazy(() => import('@pages/reports/IVRMenusReportPage'))
const UniqueClientsReportPage = lazy(() => import('@pages/reports/UniqueClientsReportPage'))
const ScheduledReportPage = lazy(() => import('@pages/reports/ScheduledReportPage'))
const RealTimeMetricsPage = lazy(() => import('@pages/reports/RealTimeMetricsPage'))

// ── Access pages ─────────────────────────────────────────────────────────────
const GroupManagementPage = lazy(() => import('@pages/access/GroupManagementPage'))
const GroupCompositionPage = lazy(() => import('@pages/access/GroupCompositionPage'))
const GroupersPage = lazy(() => import('@pages/access/GroupersPage'))
const SeparationRulesPage = lazy(() => import('@pages/access/SeparationRulesPage'))
const SegmentsPage = lazy(() => import('@pages/access/SegmentsPage'))
const PermissionsAuditPage = lazy(() => import('@pages/access/PermissionsAuditPage'))
const AssignGroupPage = lazy(() => import('@pages/access/AssignGroupPage'))

// ── Alerts pages ──────────────────────────────────────────────────────────────
const TemplatesPage = lazy(() => import('@pages/alerts/TemplatesPage'))

// ── Admin pages ──────────────────────────────────────────────────────────────
const FunctionCatalogPage = lazy(() => import('@pages/admin/FunctionCatalogPage'))
const AGRCatalogPage = lazy(() => import('@pages/admin/AGRCatalogPage'))

// ── Nav config ───────────────────────────────────────────────────────────────

const ALL_NAV_LINKS = [
  { id: 1, label: 'Dashboard',     icon: 'grid-alt',  path: '/dashboard',  permission: FunctionCatalog.VIEW_DASHBOARD },
  { id: 2, label: 'Usuarios',      icon: 'users',     path: '/users',      permission: FunctionCatalog.VIEW_USERS },
  { id: 3, label: 'Reportes',      icon: 'chart-bar', path: '/reports',    permission: FunctionCatalog.VIEW_REPORTS },
  { id: 4, label: 'Acceso',        icon: 'lock',      path: '/access',     permission: FunctionCatalog.VIEW_ACCESS },
  { id: 5, label: 'Auditoría',     icon: 'history',   path: '/audit',      permission: FunctionCatalog.VIEW_AUDIT },
  { id: 6, label: 'Alertas',       icon: 'bell',      path: '/alerts',     permission: FunctionCatalog.VIEW_ALERTS },
  { id: 7, label: 'Logs',          icon: 'terminal',  path: '/logs',       permission: FunctionCatalog.VIEW_LOGS },
  { id: 8, label: 'Admin',         icon: 'shield',    path: '/admin',      permission: FunctionCatalog.SUPER_ADMIN },
  { id: 9, label: 'Ajustes',       icon: 'cog',       path: '/settings',   permission: FunctionCatalog.VIEW_CONFIG },
]

function useFilteredNavLinks() {
  const { hasPermission, loading } = usePermisos()
  if (loading) return ALL_NAV_LINKS.slice(0, 1)
  return ALL_NAV_LINKS.filter(link => hasPermission(link.permission))
}

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
  const navLinks = useFilteredNavLinks()

  return (
    <PageTransition key={location.pathname}>
      <Routes>
        {/* Rutas públicas */}
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
        <Route
          path="/recover-password"
          element={
            <PublicOnlyRoute>
              <Suspense fallback={<RouteLoadingFallback />}>
                <RecoverPasswordPage />
              </Suspense>
            </PublicOnlyRoute>
          }
        />

        {/* Rutas protegidas dentro del layout principal */}
        <Route
          element={
            <AuthGuard>
              <DashboardLayout
                navLinks={navLinks}
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

          {/* Cambio de contraseña — requiere sesión (UC-AUTH-04) */}
          <Route
            path="/change-password"
            element={
              <Suspense fallback={<RouteLoadingFallback />}>
                <ChangePasswordPage />
              </Suspense>
            }
          />

          {/* Acceso — grupos y composición (UC-PERM-05, UC-PERM-06) */}
          <Route
            path="/access/groups"
            element={
              <ProtectedRoute permission={FunctionCatalog.MANAGE_GROUPS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <GroupManagementPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/access/groups/composition"
            element={
              <ProtectedRoute permission={FunctionCatalog.MANAGE_GROUPS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <GroupCompositionPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Acceso — agrupadores de funciones (UC-ACC-04) */}
          <Route
            path="/access/groupers"
            element={
              <ProtectedRoute permission={FunctionCatalog.MANAGE_ACCESS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <GroupersPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Acceso — reglas de separación de funciones/SoD (UC-ACC-05) */}
          <Route
            path="/access/sod-rules"
            element={
              <ProtectedRoute permission={FunctionCatalog.MANAGE_SEPARATION_RULES}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SeparationRulesPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Acceso — segmentos (UC-ACC-06, UC-ACC-07) */}
          <Route
            path="/access/segments"
            element={
              <ProtectedRoute permission={FunctionCatalog.MANAGE_ACCESS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SegmentsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Permisos — auditoría (UC-PERM-10) */}
          <Route
            path="/access/audit/permissions"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_PERMISSIONS_AUDIT}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <PermissionsAuditPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/access/assign-group"
            element={
              <ProtectedRoute permission={FunctionCatalog.MANAGE_ACCESS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AssignGroupPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Alertas — plantillas (UC-ALR-05) */}
          <Route
            path="/alerts/templates"
            element={
              <ProtectedRoute permission={FunctionCatalog.MANAGE_ALERTS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <TemplatesPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Observabilidad — logs (UC-LOG-01..07) */}
          <Route
            path="/logs"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_LOGS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <LogsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/etl"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_LOGS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ETLLogsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/etl/availability"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_LOGS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ETLAvailabilityPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/search"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_LOGS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <LogSearchPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/export"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_LOGS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <LogExportPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/infra"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_LOGS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <InfraLogsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/status"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_LOGS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SystemStatusPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/metrics"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_LOGS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <PerformanceMetricsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/logs/pipeline"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_ETL_SUPERVISION}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <PipelineStatusPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Reportes IVR — sub-rutas (UC-RPT-*) */}
          <Route
            path="/reports/agents"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_REPORTS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AgentsReportPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/queues"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_REPORTS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <QueuesReportPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/campaigns"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_REPORTS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <CampaignsReportPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/transfers"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_REPORTS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <TransfersReportPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/ivr-menus"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_REPORTS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <IVRMenusReportPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/unique-clients"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_REPORTS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <UniqueClientsReportPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* UC-RPT-07/08 — Reportes programados */}
          <Route
            path="/reports/scheduled"
            element={
              <ProtectedRoute permission={FunctionCatalog.SCHEDULE_REPORTS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ScheduledReportPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* UC-RPT-02 — Métricas en tiempo real */}
          <Route
            path="/reports/realtime"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_REALTIME_METRICS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <RealTimeMetricsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Administración del sistema — SUPER_ADMIN (UC-ADM-01..03) */}
          <Route
            path="/admin/functions"
            element={
              <ProtectedRoute permission={FunctionCatalog.SUPER_ADMIN}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <FunctionCatalogPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/groups"
            element={
              <ProtectedRoute permission={FunctionCatalog.SUPER_ADMIN}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AGRCatalogPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={<Navigate to="/admin/functions" replace />}
          />

          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="/server-error" element={<ServerErrorPage />} />
          <Route path="/service-unavailable" element={<ServiceUnavailablePage />} />
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
