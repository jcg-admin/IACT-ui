# HALLAZGOS-FASE7-FASE8-IACT-UI-2026-05-16T15:40:46

**Documento:** HALLAZGOS-FASE7-FASE8-IACT-UI-2026-05-16T15:40:46  
**Fecha:** 2026-05-16  
**Repositorio:** IACT-ui  
**Commits:** 92042ad (FASE 7), 86d0dbb (FASE 8)  
**Plan base:** PLAN-IMPL-IACT-UI-2026-05-16T13:29:38.md — FASES 7 y 8

---

## FASE 7 — `react-hooks/exhaustive-deps`

### Estado antes

```
npx jest --no-coverage → 2377 passed, 0 failed
Plan: 17 casos de exhaustive-deps en 17 archivos
```

### Análisis por grupo

**Grupo A — 7 reportes IVR:** todos tenían `useEffect(() => { loadData() }, [])`.
La corrección estructural es envolver `loadData` en `useCallback` con `[filters]`
como dependencia, y actualizar el `useEffect` a `[loadData]`.

Resultado para los 7: `useCallback` importado, `loadData` convertida, `useEffect`
actualizado. Los 111 tests de los 7 reportes pasan sin modificación.

**Grupo B — 10 casos analizados individualmente:**

| Archivo | Acción tomada | Razón |
|---|---|---|
| `PermissionsAudit.jsx` | Ninguna | Ya tenía `[dispatch]` correcto |
| `PerformanceMetrics.jsx` | Ninguna | Ya tenía `[dispatch]` correcto |
| `SystemStatus.jsx` | Ninguna | Ya tenía `[dispatch]` correcto |
| `AssignFunctions.jsx` | Ninguna | Ambos useEffect ya tenían `[dispatch]` y `[success, dispatch]` |
| `SessionProvider.jsx` | `eslint-disable-next-line` | `checkSession` definida post-`useEffect` |
| `ScheduledReports.jsx` | `eslint-disable-next-line` | Carga inicial al montar, `loadSchedules` post-definida |
| `useLocalTransaction.js` | `eslint-disable-next-line` | Cleanup al desmontar, `[]` intencional |
| `Permissions.jsx` | `eslint-disable-next-line` | Carga inicial al montar |
| `Segments.jsx` | `eslint-disable-next-line` | Carga inicial al montar |
| `ReportExport.jsx` | `eslint-disable-next-line` | Cleanup de intervalo al desmontar |

### H-F7-001 — 4 casos del plan ya eran correctos

`PermissionsAudit.jsx`, `PerformanceMetrics.jsx`, `SystemStatus.jsx` y
`AssignFunctions.jsx` ya tenían arrays de dependencias correctos (`[dispatch]`,
`[success, dispatch]`). El análisis previo los detectó erróneamente porque el
regex buscaba `useEffect` con `[]` pero algunos de estos usaban multilínea o
tenían el array en líneas diferentes.

### H-F7-002 — Criterio para `eslint-disable` vs corrección estructural

Criterio aplicado: los casos donde `[]` es intencional (cleanup al desmontar,
carga única al montar donde la función de carga es un detalle de implementación
y no una dependencia conceptual) reciben `eslint-disable-next-line` con
comentario explicativo. Los casos donde la función de carga tiene dependencias
reales del estado del componente (los 7 reportes con `filters`) reciben la
corrección estructural con `useCallback`.

---

## FASE 8 — Páginas huérfanas

### Estado antes

```
src/pages/Dashboard.jsx — placeholder vacío, sin referencias
src/pages/Home.jsx      — referenciada por src/app/App.jsx
src/pages/NotFound.jsx  — duplicado de errors/NotFound, sin referencias
src/pages/Settings.jsx  — placeholder vacío, sin referencias
src/pages/Profile.jsx   — 137 líneas con lógica real, sin ruta en AppRouter
```

### H-F8-001 — Sistema de entrada paralelo (`src/index.jsx` → `src/app/App.jsx`)

**Hallazgo crítico detectado antes de cualquier eliminación.**

El proyecto tiene dos sistemas de entrada:

```
Sistema principal (webpack entry: src/index.js):
  src/index.js → src/App.jsx → AppRouter + AppProviders
  
Sistema paralelo (sin conexión a webpack.config.js):
  src/index.jsx → src/app/App.jsx → src/pages/Home.jsx
```

`src/pages/Home.jsx` es referenciada únicamente por `src/app/App.jsx`, que
a su vez usa `@state/store` (el store secundario de `src/state/`) en lugar
del store principal de `src/redux/`.

`webpack.config.js` solo tiene `entry: './src/index.js'` — el sistema paralelo
(`index.jsx`) no está conectado al bundle de producción.

**Decisión:** Home.jsx no se elimina de forma aislada porque ello requeriría
coordinar con `src/index.jsx` y `src/app/App.jsx`. Se añade un comentario
documentando la dependencia para la siguiente iteración de refactorización.

### Cambios aplicados

| Archivo | Acción | Razón |
|---|---|---|
| `Dashboard.jsx` + `Dashboard.scss` | Eliminados | Placeholder vacío, sin referencias |
| `NotFound.jsx` | Eliminado | Duplicado de `errors/NotFound`, sin referencias |
| `Settings.jsx` | Eliminado | Placeholder vacío, sin referencias |
| `Home.jsx` | Comentario añadido | Tiene dependiente real: `src/app/App.jsx` |
| `Profile.jsx` | Nota añadida | 137 líneas de lógica real, pendiente de consolidar |

`git diff --stat`: 6 files changed, 13 insertions(+), 95 deletions(-)

---

## Verificación final — todas las FASES completadas

```bash
npx jest --no-coverage
Test Suites: 250 passed, 250 total
Tests:       2377 passed, 0 failed
```

### Estado de deuda técnica por DT

| DT | Descripción | Estado |
|---|---|---|
| DT-UI-001 | Bug runtime AlertConfig (2 bugs) | Resuelto FASE 1 |
| DT-UI-009 | AlertConfig sin tests | Resuelto FASE 1 |
| DT-UI-002 | catch vacíos en 3 reportes | Resuelto FASE 2 |
| DT-UI-004 | buildShareUrl duplicada | Resuelto FASE 2 |
| DT-UI-005 | navigation slice huérfano | Resuelto FASE 3 |
| DT-UI-006 | userInfo hardcodeado | Resuelto FASE 3 |
| DT-UI-003 | catch vacíos mockInterceptor | Resuelto FASE 4 |
| DT-UI-007 | loggerMiddleware sin guard | Resuelto FASE 4 |
| DT-UI-008 | withLogging sin guard | Resuelto FASE 4 |
| DT-UI-010 | Páginas placeholder huérfanas | Resuelto FASE 8 (3 de 4) |
| W-001 | react/prop-types ~200 warnings | Resuelto FASE 5 |
| W-002 | no-unused-vars ~30 warnings | Resuelto FASE 6 |
| W-003 | exhaustive-deps 17 casos | Resuelto FASE 7 |
| W-004 | no-console ~30 instancias | Resuelto FASE 4 |

**Deuda técnica residual:** Home.jsx pendiente de consolidar con
`src/app/App.jsx` — requiere decisión de arquitectura sobre el sistema paralelo.

---

*Generado: 2026-05-16T15:40:46 | Commits: 92042ad, 86d0dbb | Suite: 2377 passed*
