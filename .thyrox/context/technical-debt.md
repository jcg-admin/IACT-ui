```yaml
type: Registro de Deuda Técnica
project: IACT-UI
version: 1.0
updated_at: 2026-05-05
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

### TD-ACC-01..05 — URLs con verbos en paths (módulo access)

- **Origen:** Diseño inicial sin aplicar convenciones REST/OAS3
- **Síntoma:** Verbos como path segments en lugar de HTTP methods:
  - `POST /access/functions/assign` → debe ser `POST /access/function-assignments`
  - `POST /access/functions/revoke` → debe ser `DELETE /access/function-assignments/{id}`
  - `POST /access/audit/export` → debe ser `POST /access/audit-exports`
  - `POST /access/function-groups/assign` → debe ser `POST /access/function-group-assignments`
  - `POST /access/segments/assign` → debe ser `POST /access/segment-assignments`
- **Impacto:** Inconsistencia con OAS3 + naming standard; dificulta generación de cliente desde OpenAPI spec
- **Acción:** Coordinar con equipo backend antes de cambiar — requiere cambio en ambos lados
- **Referencia:** `docs/guides/rest-api-conventions.md` tabla "Mapa de URLs correctas"
- **NO resuelto:** `POST /access/validate-sod` → ya corregido a `POST /access/separation-rules/validate`
