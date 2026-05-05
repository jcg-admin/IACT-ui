```yaml
type: Registro de Deuda Técnica
project: IACT-UI
version: 1.0
updated_at: 2026-05-05 (sesión 2)
```

# Deuda Técnica — IACT-UI

## Alta prioridad

### TD-001 — 37 test suites fallando por paths incorrectos
- **Origen:** Merge con `develop`
- **Síntoma:** Tests en `__tests__/` y `tests/` importan rutas que no existen
  - Ejemplo: `common/Sidebar/SidebarNav` → archivo en `navigation/Sidebar/SidebarNav.jsx`
  - Ejemplo: `@hooks/useJobs` → archivo en `src/hooks/domain/useJobs.js`
- **Impacto:** 37 suites no corren, cobertura global artificialmente baja
- **Acción:** Corregir imports o reorganizar estructura de directorios

### TD-002 — Sin `tsconfig.json`
- **Origen:** TypeScript añadido via Babel sin configuración de TS
- **Síntoma:** No hay type-checking real; errores de tipos pasan silenciosos
- **Impacto:** Los archivos `.ts`/`.tsx` no tienen verificación estática
- **Acción:** Crear `tsconfig.json` con `strict: true` e integrar `tsc --noEmit` en CI

## Media prioridad

### TD-003 — 4 vulnerabilidades moderadas restantes
- **Paquetes:** `jest-environment-jsdom` (< 30), `webpack-dev-server` (uuid interno)
- **Motivo no resuelto:** Requieren `npm audit fix --force` con cambios breaking
- **Acción:** Evaluar upgrade a `jest-environment-jsdom@30` en ventana de mantenimiento

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

### TD-006 — ESLint versión 8 (EOL)
- **Síntoma:** ESLint 8 fue declarado EOL. La versión actual es 9 con flat config.
- **Impacto:** Sin actualizaciones de seguridad para el linter
- **Acción:** Migrar a ESLint 9 con `eslint.config.js` (flat config)

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
| ✅ | TD-005 — Routing sin implementar | RESUELTO — AppRouter completo con lazy imports reales |
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
