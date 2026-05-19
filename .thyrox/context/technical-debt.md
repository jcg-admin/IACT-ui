```yaml
type: Registro de Deuda Técnica
project: IACT-UI
version: 1.0
updated_at: 2026-05-08 05:30:00
```

# Deuda Técnica — IACT-UI

## Alta prioridad

### ~~TD-001~~ — RESUELTO — 37 test suites fallando por paths incorrectos
- **Estado:** Resuelto en sesiones anteriores. 110/110 suites GREEN.

### ~~TD-002~~ — RESUELTO — Sin `tsconfig.json`
- **Estado:** `tsconfig.json` creado con strict:true, @types/react/@types/node instalados,
  errores de tipo corregidos en permisos-client.ts y api.config.ts. `npm run type-check` → 0 errores.

## Media prioridad

### ~~TD-003~~ — RESUELTO — vulnerabilidades npm moderadas
- **Estado:** `npm audit` retorna 0 vulnerabilidades (verificado 2026-05-06).
  Todas las dependencias están en versiones limpias.

### TD-004 — Redux slice duplicado (`homeSlice.js`)
- **Ubicaciones:**
  - `src/state/slices/homeSlice.js`
  - `src/modules/home/state/homeSlice.js`
- **Impacto:** Confusión sobre cuál es la fuente de verdad
- **Acción:** Consolidar en una ubicación y eliminar el duplicado

### TD-005 — Routing sin implementar
- **Síntoma:** `react-router-dom@6` está en dependencies pero no hay rutas
  definidas en el código visible. Solo `HomePage` sin rutas.
- **Impacto:** La navegación multi-página no funciona todavía
- **Acción:** Definir estructura de rutas con `BrowserRouter` + `Routes`

### ~~TD-006~~ — RESUELTO — ESLint ya en v9 con flat config
- **Estado:** ESLint 9.39.4 instalado. `eslint.config.mjs` (flat config) ya existe
  y está activo (verificado 2026-05-06). El registro estaba desactualizado.

## Baja prioridad

### TD-007 — `no-console` warnings en hooks TypeScript
- **Archivos:** `usePermisos.ts` (7 warnings), `permisos-client.ts` (1 warning)
- **Acción:** Reemplazar `console.log` por un logger estructurado o eliminar

### TD-008 — `react/prop-types` warning en test
- **Archivo:** `src/hooks/useHealthStatus.test.js:21`
- **Acción:** Añadir displayName o tipado al componente wrapper del test

## Resuelto en sesión 2026-05-05

| ID | Descripción | Resultado |
|----|------------|-----------|
| ✅ | `permissions.json` sin campo `icono` — 2 test suites fallando | RESUELTO |
| ✅ | ESLint sin configuración | RESUELTO |
| ✅ | TypeScript sin soporte Babel/Jest | RESUELTO |
| ✅ | 23 vulnerabilidades (9 altas) | RESUELTO → 4 moderadas |
| ✅ | `useEffect` condicional (Rules of Hooks) | RESUELTO |
| ✅ | Cobertura < 80% | RESUELTO → 80%+ |
| ✅ | `coverage/` no en `.gitignore` | RESUELTO |
| ✅ | Configs duplicadas del merge | RESUELTO |
| ✅ | TD-005 — Routing sin implementar | RESUELTO — AppRouter completo; todas las páginas implementadas |
| ✅ | TD-007 — `no-console` warnings en hooks TS | RESUELTO — ESLint permite console.error/warn |
| ✅ | TD-008 — `react/prop-types` en test | RESUELTO — prop-types desactivado en test files |
| ✅ | TD-004 — Redux slice duplicado | NO APLICA — src/state/slices/homeSlice.js no existe; solo hay 1 homeSlice en modules/ |
| ✅ | reportsSlice/dashboardSlice/errorSlice no registrados | RESUELTO — 3 slices agregados a src/redux/store.js |
| ✅ | webpack entry apuntaba a index.jsx (legacy) | RESUELTO — cambiado a index.js (app completa) |
| ✅ | store.js.backup anti-pattern | RESUELTO — eliminado |
| ✅ | TD-ACC-01..04 — URLs incorrectas en accessService | RESUELTO — URLs canónicas implementadas |

### TD-ACC-01..05 — URLs incorrrrectas en accessService.js (REVISADO)

- **Origen:** Diseño inicial sin referencia a los documentos de arquitectura IACT
- **Análisis:** Revisado contra `/tmp/references/IACT-docs/source/` en WP sprint2-completion-reports
- **Hallazgo:** La API IACT es **user-centric** (`/api/users/{id}/...`), no `/api/access/...`
- **URLs canónicas (PROVEN):**

| TD | URL actual (incorrecta) | URL canónica (IACT-docs) | Fuente |
|----|------------------------|--------------------------|--------|
| ACC-01 | `POST /access/functions/assign` | `POST /users/{id}/functions/` | UC-ACC-01 seq diagram |
| ACC-02 | `POST /access/functions/revoke` | `DELETE /users/{id}/functions/` | UC-ACC-02 seq diagram |
| ACC-03 | `POST /access/audit/export` | `POST /audit/export/` (async, 202+job_id) | UC-AUD-03 spec |
| ACC-04 | `POST /access/function-groups/assign` | `POST /users/{id}/access-groups/` | UC-ACC-04 seq diagram |
| ACC-05 | `POST /access/segments/assign` | `POST /users/{id}/segments/` | INFERRED |

- **Cambios adicionales descubiertos:**
  - ACC-01: body cambia a `{function_ids: [], expires_at}` (bulk, plural)
  - ACC-02: body cambia a `{function_ids: [], revoke_reason}` (bulk + razón requerida)
  - ACC-03: respuesta es `202 + {job_id}` no un blob (export es async)
  - ACC-04: recurso se llama `access-groups` (AGR), no `function-groups`
- **Acción:** Implementar en WP `2026-05-05-17-08-27-sprint2-completion-reports`
- **Referencia análisis:** `context/work/2026-05-05-17-08-27-sprint2-completion-reports/discover/api-url-debt-analysis.md`

---

## Deuda de Naming Sistémica — TD-NM-001..006 ✓ RESUELTA

> Resuelta en WP `2026-05-08-01-31-21-systemic-naming-violations`.
> 6 commits. 1799 tests, 0 regressions.

- TD-NM-001 ✓ — 57 archivos `*Page.jsx` renombrados (Page suffix eliminado)
- TD-NM-002 ✓ — 17 archivos `*Slice.js` renombrados (Slice suffix eliminado)
- TD-NM-003 ✓ — 20 archivos `*Service.js` renombrados (→Gateway/Client/dominio)
- TD-NM-004 ✓ — 5 aliases Webpack renombrados (@components→@ui, @services→@api, @redux→@store, @utils→@shared, @pages→@screens)
- TD-NM-005 ✓ — 5 hooks renombrados (useAuth→useIdentity, useAPI→useRequest, etc.)
- TD-NM-006 ✓ — UserAuth→UserIdentity, APIError→HttpError, handleAPIError→handleHttpError
