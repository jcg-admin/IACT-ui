```yml
created_at: 2026-05-05 22:43:47
project: IACT-UI
work_package: 2026-05-05-22-24-51-ui-feedback-naming-and-loading
phase: Phase 5 — STRATEGY
author: NestorMonroy
status: Borrador
```

# Análisis de Migración Completa — Loading Centralizado

> Este artefacto es el análisis solicitado explícitamente por el ejecutor:
> "posterior crear un análisis de como sería la migración completa".
> NO es el scope del WP actual — es insumo para un WP de deuda técnica futuro.

---

## Inventario completo [PROVEN]

### Slices con `loading: boolean` local

| Slice | Thunks | Contexto (prefijo) | Páginas consumidoras |
|-------|-------:|-------------------|---------------------|
| `logsSlice` | 8 | `logs` | LogsPage, ETLLogsPage, InfraLogsPage, LogSearchPage, LogExportPage, PerformanceMetricsPage, SystemStatusPage (7) |
| `accessSlice` | 12 | `access` | AccessAuditPage, AssignFunctionsPage, GroupCompositionPage, GroupersPage, GroupManagementPage, PermissionsPage, TemporaryPermissionsPage (7) |
| `alertsSlice` | 10 | `alerts` | AlertsPage, AlertHistoryPage, AlertConfigPage, TemplatesPage, SubscriptionsPage (5) |
| `auditSlice` | 5 | `audit` | AuditPage, AuditSearchPage, ComplianceReportPage, ExportPage (4) |
| `adminSlice` | 8 | `admin` | AGRCatalogPage, FunctionCatalogPage (2) |
| `reportsSlice` | 4 | `reports` | *(sin consumidores directos — ver nota abajo)* |
| `dashboardSlice` | 2 | `dashboard` | *(DashboardPage vía AnimatedLoadingSpinner — no migrar)* |
| `savedFiltersSlice` | 4 | `savedFilters` | *(carga silenciosa, no hay spinner visible)* |
| `userSlice` | 5 | `user` | *(carga de perfil — ux silenciosa)* |

**Total:** 9 slices con `loading: false`, 58 thunks totales [verificado con grep].

**Nota sobre `reportsSlice`:** Las páginas de reports (`AgentsReportPage`,
`CampaignsReportPage`, etc.) usan `useState(false)` local + `setLoading`
manual, no el `reportsSlice`. Son un caso diferente — ver sección "Casos edge".

---

### Páginas con spinner visible (candidatas a migración)

| Dominio | Páginas | Patrón actual | Selector actual |
|---------|--------:|--------------|----------------|
| logs | 7 | `loading ? <LoadingSpinner/> : <tabla/>` | `selectLogsLoading` |
| access | 7 | `loading ? <LoadingSpinner/> : <tabla/>` | `selectLoading` (from accessSlice) |
| alerts | 5 | `loading ? <LoadingSpinner/> : <tabla/>` | `selectLoading` (from alertsSlice) |
| audit | 4 | `loading ? <LoadingSpinner/> : <tabla/>` | `selectLoading` (from auditSlice) |
| admin | 2 | *(verificar patrón)* | *(sin selector exportado)* |
| **Total** | **25** | — | — |

---

## Categorías de migración

### Categoría A — Migración directa (recomendada)

**Criterio:** páginas que usan `useSelector(selectLoading)` del slice correspondiente
con un `<LoadingSpinner>` inline. Migración = 1 línea cambiada.

**Páginas (22 en total):**

| Grupo | Páginas | Contexto nuevo |
|-------|--------:|---------------|
| logs | LogsPage ✓, ETLLogsPage ✓, InfraLogsPage, LogSearchPage, LogExportPage, PerformanceMetricsPage, SystemStatusPage | `selectIsLoading('logs')` |
| access | AccessAuditPage, AssignFunctionsPage, GroupCompositionPage, GroupersPage, GroupManagementPage, PermissionsPage, TemporaryPermissionsPage | `selectIsLoading('access')` |
| alerts | AlertsPage, AlertHistoryPage, TemplatesPage, SubscriptionsPage | `selectIsLoading('alerts')` |
| audit | AuditPage, AuditSearchPage, ComplianceReportPage, ExportPage | `selectIsLoading('audit')` |

✓ = incluidas en el piloto del WP actual.

**Patrón de cambio por página:**
```jsx
// ANTES:
import { selectLoading } from '../../../redux/slices/logsSlice'
const loading = useSelector(selectLoading)

// DESPUÉS:
import { selectIsLoading } from '@redux/slices/loadingSlice'
const isLoading = useSelector(selectIsLoading('logs'))
```

Un `sed` o rename + update de imports basta. El `<LoadingSpinner>` permanece.

---

### Categoría B — Requiere análisis adicional

#### B-1: `AlertConfigPage`

Usa `loading` de `alertsSlice` pero es un formulario (POST), no una tabla.
El spinner durante submit de formulario puede tener semántica diferente al
spinner de carga de datos. Verificar si debe usar `selectIsLoading('alerts')`
o mantener loading local para indicar "enviando".

**Recomendación:** mantener `loading` local para operaciones de escritura.
Solo migrar la carga inicial de datos (`fetchTemplates` en `AlertConfigPage`).

#### B-2: Admin pages (`AGRCatalogPage`, `FunctionCatalogPage`)

`adminSlice` no exporta un selector de loading [PROVEN]. Las páginas admin
pueden estar usando `loading` local o accediendo directamente a `state.admin.loading`.
Verificar antes de migrar.

---

### Categoría C — No migrar (casos especiales)

| Página/Caso | Razón |
|-------------|-------|
| `DashboardPage` | Usa `AnimatedLoadingSpinner` para transición de página — el criterio documentado dice que este spinner no se migra |
| Páginas de reports (6) | Usan `useState(false)` + `setLoading` manual, sin thunks RTK. No son interceptadas por el middleware. Requieren refactor diferente (moverlas a `reportsSlice`) si se quiere centralizar |
| `auth/*` pages | `SILENT_CONTEXTS` incluye `auth` — estos no muestran spinner global. Ninguna de estas páginas debe migrar a `selectIsLoading('auth')` |
| `userSlice`, `savedFiltersSlice` | Cargas silenciosas (perfil, filtros guardados) — no hay spinner visible. No migrar |
| `dashboardSlice` | Solo 2 thunks, usa `AnimatedLoadingSpinner` en transición — no aplica `LoadingSpinner` inline |

---

## Slices: ¿eliminar `loading` local después de migrar?

La migración de páginas (selector nuevo) puede hacerse sin tocar los slices.
Pero al completar la migración de todas las páginas de un dominio, el `loading: boolean`
en el slice queda como estado muerto (nadie lo lee).

**Proceso de limpieza post-migración (por slice):**

1. Verificar que todas las páginas del dominio usan `selectIsLoading('ctx')`
2. Verificar que ningún test usa el selector viejo
3. Eliminar del slice:
   - `loading: false` en `initialState`
   - `addCase(thunk.pending, state => { state.loading = true })`
   - `addCase(thunk.fulfilled/rejected, state => { state.loading = false })`
   - `export const selectLoading = ...`
4. Actualizar tests del slice

**Estimación:** 30-45 líneas eliminadas por slice, 6 slices = ~200-270 líneas eliminadas.

**Riesgo:** verificar que ningún componente externo (no en `src/pages`) usa el selector
viejo antes de eliminarlo.

---

## Orden de migración recomendado

Basado en: complejidad de páginas, cantidad de consumidores, riesgo de regresión.

```
Fase 1 (este WP — piloto):
  ✓ LogsPage + ETLLogsPage

Fase 2 (próximo WP de deuda técnica):
  InfraLogsPage, LogSearchPage, LogExportPage, PerformanceMetricsPage, SystemStatusPage
  → completar el dominio 'logs'
  → limpiar loading de logsSlice

Fase 3:
  access/* (7 páginas) — dominio con más páginas, todas usan el mismo selector
  → limpiar loading de accessSlice

Fase 4:
  audit/* (4 páginas) + alerts/* (4 páginas directas, excluir AlertConfigPage)
  → limpiar auditSlice y alertsSlice

Fase 5:
  AlertConfigPage (formulario — requiere análisis separado)
  admin/* (requiere verificar selector)

Fase 6 (opcional):
  reports/* — requiere primero mover a reportsSlice (trabajo diferente)
```

---

## Estimación de esfuerzo por fase

| Fase | Páginas | Cambio por página | Riesgo | WP dedicado |
|------|--------:|------------------|--------|-------------|
| 1 (piloto) | 2 | 1 línea | bajo | este WP |
| 2 | 5 | 1 línea | bajo | deuda-loading-logs |
| 3 | 7 | 1 línea | bajo | deuda-loading-access |
| 4 | 8 | 1 línea | bajo | deuda-loading-audit-alerts |
| 5 | 3 | verificar primero | medio | deuda-loading-admin |
| 6 | 6 | refactor mayor | alto | deuda-loading-reports |

**Nota:** Los cambios de Fases 2–5 son mecánicos (1 línea por página). El valor
está en la limpieza de los slices — ahí está la reducción real de código duplicado.

---

## Impacto final de la migración completa

| Métrica | Antes | Después |
|---------|------:|--------:|
| Slices con `loading: boolean` | 9 | 0 |
| Páginas con selector de loading local | ~25 | 0 |
| Líneas de boilerplate eliminadas (slices) | — | ~270 |
| Páginas con `loading` de `useState` (reports) | 6 | 6 (requiere otro WP) |
| Punto único de gestión de loading | ✗ | ✓ (`loadingSlice`) |
| Criterio de spinner documentado | ✗ | ✓ |

---

## Dependencias de este análisis

Este análisis asume que:
1. El piloto del WP actual valida que el middleware no causa doble-spinner
   (el `loading` local del slice y el `loadingSlice` activos simultáneamente)
2. El piloto valida que `SILENT_CONTEXTS = Set(['auth', 'session'])` es correcto
3. Los tests del piloto pasan antes de planificar Fase 2

Si el piloto revela problemas de diseño, este análisis debe ser revisado.

---

## Notas para el WP de deuda técnica

Al crear el WP de migración completa, incluir como contexto:
- Este documento como análisis de partida
- Los resultados del piloto (LogsPage + ETLLogsPage) como evidencia de comportamiento
- ADR-ui-loading-middleware (en `strategy/ui-feedback-naming-and-loading-solution-strategy.md`)
- Verificar con `grep -rn "selectLoading" src/` antes de ejecutar cada fase
