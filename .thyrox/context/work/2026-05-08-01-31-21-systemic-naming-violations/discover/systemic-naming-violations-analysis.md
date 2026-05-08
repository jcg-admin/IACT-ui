```yml
created_at: 2026-05-08 05:45:00
project: IACT-UI
work_package: 2026-05-08-01-31-21-systemic-naming-violations
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
version: 1.0.0
```

# Phase 1 DISCOVER — systemic-naming-violations

## 1. Contexto

Este WP ejecuta el scope explícitamente excluido del WP anterior
(`dashboard-cleanup-naming-conventions`). La deuda fue registrada como
TD-NM-001..006 en `technical-debt.md`. El mandato del usuario es "0 deuda técnica".

**Origen:** frontend naming doc (CLEAN_CODE_NAMING_PRINCIPLES companion) prohíbe:
- Sufijos de implementación: `Page`, `Slice`, `Service`, `Container`, `View` en filenames
- Aliases Webpack con nombres técnicos de infraestructura
- Hooks con nombres de tecnología en lugar de dominio
- Acrónimos en identifiers: `Auth`, `API`, `RBAC`, `ETL`

---

## 2. Hallazgos — PROVEN

### HAL-1: 57 archivos `*Page.jsx` (sufijo prohibido)

**PROVEN** — `find src/ -name "*Page.jsx" | wc -l` → **57**

```
src/components/containers/DashboardPage.jsx
src/components/pages/Analytics/AnalyticsDashboardPage.jsx
src/pages/access/AccessAuditPage.jsx
src/pages/alerts/AlertHistoryPage.jsx
... (53 más)
```

Rename destino: descriptivo del contenido sin sufijo `Page`.
**Impacto:** Cada rename requiere actualizar: (a) import en router, (b) import en index.js
del directorio, (c) lazy() import si aplica. Estimado: 2-3 archivos tocados por rename.

### HAL-2: 17 archivos `*Slice.js` (sufijo prohibido)

**PROVEN** — `find src/ -name "*Slice.js" | wc -l` → **17**

Afecta: authSlice, uiSlice, userSlice, sessionSlice, accessSlice, alertsSlice,
auditSlice, formSlice, reportsSlice, errorSlice, adminSlice, logsSlice,
savedFiltersSlice, loadingSlice, + 3 más.

Rename destino: nombre del dominio puro: `authSlice.js` → `auth.js`.
**Impacto ALTO:** Cada slice es importado en store.js + tests + posiblemente páginas.
Estimado 3-5 archivos tocados por rename.

### HAL-3: 20 archivos `*Service.js` (sufijo prohibido)

**PROVEN** — `find src/ -name "*Service.js" | wc -l` → **20**

Afecta: accessService, adminService, alertsService, auditService, etc.
Rename destino: `*Gateway.js` (API clients) o `*Client.js`.
**Impacto ALTO:** Cada service es importado en slices + posiblemente hooks.

### HAL-4: 14 aliases Webpack con nombres técnicos

**PROVEN** — `webpack.config.js` alias block:

```
@app, @modules, @components, @hooks, @state, @services, @mocks,
@styles, @utils, @types, @constants, @pages, @redux, @facades
```

Aliases con nombres técnicos que deberían ser de dominio: `@components`, `@services`,
`@utils`, `@pages`, `@redux`, `@hooks`, `@mocks`.

**374 referencias de alias** en src/ (PROVEN — grep count).

**IMPACTO CRÍTICO:** Cambiar un alias requiere actualizar todos sus usos + jest.config.cjs
moduleNameMapper + webpack.config.js. Este bloque puede producir 100-200 ediciones por alias.

**DECISIÓN DE SCOPE:** HAL-4 es el riesgo más alto. Se recomienda evaluar en Phase 3
si ejecutar alias renames en este WP o diferir a un WP dedicado de infraestructura.

### HAL-5: 5 hooks con nombres técnicos

**PROVEN** — `src/hooks/domain/index.js`:

- `useAuth` → `useIdentity` o `useSession`
- `useAPI` → `useRequest`
- `useWebSocket` → `useRealTimeChannel`
- `useJobPolling` → `useJobStatus`
- `useAlertPolling` → `useAlertFeed`

**Impacto MEDIO:** Cada hook rename requiere actualizar todos los componentes que lo consumen.
Estimado 5-15 consumidores por hook.

### HAL-6: 113 ocurrencias de acrónimos en identifiers

**PROVEN** — grep count de `\bAuth\b|\bAPI\b|\bRBAC\b|\bETL\b|\bSoD\b` en src/ → **113**

Los acrónimos más frecuentes:
- `Auth` (identidad de usuario) → `Identity`
- `API` (capa de acceso HTTP) → `Request` o `Http`
- `RBAC` (modelo de permisos por roles) → `RolePermissions`
- `ETL` (proceso de transformación de datos) → `DataPipeline`

**IMPACTO VARIABLE:** Algunos son internos (class names), otros son exports públicos.
Los exports públicos tienen mayor blast radius.

---

## 3. Priorización y Riesgo

| HAL | Archivos | Refs externas | Riesgo | Prioridad |
|-----|----------|---------------|--------|-----------|
| HAL-1 (Page) | 57 | ~57×3 = 171 | Medio | 2 |
| HAL-2 (Slice) | 17 | ~17×4 = 68 | Medio-Alto | 3 |
| HAL-3 (Service) | 20 | ~20×3 = 60 | Medio-Alto | 3 |
| HAL-4 (Aliases) | 14 | 374 | CRÍTICO | Último |
| HAL-5 (Hooks) | 5 | ~5×10 = 50 | Medio | 1 |
| HAL-6 (Acronyms) | N/A | 113 | Variable | 4 |

**Orden recomendado:** HAL-5 → HAL-1 → HAL-2 → HAL-3 → HAL-6 → HAL-4

**Justificación:** HAL-5 es el más pequeño y clean. HAL-4 (aliases) tiene el mayor blast
radius y debe ser el último porque los renames de HAL-1..3 generarán nuevos imports con
alias actuales — hacerlos antes de cambiar los alias evita doble-edición.

---

## 4. Stopping Point Manifest

| SP | Condición | Tipo |
|----|-----------|------|
| SP-01 | Gate Phase 1 → Phase 8: confirmación del scope de HAL-4 (aliases): ¿ejecutar o diferir? | Humano |
| SP-02 | Gate per-bloque: antes de ejecutar HAL-1 (57 archivos) — confirmar estrategia de rename | Automático si sin regressions |
| SP-03 | `npm test` → 1799+ green después de cada bloque | Técnico |

---

## 5. Exit Conditions

- [ ] EC-01: `find src/ -name "*Page.jsx" | wc -l` → 0
- [ ] EC-02: `find src/ -name "*Slice.js" | wc -l` → 0
- [ ] EC-03: `find src/ -name "*Service.js" | wc -l` → 0
- [ ] EC-04: Hooks técnicos renombrados: `grep -rn "useAuth\|useAPI\|useWebSocket\|useJobPolling\|useAlertPolling" src/ --include="*.js" --include="*.jsx"` → 0 hits (excepto definición y test propios)
- [ ] EC-05: `npm test` → 0 failing
- [ ] EC-06: HAL-4 (aliases): scope aprobado en SP-01

---

## 6. Riesgos

| R | Descripción | Prob | Impacto | Mitigación |
|---|-------------|------|---------|------------|
| R-01 | HAL-4 alias rename produce regresiones en jest.config + webpack | Alta | Alto | Cambiar aliases en un único commit, verificar tests inmediatamente |
| R-02 | Hook rename rompe componentes que importan por nombre | Media | Medio | Grep exhaustivo antes de rename; re-export temporal opcional |
| R-03 | Slice rename confunde dev tools Redux (nombre del slice en store) | Baja | Bajo | Mantener `name:` del slice sin cambio; solo el filename cambia |
| R-04 | Scope creep — 57+17+20 renames se vuelven inmanejables en 1 sesión | Media | Medio | Commits por bloque; parar si test suite roja |
