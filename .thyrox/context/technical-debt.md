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

## Deuda de Naming Sistémica — TD-NM-001..006

> Registrada en WP `2026-05-08-01-05-10-dashboard-cleanup-naming-conventions` (HAL-6).
> Estas violaciones son **sistémicas** — afectan decenas de archivos cada una.
> Resueltas parcialmente: HAL-1..5 ejecutados. HAL-6 aplazado por volumen.
> Próximo WP dedicado a renames sistémicos.

### TD-NM-001 — 56 archivos `*Page.jsx` con sufijo prohibido

- **Scope:** `src/components/pages/**/*Page.jsx` + `src/pages/**/*Page.jsx`
- **Referencia:** frontend naming doc §1.2 — sufijo `Page` prohibido
- **Rename destino:** `{Noun}{Verb}.jsx` o `{Domain}{Role}.jsx`
- **Ejemplos:** `UserManagementPage.jsx` → `UserManagement.jsx` (ya correcto); `LogsPage.jsx` → `Logs.jsx`
- **Impacto:** Sin comportamiento — solo naming; require actualizacion de imports y router

### TD-NM-002 — 16 archivos `*Slice.js` con sufijo prohibido

- **Scope:** `src/redux/slices/**/*Slice.js`
- **Referencia:** frontend naming doc §3.1 — sufijo `Slice` prohibido (es un detalle de implementacion RTK)
- **Rename destino:** nombre del dominio que gestiona: `reportsSlice.js` → `reports.js`
- **Impacto:** Requiere actualizar todos los imports del slice y tests; riesgo medio

### TD-NM-003 — 20 archivos `*Service.js` con sufijo prohibido

- **Scope:** `src/services/**/*Service.js`
- **Referencia:** frontend naming doc §6.2 — sufijo `Service` prohibido en logic files
- **Rename destino:** gateway, client, api segun responsabilidad: `accessService.js` → `accessGateway.js`
- **Impacto:** Actualizar imports en slices y componentes; riesgo medio

### TD-NM-004 — 8 aliases Webpack con nombres tecnicos

- **Scope:** `webpack.config.js` aliases: `@components`, `@utils`, `@services`, `@redux`, `@hooks`, `@mocks`, `@pages`, `@facades`
- **Referencia:** frontend naming doc §9.2 — aliases deben ser nombres de dominio
- **Rename destino:** `@ui` (components), `@shared` (utils), `@api` (services), `@state` (redux)
- **Impacto:** ALTO — requiere actualizar todos los imports en todo el proyecto; 500+ referencias estimadas

### TD-NM-005 — Hooks con nombres tecnicos en lugar de dominio

- **Scope:** `useAuth`, `useAPI`, `useWebSocket`, `useJobPolling`, `useAlertPolling`
- **Referencia:** frontend naming doc §2.2 — hooks deben expresar dominio, no tecnologia
- **Ejemplos destino:** `useAuth` → `useIdentity`, `useAPI` → `useRequest`, `useWebSocket` → `useRealTimeChannel`
- **Impacto:** Medio — actualizar consumidores de cada hook

### TD-NM-006 — Acronimos en identifiers (`Auth`, `API`, `RBAC`, `SoD`, `ETL`)

- **Scope:** Disperso en todo el proyecto — clase names, function names, variable names
- **Referencia:** frontend naming doc §7 — acronimos prohibidos en identifiers
- **Ejemplos destino:** `UserAuth` → `UserIdentity`, `useAPI` → `useRequest`, `RBACPermissions` → `RolePermissions`
- **Impacto:** Medio-alto — disperso, requiere grep sistematico por acronimo
