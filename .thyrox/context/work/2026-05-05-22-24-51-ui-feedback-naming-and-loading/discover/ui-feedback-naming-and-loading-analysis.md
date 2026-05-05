```yml
created_at: 2026-05-05 22:24:51
project: IACT-UI
work_package: 2026-05-05-22-24-51-ui-feedback-naming-and-loading
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Phase 1 DISCOVER — ui-feedback-naming-and-loading

## Objetivo / Por qué

Resolver dos hallazgos de deuda técnica detectados en el WP `http-error-handling`:

1. **Naming smell en componentes de feedback**: `ApiErrorToast` mezcla dominio
   (`Api`) con presentación visual (`Toast`). Adicionalmente coexisten dos sistemas
   de nombre similar pero responsabilidad distinta: el nuevo `ApiErrorToast`
   (errores HTTP del middleware) y el antiguo `ToastContext/Toast/ToastContainer`
   (notificaciones de éxito/info). Esto viola Clean Code cap. 2: los nombres
   deben revelar intención, no implementación.

2. **Loading state fragmentado sin coordinación global**: 10 slices gestionan
   su propio `loading: boolean` local, y 10 páginas renderizan `<LoadingSpinner>`
   manualmente. No existe un middleware de loading análogo al
   `errorHandlingMiddleware`. El usuario quiere un sistema que intercepte
   `*/pending` → mostrar spinner, `*/fulfilled|rejected` → ocultar spinner,
   con granularidad por contexto (tabla, reporte, etc.).

## Stakeholders

| Rol | Qué necesita |
|-----|-------------|
| Desarrollador frontend | Nombres de componente que comuniquen intención sin ambigüedad |
| Usuario final (operador IVR) | Feedback visual consistente mientras esperan datos de tablas y reportes |
| Arquitecto del sistema | Reducir duplicación: loading gestionado centralmente, no en cada slice |

## Inventario del estado actual [PROVEN]

### Sistema de feedback de errores

| Componente | Ruta | Responsabilidad | Naming |
|-----------|------|-----------------|--------|
| `ApiErrorToast` | `src/components/feedback/` | Errores HTTP 4xx/5xx del middleware Redux | `Toast` = patrón visual, no dominio |
| `ServerErrorBanner` | `src/components/feedback/` | Errores 502/503 persistentes | Correcto: describe comportamiento |
| `ToastContext` | `src/context/` | Proveedor de notificaciones UI (éxito/info) | Establece contrato `addToast()` |
| `Toast` | `src/components/shared/Toast/` | Elemento visual individual de notificación | Correcto en contexto de shared/Toast/ |
| `ToastContainer` | `src/components/shared/Toast/` | Contenedor que renderiza lista de toasts | Correcto en contexto de shared/Toast/ |

**Problema de naming identificado [PROVEN]:**
- `ApiErrorToast` → el sufijo `Toast` crea ambigüedad con el sistema `ToastContext`.
  Un lector nuevo no sabe si `ApiErrorToast` usa `ToastContext` o es independiente.
  (Es independiente — usa `errorSlice` directamente.)
- `GlobalErrorToast` (el nombre original que se reemplazó) tenía el mismo smell.
- El directorio `src/components/feedback/` ya provee el contexto; el nombre
  podría ser `ApiErrorNotification`, `HttpErrorAlert` o simplemente `ErrorAlert`.

### Sistema de loading

| Elemento | Estado actual |
|---------|---------------|
| Slices con `loading` local | 10 slices (dashboard, admin, logs, auth, user, audit, access, savedFilters, reports, alerts) |
| Slices que exportan selector de loading | 5 de 10 (admin, logs, audit, access, alerts) |
| Páginas que renderizan spinner manualmente | 10 páginas (`{loading ? <LoadingSpinner/> : ...}`) |
| `LoadingSpinner` | `src/components/shared/` — spinner simple, CSS puro |
| `AnimatedLoadingSpinner` | `src/components/animations/` — spinner con Framer Motion |
| Criterio de uso entre los dos spinners | No documentado [INFERRED: AnimatedLoading para transiciones de página, Loading para inline] |
| `uiSlice` | Tiene sidebar/darkMode, NO tiene loading global |
| Middleware de loading | No existe |
| `loadingSlice` | No existe |

**Pattern actual por página [PROVEN — muestra ETLLogsPage]:**
```jsx
const loading = useSelector(selectLogsLoading)
// ...
{loading ? <LoadingSpinner message="Cargando logs ETL..." /> : <tabla/>}
```

Esto se repite en 10 páginas con variaciones mínimas.

## Atributos de calidad relevantes

- **Legibilidad**: nombres que comunican intención sin requerir leer la implementación
- **Consistencia**: un solo patrón de loading en toda la app, no 10 variantes locales
- **DX (Developer Experience)**: el desarrollador que agrega una nueva página no
  debería necesitar gestionar `loading: true/false` en el slice manualmente

## Restricciones

- El sistema `ToastContext` está en uso activo en Jobs, Transactions, UserManagement,
  Settings — no se puede eliminar, solo aclarar su coexistencia con feedback de errores
- `errorSlice` y `errorHandlingMiddleware` ya existen y funcionan — el sistema de
  loading debe ser aditivo, no reemplazar lo existente
- No queremos un spinner global full-screen para TODAS las operaciones (eso sería
  regresión UX) — el loading debe ser contextual (inline en la tabla/reporte afectado)
- Los 10 slices con `loading` local pueden convivir con el nuevo sistema durante
  la transición — migración incremental, no big-bang

## Fuera de alcance

- Migrar los 10 slices existentes a usar el nuevo loading middleware (backlog futuro)
- Toast notifications de éxito/info (ToastContext) — ese sistema funciona y no
  es objeto de este WP
- Tests E2E de los componentes de feedback

## Criterios de éxito

1. `ApiErrorToast` renombrado a algo que no use "Toast" y no colisione con `ToastContext`
2. Criterio documentado: cuándo usar `LoadingSpinner` vs `AnimatedLoadingSpinner`
3. `loadingSlice` + `loadingMiddleware` implementados e integrados en `store.js`
4. Al menos una página migrada como piloto (e.g. `LogsPage` o `ReportsPage`)
5. Tests TDD para `loadingSlice` y `loadingMiddleware`
6. El renombre de `ApiErrorToast` no rompe ningún test existente

## Mapa epistémico

| Categoría | Claims |
|-----------|--------|
| **PROVEN** | 10 slices con `loading` local (verificado con `grep`). 10 páginas con spinner manual (verificado con `find -l`). 5 slices sin selector de loading exportado. `ApiErrorToast` no usa `ToastContext` (lectura directa de código). `uiSlice` sin loading global. Middleware de loading no existe. |
| **INFERRED** | `AnimatedLoadingSpinner` se usa para transiciones de página (AppRouter, LoginPage, DashboardPage) y `LoadingSpinner` para loading inline de datos — división implícita, no documentada. |
| **SPECULATIVE** | Migrar los 10 slices existentes es factible sin breaking changes (requiere validación en Phase 9 PILOT). El nuevo `loadingMiddleware` puede usar el `context` del action type para granularidad sin cambiar los thunks existentes. |

**Ratio:** 6 PROVEN + 1 INFERRED + 2 SPECULATIVE / 9 claims = 78% calibrado ✓

## Stopping Point Manifest

| ID | Fase | Tipo | Evento | Acción requerida |
|----|------|------|--------|-----------------|
| SP-01 | 1→3 | gate-fase | Análisis DISCOVER completo | Ejecutor confirma hallazgos y aprueba avanzar a DIAGNOSE |
| SP-02 | 3→5 | gate-fase | Diagnóstico de naming + loading completo | Ejecutor elige estrategia de naming (renombre vs alias) |
| SP-03 | 5→6 | gate-decision | Decisión: ¿`loadingMiddleware` global vs hook `useLoading`? | Ejecutor aprueba arquitectura antes de descomponer tareas |
| SP-04 | 6→8 | gate-fase | Scope definido: qué páginas migrar en este WP | Ejecutor confirma scope (piloto = 1 página vs todas) |
| SP-05 | 8→10 | gate-fase | Task plan aprobado | Ejecutor da go-ahead para implementar |
| SP-06 | 10→11 | gate-fase | Implementación completa + tests verdes | Ejecutor valida resultado |
```
