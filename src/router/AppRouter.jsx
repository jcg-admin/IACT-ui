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
 * - /settings                     : Configuración (VIEW_OWN_SESSIONS)
 * - /access/*                     : Control de acceso (VIEW_ACCESS)
 * - /audit/*                      : Auditoría (VIEW_AUDIT)
 * - /alerts/*                     : Alertas (VIEW_ALERTS)
 * - /logs/*                       : Observabilidad (VIEW_LOGS)
 * - /admin/*                      : Administración (MANAGE_CATALOG)
 * - /access-denied                : Página de acceso denegado
 * - *                             : 404 Not Found
 */

import React, { lazy, Suspense } from 'react'
import PropTypes from 'prop-types'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { DashboardLayout } from '@layouts/DashboardLayout'
import { PageTransition, AnimatedLoadingSpinner } from '@ui/animations'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { FunctionCatalog } from '../permissions/catalog'
import { selectIsAuthenticated, selectUser } from '@store/selectors'
import { usePermisos } from '../hooks/usePermisos'

// ── Lazy imports ────────────────────────────────────────────────────────────

const LoginPage = lazy(() =>
  import('@screens/auth/Login').then(m => ({ default: m.default || m.Login }))
)
const DashboardPage = lazy(() =>
  import('@ui/containers/DashboardMain').then(m => ({ default: m.default }))
)
const SettingsPage = lazy(() =>
  import('@ui/features/Settings/Settings').then(m => ({ default: m.default }))
)
const ProfilePage = lazy(() =>
  import('@ui/pages/Profile/Profile').then(m => ({ default: m.default }))
)
const AccessPage = lazy(() =>
  import('@ui/pages/Access/Access').then(m => ({ default: m.default }))
)
const AuditPage = lazy(() =>
  import('@ui/pages/Audit/Audit').then(m => ({ default: m.default }))
)
const AuditSearchPage      = lazy(() => import('@screens/audit/AuditSearch'))
const AuditExportPage      = lazy(() => import('@screens/audit/Export'))
const ComplianceReportPage = lazy(() => import('@screens/audit/ComplianceReport'))
const AlertsPage = lazy(() =>
  import('@ui/pages/Alerts/Alerts').then(m => ({ default: m.default }))
)

const UserManagementPage = lazy(() =>
  import('@screens/users/UserManagement').then(m => ({ default: m.UserManagement }))
)
const AnalyticsDashboardPage = lazy(() =>
  import('@ui/pages/Analytics').then(m => ({ default: m.AnalyticsDashboard }))
)
const ActiveSessionsPage = lazy(() =>
  import('@ui/features/SessionManagement').then(m => ({ default: m.ActiveSessions }))
)

const NotFoundPage = lazy(() => import('@screens/errors/NotFound'))
const AccessDeniedPage = lazy(() => import('@screens/errors/AccessDenied'))
const ServerErrorPage = lazy(() => import('@screens/errors/ServerError'))
const ServiceUnavailablePage = lazy(() => import('@screens/errors/ServiceUnavailable'))

// ── Auth pages ───────────────────────────────────────────────────────────────
const RecoverPasswordPage = lazy(() => import('@screens/auth/RecoverPassword'))
const ChangePasswordPage = lazy(() => import('@screens/auth/ChangePassword'))

// ── Logs pages ───────────────────────────────────────────────────────────────
const LogsPage = lazy(() => import('@screens/logs/Logs'))
const ETLLogsPage = lazy(() => import('@screens/logs/ETLLogs'))
const ETLAvailabilityPage = lazy(() => import('@screens/logs/ETLAvailability'))
const LogSearchPage = lazy(() => import('@screens/logs/LogSearch'))
const LogExportPage = lazy(() => import('@screens/logs/LogExport'))
const InfraLogsPage = lazy(() => import('@screens/logs/InfraLogs'))
const SystemStatusPage = lazy(() => import('@screens/logs/SystemStatus'))
const PerformanceMetricsPage = lazy(() => import('@screens/logs/PerformanceMetrics'))
const PipelineStatusPage = lazy(() => import('@screens/logs/PipelineStatus'))
const ETLErrorsPage = lazy(() => import('@screens/logs/ETLErrors'))

// ── Reports pages ────────────────────────────────────────────────────────────
const AgentsReportPage = lazy(() => import('@screens/reports/AgentsReport'))
const QueuesReportPage = lazy(() => import('@screens/reports/QueuesReport'))
const CampaignsReportPage = lazy(() => import('@screens/reports/CampaignsReport'))
const TransfersReportPage = lazy(() => import('@screens/reports/TransfersReport'))
const IVRMenusReportPage = lazy(() => import('@screens/reports/IVRMenusReport'))
const UniqueClientsReportPage = lazy(() => import('@screens/reports/UniqueClientsReport'))
const ScheduledReportPage = lazy(() => import('@screens/reports/ScheduledReport'))
const RealTimeMetricsPage = lazy(() => import('@screens/reports/RealTimeMetrics'))
const HistoricalReportsPage = lazy(() => import('@screens/reports/HistoricalReports'))
const ReportExportPage = lazy(() => import('@screens/reports/ReportExport'))
const SavedViewsPage = lazy(() => import('@screens/reports/SavedViews'))
const SharedViewsPage = lazy(() => import('@screens/reports/SharedViews'))

// ── Permissions pages ─────────────────────────────────────────────────────────
const RevokeGroupPage = lazy(() => import('@screens/permissions/RevokeGroup'))
const ExceptionalPermissionPage = lazy(() => import('@screens/permissions/ExceptionalPermission'))
const RevokeExceptionalPermissionPage = lazy(() => import('@screens/permissions/RevokeExceptionalPermission'))

// ── Access pages ─────────────────────────────────────────────────────────────
const GroupManagementPage = lazy(() => import('@screens/access/GroupManagement'))
const GroupCompositionPage = lazy(() => import('@screens/access/GroupComposition'))
const GroupersPage = lazy(() => import('@screens/access/Groupers'))
const SeparationRulesPage = lazy(() => import('@screens/access/SeparationRules'))
const SegmentsPage = lazy(() => import('@screens/access/Segments'))
const PermissionsAuditPage = lazy(() => import('@screens/access/PermissionsAudit'))
const AssignGroupPage = lazy(() => import('@screens/access/AssignGroup'))
const TemporaryPermissionsPage = lazy(() => import('@screens/access/TemporaryPermissions'))
const AssignFunctionsPage = lazy(() => import('@screens/access/AssignFunctions'))
const PermissionsPage = lazy(() => import('@screens/access/Permissions'))
const AccessAuditPage = lazy(() => import('@screens/access/AccessAudit'))

// ── Alerts pages ──────────────────────────────────────────────────────────────
const TemplatesPage      = lazy(() => import('@screens/alerts/Templates'))
const AlertConfigPage    = lazy(() => import('@screens/alerts/AlertConfig'))
const AlertHistoryPage   = lazy(() => import('@screens/alerts/AlertHistory'))
const SubscriptionsPage  = lazy(() => import('@screens/alerts/Subscriptions'))

// ── Admin pages ──────────────────────────────────────────────────────────────
const FunctionCatalogPage = lazy(() => import('@screens/admin/FunctionCatalog'))
const AGRCatalogPage = lazy(() => import('@screens/admin/AGRCatalog'))
const SeparationRulesCatalogPage = lazy(() => import('@screens/admin/SeparationRulesCatalog'))
const MenuItemCatalogPage = lazy(() => import('@screens/admin/MenuItemCatalog'))

// ── Nav config ───────────────────────────────────────────────────────────────
// Groups that carry children — referenced when building ALL_NAV_LINKS children arrays
const NAV_GROUP_IDS = { REPORTS: 3, LOGS: 7, ACCESS: 4, ADMIN: 8 }

const ALL_NAV_LINKS = [
  { id: 1, label: 'Dashboard',     icon: 'grid-alt',  path: '/dashboard',  permission: FunctionCatalog.VIEW_DASHBOARD },
  { id: 2, label: 'Usuarios',      icon: 'users',     path: '/users',      permission: FunctionCatalog.VIEW_USERS },
  {
    id: NAV_GROUP_IDS.REPORTS,
    label: 'Reportes', icon: 'chart-bar', path: '/reports', permission: FunctionCatalog.VIEW_REPORTS,
    children: [
      { label: 'Históricos',        icon: 'chart-bar',      path: '/reports/historical',     permission: FunctionCatalog.VIEW_REPORTS },
      { label: 'Agentes IVR',       icon: 'headset',        path: '/reports/agents',         permission: FunctionCatalog.VIEW_REPORTS },
      { label: 'Colas IVR',         icon: 'list-ol',        path: '/reports/queues',         permission: FunctionCatalog.VIEW_REPORTS },
      { label: 'Campañas',          icon: 'bullhorn',       path: '/reports/campaigns',      permission: FunctionCatalog.VIEW_REPORTS },
      { label: 'Transferencias',    icon: 'exchange-alt',   path: '/reports/transfers',      permission: FunctionCatalog.VIEW_REPORTS },
      { label: 'Menús IVR',         icon: 'sitemap',        path: '/reports/ivr-menus',      permission: FunctionCatalog.VIEW_REPORTS },
      { label: 'Clientes únicos',   icon: 'user-check',     path: '/reports/unique-clients', permission: FunctionCatalog.VIEW_REPORTS },
      { label: 'Tiempo real',       icon: 'tachometer-alt', path: '/reports/realtime',       permission: FunctionCatalog.VIEW_METRICS },
      { label: 'Programados',       icon: 'calendar-alt',   path: '/reports/scheduled',      permission: FunctionCatalog.SCHEDULE_REPORTS },
      { label: 'Exportar',          icon: 'file-export',    path: '/reports/export',         permission: FunctionCatalog.EXPORT_CSV },
      { label: 'Vistas guardadas',  icon: 'bookmark',       path: '/reports/saved',          permission: FunctionCatalog.SAVE_VIEW },
      { label: 'Vistas compartidas', icon: 'share-alt',     path: '/reports/shares',         permission: FunctionCatalog.VIEW_REPORTS },
    ],
  },
  {
    id: NAV_GROUP_IDS.ACCESS,
    label: 'Acceso', icon: 'lock', path: '/access', permission: FunctionCatalog.VIEW_ACCESS,
    children: [
      { label: 'Grupos de acceso',  icon: 'users',        path: '/access/groups',             permission: FunctionCatalog.MANAGE_GROUPS },
      { label: 'Composición',       icon: 'layer-group',  path: '/access/groups/composition', permission: FunctionCatalog.MANAGE_GROUPS },
      { label: 'Agrupadores',       icon: 'object-group', path: '/access/groupers',           permission: FunctionCatalog.ASSIGN_FUNCTION_GROUPS },
      { label: 'Reglas Separación',  icon: 'ban',          path: '/access/separation-rules',   permission: FunctionCatalog.MANAGE_SEPARATION_RULES },
      { label: 'Segmentos',         icon: 'filter',       path: '/access/segments',           permission: FunctionCatalog.ASSIGN_FUNCTION_GROUPS },
      { label: 'Asignar grupo',     icon: 'user-plus',    path: '/access/assign-group',       permission: FunctionCatalog.ASSIGN_TO_GROUP },
      { label: 'Asignar funciones', icon: 'key',          path: '/access/assign-functions',   permission: FunctionCatalog.MANAGE_ACCESS },
      { label: 'Permisos efectivos',icon: 'shield-alt',   path: '/access/permissions',        permission: FunctionCatalog.VIEW_ACCESS },
      { label: 'Auditoría acceso',  icon: 'history',      path: '/access/audit/access',       permission: FunctionCatalog.VIEW_AUDIT },
    ],
  },
  {
    id: 5,
    label: 'Auditoría', icon: 'history', path: '/audit', permission: FunctionCatalog.VIEW_AUDIT,
    children: [
      { label: 'Log de auditoría', icon: 'history',     path: '/audit',            permission: FunctionCatalog.VIEW_AUDIT },
      { label: 'Buscar',           icon: 'search',      path: '/audit/search',     permission: FunctionCatalog.SEARCH_AUDIT },
      { label: 'Exportar',         icon: 'file-export', path: '/audit/export',     permission: FunctionCatalog.EXPORT_AUDIT },
      { label: 'Cumplimiento',     icon: 'clipboard',   path: '/audit/compliance', permission: FunctionCatalog.VIEW_COMPLIANCE },
    ],
  },
  {
    id: 6,
    label: 'Alertas', icon: 'bell', path: '/alerts', permission: FunctionCatalog.VIEW_ALERTS,
    children: [
      { label: 'Ver alertas',   icon: 'bell',         path: '/alerts',              permission: FunctionCatalog.VIEW_ALERTS },
      { label: 'Configuración', icon: 'sliders-h',    path: '/alerts/config',       permission: FunctionCatalog.CONFIGURE_TEAM_ALERTS },
      { label: 'Historial',     icon: 'history',      path: '/alerts/history',      permission: FunctionCatalog.VIEW_ALERT_HISTORY },
      { label: 'Plantillas',    icon: 'file-alt',     path: '/alerts/templates',    permission: FunctionCatalog.MANAGE_ALERTS },
      { label: 'Suscripciones', icon: 'envelope',     path: '/alerts/subscriptions',permission: FunctionCatalog.SUBSCRIBE_ALERT },
    ],
  },
  {
    id: NAV_GROUP_IDS.LOGS,
    label: 'Logs', icon: 'terminal', path: '/logs', permission: FunctionCatalog.VIEW_LOGS,
    children: [
      { label: 'App logs',          icon: 'file-alt',        path: '/logs',                  permission: FunctionCatalog.VIEW_LOGS },
      { label: 'ETL logs',          icon: 'exchange-alt',    path: '/logs/etl',              permission: FunctionCatalog.VIEW_PIPELINE_LOGS },
      { label: 'Disponibilidad',    icon: 'heartbeat',       path: '/logs/etl/availability', permission: FunctionCatalog.VIEW_DATA_AVAILABILITY },
      { label: 'Errores pipeline',  icon: 'exclamation-triangle', path: '/logs/etl/errors', permission: FunctionCatalog.VIEW_PIPELINE_ERRORS },
      { label: 'Buscar',            icon: 'search',          path: '/logs/search',           permission: FunctionCatalog.SEARCH_LOGS },
      { label: 'Exportar',          icon: 'download',        path: '/logs/export',           permission: FunctionCatalog.EXPORT_LOGS },
      { label: 'Infraestructura',   icon: 'server',          path: '/logs/infra',            permission: FunctionCatalog.VIEW_INFRA_LOGS },
      { label: 'Estado sistema',    icon: 'heartbeat',       path: '/logs/status',           permission: FunctionCatalog.VIEW_SYSTEM_HEALTH },
      { label: 'Métricas técnicas', icon: 'chart-line',      path: '/logs/metrics',          permission: FunctionCatalog.VIEW_TECHNICAL_METRICS },
      { label: 'Supervisión ETL',   icon: 'project-diagram', path: '/logs/pipeline',         permission: FunctionCatalog.VIEW_ETL_SUPERVISION },
    ],
  },
  {
    id: NAV_GROUP_IDS.ADMIN,
    label: 'Admin', icon: 'shield', path: '/admin', permission: FunctionCatalog.MANAGE_CATALOG,
    children: [
      { label: 'Funciones RBAC',    icon: 'list-check', path: '/admin/functions',          permission: FunctionCatalog.MANAGE_CATALOG },
      { label: 'Grupos AGR',        icon: 'users-cog',  path: '/admin/groups',             permission: FunctionCatalog.MANAGE_CATALOG },
      { label: 'Reglas SoD',        icon: 'ban',        path: '/admin/separation-rules',   permission: FunctionCatalog.CREATE_SEPARATION_RULE },
      { label: 'Menú Items',        icon: 'sitemap',    path: '/admin/menu-items',         permission: FunctionCatalog.MANAGE_MENU_CATALOG },
    ],
  },
  { id: 9, label: 'Ajustes',       icon: 'cog',       path: '/settings',   permission: FunctionCatalog.VIEW_OWN_SESSIONS },
]

function useFilteredNavLinks() {
  const { hasPermission, loading } = usePermisos()
  if (loading) return ALL_NAV_LINKS.slice(0, 1)
  return ALL_NAV_LINKS
    .filter(link => hasPermission(link.permission))
    .map(link => ({
      ...link,
      children: link.children?.filter(c => hasPermission(c.permission)) ?? [],
    }))
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
  const currentUser = useSelector(selectUser)

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
                  name:       currentUser?.name       ?? '',
                  email:      currentUser?.email      ?? '',
                  avatar_url: currentUser?.avatar_url ?? '',
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
              <ProtectedRoute permission={FunctionCatalog.VIEW_ALL_SESSIONS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ActiveSessionsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_OWN_SESSIONS}>
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

          {/* Auditoría — búsqueda avanzada (UC-AUD-02) */}
          <Route
            path="/audit/search"
            element={
              <ProtectedRoute permission={FunctionCatalog.SEARCH_AUDIT}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AuditSearchPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Auditoría — exportación (UC-AUD-03) */}
          <Route
            path="/audit/export"
            element={
              <ProtectedRoute permission={FunctionCatalog.EXPORT_AUDIT}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AuditExportPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Auditoría — cumplimiento (UC-AUD-04) */}
          <Route
            path="/audit/compliance"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_COMPLIANCE}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ComplianceReportPage />
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
              <ProtectedRoute permission={FunctionCatalog.ASSIGN_FUNCTION_GROUPS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <GroupersPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Acceso — reglas de separación de funciones (UC-ACC-05) */}
          <Route
            path="/access/separation-rules"
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
              <ProtectedRoute permission={FunctionCatalog.ASSIGN_FUNCTION_GROUPS}>
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
              <ProtectedRoute permission={FunctionCatalog.VIEW_ACCESS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <PermissionsAuditPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="/access/assign-group"
            element={
              <ProtectedRoute permission={FunctionCatalog.ASSIGN_TO_GROUP}>
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

          {/* Alertas — configuración (UC-ALR-03) */}
          <Route
            path="/alerts/config"
            element={
              <ProtectedRoute permission={FunctionCatalog.CONFIGURE_TEAM_ALERTS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AlertConfigPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Alertas — historial (UC-ALR-04) */}
          <Route
            path="/alerts/history"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_ALERT_HISTORY}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AlertHistoryPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Alertas — suscripciones (UC-ALR-06) */}
          <Route
            path="/alerts/subscriptions"
            element={
              <ProtectedRoute permission={FunctionCatalog.SUBSCRIBE_ALERT}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SubscriptionsPage />
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
              <ProtectedRoute permission={FunctionCatalog.VIEW_PIPELINE_LOGS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ETLLogsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/etl/availability"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_DATA_AVAILABILITY}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ETLAvailabilityPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/etl/errors"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_PIPELINE_ERRORS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ETLErrorsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/search"
            element={
              <ProtectedRoute permission={FunctionCatalog.SEARCH_LOGS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <LogSearchPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/export"
            element={
              <ProtectedRoute permission={FunctionCatalog.EXPORT_LOGS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <LogExportPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/infra"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_INFRA_LOGS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <InfraLogsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/status"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_SYSTEM_HEALTH}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SystemStatusPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs/metrics"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_TECHNICAL_METRICS}>
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
              <ProtectedRoute permission={FunctionCatalog.VIEW_METRICS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <RealTimeMetricsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* UC-RPT-03 — Reportes históricos */}
          <Route
            path="/reports/historical"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_REPORTS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <HistoricalReportsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* UC-RPT-04 — Exportar reporte (async job) */}
          <Route
            path="/reports/export"
            element={
              <ProtectedRoute permission={FunctionCatalog.EXPORT_CSV}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ReportExportPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* UC-RPT-10 — Vistas guardadas */}
          <Route
            path="/reports/saved"
            element={
              <ProtectedRoute permission={FunctionCatalog.SAVE_VIEW}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SavedViewsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* UC-RPT-11 — Vistas compartidas */}
          <Route
            path="/reports/shares"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_REPORTS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SharedViewsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Permisos — UC-PERM-01: asignar grupo (mismo componente que /access/assign-group) */}
          <Route
            path="/permissions/assign-group"
            element={
              <ProtectedRoute permission={FunctionCatalog.ASSIGN_TO_GROUP}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AssignGroupPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* Permisos — UC-PERM-02: revocar grupo */}
          <Route
            path="/permissions/revoke-group"
            element={
              <ProtectedRoute permission={FunctionCatalog.REVOKE_FUNCTION_GROUP}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <RevokeGroupPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* Permisos — UC-ACC-08: permisos temporales con fecha de expiración */}
          <Route
            path="/permissions/temp-permissions"
            element={
              <ProtectedRoute permission={FunctionCatalog.GRANT_EXCEPTIONAL}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <TemporaryPermissionsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* Permisos — UC-PERM-03: conceder permiso excepcional (justificación + anti-self P-11) */}
          <Route
            path="/permissions/exceptional-permission"
            element={
              <ProtectedRoute permission={FunctionCatalog.GRANT_EXCEPTIONAL}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <ExceptionalPermissionPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* Permisos — UC-015: revocar permiso excepcional */}
          <Route
            path="/permissions/revoke-exceptional"
            element={
              <ProtectedRoute permission={FunctionCatalog.REVOKE_EXCEPTIONAL}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <RevokeExceptionalPermissionPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Acceso — asignar/revocar funciones (UC-ACC-01, UC-ACC-02) */}
          <Route
            path="/access/assign-functions"
            element={
              <ProtectedRoute permission={FunctionCatalog.MANAGE_ACCESS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AssignFunctionsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Acceso — permisos efectivos de usuario (UC-ACC-03) */}
          <Route
            path="/access/permissions"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_ACCESS}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <PermissionsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Acceso — auditoría de cambios de acceso (UC-ACC-09) */}
          <Route
            path="/access/audit/access"
            element={
              <ProtectedRoute permission={FunctionCatalog.VIEW_AUDIT}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AccessAuditPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Administración del sistema — MANAGE_CATALOG (UC-ADM-01..05) */}
          <Route
            path="/admin/functions"
            element={
              <ProtectedRoute permission={FunctionCatalog.MANAGE_CATALOG}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <FunctionCatalogPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/groups"
            element={
              <ProtectedRoute permission={FunctionCatalog.MANAGE_CATALOG}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <AGRCatalogPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          {/* Admin — ciclo de vida reglas SoD (UC-ADM-01) */}
          <Route
            path="/admin/separation-rules"
            element={
              <ProtectedRoute permission={FunctionCatalog.CREATE_SEPARATION_RULE}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <SeparationRulesCatalogPage />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Admin — catálogo + lifecycle de MenuItems (UC-ADM-04, UC-ADM-05) */}
          <Route
            path="/admin/menu-items"
            element={
              <ProtectedRoute permission={FunctionCatalog.MANAGE_MENU_CATALOG}>
                <Suspense fallback={<RouteLoadingFallback />}>
                  <MenuItemCatalogPage />
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
