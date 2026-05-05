```yml
created_at: 2026-05-05 22:29:27
project: IACT-UI
work_package: 2026-05-05-22-24-51-ui-feedback-naming-and-loading
phase: Phase 3 — DIAGNOSE
author: NestorMonroy
status: Borrador
```

# Síntesis DIAGNOSE — ui-feedback-naming-and-loading

## Dominios analizados

| Dominio | Artefacto | Decisión |
|---------|-----------|----------|
| Naming | `analyze/naming/naming-analysis.md` | `ApiErrorToast` → `ApiErrorAlert` |
| Loading | `analyze/loading-architecture/loading-middleware-design.md` | Opción C: contexto por prefijo + `SILENT_CONTEXTS` |

## Decisiones de diseño

### 1. Renombre: `ApiErrorToast` → `ApiErrorAlert`

**Causa raíz:** Naming por analogía visual en lugar de intención de dominio.
`Toast` crea ambigüedad con el `ToastContext` existente (Sistema A de notificaciones UI).

**Decisión:** Renombrar a `ApiErrorAlert` porque:
- `Alert` es el término correcto (el componente ya usa `role="alert"`)
- Elimina la confusión con `ToastContext/Toast/ToastContainer`
- `ServerErrorBanner` no requiere renombre (nombre correcto)

**Impacto:** 6 archivos, ~15 líneas. Bajo riesgo.

**CSS:** `.api-error-toast` → `.api-error-alert` en el mismo commit.

### 2. `loadingMiddleware` + `loadingSlice` — Opción C (contexto por prefijo)

**Causa raíz:** Loading fragmentado en 10 slices sin política transversal.

**Arquitectura:**
- `loadingSlice`: `state.loading.contexts: { logs: 2, access: 1 }` (contadores)
- `loadingMiddleware`: intercepta `*/pending` → `incrementContext(ctx)`;
  `*/fulfilled|rejected` → `decrementContext(ctx)`
- `SILENT_CONTEXTS = new Set(['auth', 'session'])` — no muestran spinner
- Selector: `selectIsLoading('logs')` → `state.loading.contexts['logs'] > 0`

**Criterio de spinners documentado:**
- `LoadingSpinner` → carga inline (tabla, lista, panel)
- `AnimatedLoadingSpinner` → transición de página completa

**Scope piloto:** migrar `LogsPage` + `ETLLogsPage`. Los demás slices/páginas sin cambio.

## Riesgos actualizados

| ID | Estado | Cambio |
|----|--------|--------|
| R-001 | abierto | Sin cambio — el plan de renombre mitiga: un solo commit atómico |
| R-002 | **mitigado** | `SILENT_CONTEXTS` resuelve operaciones silenciosas; Opción C más predecible que opt-out |
| R-003 | **cerrado** | `ApiErrorAlert` verificado con grep: 0 colisiones en el codebase |
| R-004 | **mitigado** | Scope piloto: solo 2 páginas migradas, slices existentes sin tocar |

## Mapa epistémico actualizado

| Categoría | Claims |
|-----------|--------|
| **PROVEN** | `ApiErrorAlert` tiene 0 refs en codebase (verificado grep). 54 thunks totales. `auth` y `session` son los únicos contextos silenciosos relevantes. CSS class `.api-error-toast` existe en `_feedback.scss`. 6 archivos con ref a `ApiErrorToast`. |
| **INFERRED** | `AnimatedLoadingSpinner` es para transiciones de página; `LoadingSpinner` para inline — basado en patrones de uso observados, no en documentación. |
| **SPECULATIVE** | El piloto en `LogsPage`+`ETLLogsPage` validará que el middleware no causa doble-spinner (el slice local `loading` y el `loadingSlice` estarán activos simultáneamente durante la transición). |

**Ratio:** 5 PROVEN + 1 INFERRED + 1 SPECULATIVE / 7 = 86% calibrado ✓

## Próximo paso

→ Phase 5 STRATEGY: confirmar con el ejecutor:
1. ¿Aprueba `ApiErrorAlert` como nombre final?
2. ¿Aprueba la Opción C para `loadingMiddleware`?
3. ¿Scope piloto (2 páginas) o migración completa (10 páginas) en este WP?
