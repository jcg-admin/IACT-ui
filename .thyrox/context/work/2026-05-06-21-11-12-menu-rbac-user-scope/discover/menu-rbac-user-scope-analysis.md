```yml
created_at: 2026-05-06 21:11:12
project: IACT-ui
work_package: 2026-05-06-21-11-12-menu-rbac-user-scope
phase: Phase 1 — DISCOVER
author: claude
status: Borrador
version: 1.0.0
```

# Análisis — Menú de navegación por usuario (RBAC v5.6.0)

## 1. Arquitectura actual del menú

### 1.1 Dos sistemas de menú en paralelo (PROVEN)

| Sistema | Componente | Fuente de datos | Filtrado | Estado |
|---------|-----------|-----------------|---------|--------|
| **Legacy** | `MainLayout.jsx` | `/api/v1/permissions` → `funciones_accesibles[]` | Por `menuEntries` normalizados | Activo (usado en landing/legacy pages) |
| **Actual** | `AppRouter.jsx` → `Sidebar.jsx` | `/api/permisos/verificar/{id}/capacidades/` → `capacidades[]` | `hasPermission(link.permission)` | Activo (usado en dashboard routes) |

Ambos sistemas leen de `permissions.json` en modo mock, pero usan **campos distintos**:
- Legacy: `funciones_accesibles` → `menuEntries` (array de objetos descriptivos)
- Actual: `capacidades` → filtro booleano sobre `ALL_NAV_LINKS` hardcodeado

### 1.2 Flujo del sistema actual (AppRouter)

```
AppRouter.jsx:136 — useFilteredNavLinks()
    └── usePermisos() [hooks/usePermisos.ts:83]
         └── PermisosClient.getCapacidades(userId) [lib/permisos-client.ts:231]
              └── GET /api/permisos/verificar/{userId}/capacidades/
                   └── [MOCK: NO EXISTE HANDLER] ← CRÍTICO
```

**Implication:** En modo mock, `getCapacidades()` hace fetch a un endpoint sin handler.
Si el interceptor devuelve 404/error → `capacidades = []` → `hasPermission()` siempre
`false` → `ALL_NAV_LINKS.filter(...)` = `[]` → sidebar vacío.

Durante la carga inicial: `loading = true` → se muestra solo `[Dashboard]`
(línea 138 de AppRouter: `return ALL_NAV_LINKS.slice(0, 1)`).

### 1.3 ALL_NAV_LINKS — estructura hardcoded (PROVEN)

`src/router/AppRouter.jsx:124-134` — 9 ítems fijos:

| id | label | permission (FunctionCatalog) | capacidad |
|----|-------|------------------------------|-----------|
| 1 | Dashboard | VIEW_DASHBOARD | `reports:dashboard` |
| 2 | Usuarios | VIEW_USERS | `users:view` |
| 3 | Reportes | VIEW_REPORTS | `reports:view` |
| 4 | Acceso | VIEW_ACCESS | `access:view` |
| 5 | Auditoría | VIEW_AUDIT | `audit:view` |
| 6 | Alertas | VIEW_ALERTS | `alerts:view` |
| 7 | Logs | VIEW_LOGS | `logs:view_app` |
| 8 | Admin | MANAGE_CATALOG | `adm:manage_catalog` |
| 9 | Ajustes | VIEW_OWN_SESSIONS | `auth:view_own_sessions` |

---

## 2. Matriz menú × AGR esperada (RBAC v5.6.0)

Derivada del catálogo de grupos en `rbac-v560-spec-analysis.md` sección 3.

### Cálculo de visibilidad por AGR

Regla: un ítem de menú se muestra si la `capacidad` está en las funciones del AGR.

| Ítem menú | capacidad requerida | AGR-001 | AGR-002 | AGR-003 | AGR-004 | AGR-005 | AGR-006 | AGR-007 | AGR-008 | AGR-009 | AGR-010 |
|-----------|---------------------|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|
| Dashboard | `reports:dashboard` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Usuarios | `users:view` | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Reportes | `reports:view` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Acceso | `access:view` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Auditoría | `audit:view` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Alertas | `alerts:view` | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Logs | `logs:view_app` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Admin | `adm:manage_catalog` | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Ajustes | `auth:view_own_sessions` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Nota:** `adm:manage_catalog` NO está en ningún AGR estándar — MOD_Admin pertenece
a un acceso directo de sistema, no modelado como AGR visible en el menú. La ruta
`/admin/functions` solo sería accesible con una asignación directa o AGR especial
de sysadmin extendido (no definido en v5.6.0).

### Menú esperado por AGR (resumen)

| AGR | Ítems visibles |
|-----|---------------|
| AGR-001 (basic_operator_group) | Dashboard, Reportes, Ajustes |
| AGR-002 (report_viewer_group) | Dashboard, Usuarios, Reportes, Ajustes |
| AGR-003 (quality_supervisor_group) | Dashboard, Usuarios, Reportes, Alertas, Ajustes |
| AGR-004 (data_exporter_group) | Dashboard, Usuarios, Reportes, Alertas, Ajustes |
| AGR-005 (alert_manager_group) | Alertas |
| AGR-006 (user_admin_group) | Usuarios |
| AGR-007 (permission_admin_group) | Acceso |
| AGR-008 (auditor_group) | Auditoría |
| AGR-009 (pipeline_admin_group) | (ninguno — no tiene capacidades con nav item) |
| AGR-010 (system_admin_group) | Logs, Ajustes |

**Problemas detectados:**
- **AGR-005** (alert_manager_group): solo muestra "Alertas" sin "Ajustes" porque
  AGR-005 no incluye `auth:view_own_sessions`. Usuario no puede acceder a sus propias
  sesiones. Posible gap de diseño de AGR en spec.
- **AGR-006, AGR-007, AGR-008**: menú de un solo ítem — muy limitado para trabajo diario.
- **AGR-009**: menú vacío — `pipeline:view_status` no es nav item. Pipeline admin
  no tiene acceso al menú sin items adicionales. Gap arquitectónico.
- **Admin route** (`/admin/*`): accesible vía URL directa si el usuario tiene
  `adm:manage_catalog` pero no aparece en el menú de nadie según el modelo actual.

---

## 3. Gaps identificados

| ID | Severidad | Descripción |
|----|-----------|-------------|
| G-M1 | **CRÍTICO** | `/api/permisos/verificar/{userId}/capacidades/` sin handler en `mockInterceptor.js`. En mock, el menú nunca filtra correctamente — el sidebar queda vacío o con solo "Dashboard" (loading fallback). |
| G-M2 | **Alta** | Dos sistemas de menú paralelos (`MainLayout` legacy vs `AppRouter` actual) consumen fuentes diferentes (`funciones_accesibles` vs `capacidades`). Riesgo de inconsistencia — cambios en mock afectan solo uno. |
| G-M3 | **Alta** | `adm:manage_catalog` no está en ningún AGR → la sección "Admin" del menú nunca aparece para ningún usuario. El acceso a `/admin/functions` y `/admin/groups` solo funciona si el usuario navega directamente a la URL. |
| G-M4 | Media | AGR-009 (pipeline_admin_group) tiene menú vacío — `pipeline:view_status` no tiene nav item. El admin de pipeline no puede navegar a ninguna sección desde el sidebar. |
| G-M5 | Media | AGR-005 (alert_manager_group) no tiene `auth:view_own_sessions` → no ve "Ajustes". Usuario no puede gestionar su propia sesión. |
| G-M6 | Media | `funciones_accesibles` en `permissions.json` NO es consumido por el menú actual (AppRouter/Sidebar). Solo lo usa el sistema legacy (MainLayout). El campo existe en el mock pero no afecta al menú que ve el usuario en el dashboard. |
| G-M7 | Baja | El orden del menú en `ALL_NAV_LINKS` es hardcoded. El campo `orden_menu` de `funciones_accesibles` se ignora completamente. No hay forma de reordenar el menú desde el backend sin cambiar código. |
| G-M8 | Baja | No hay escenario de mock para usuario con múltiples AGRs (ej: AGR-004 + AGR-008 violando SoD). El mock solo tiene AGR-002+AGR-004. |
| G-M9 | Baja | `ALL_NAV_LINKS` carece de sub-menús. MOD_Reports tiene 11 rutas pero solo 1 ítem en el menú. Sub-rutas (`/reports/agents`, `/reports/saved`, etc.) son inaccesibles desde el sidebar. |

---

## 4. Análisis de causa raíz

### G-M1 (endpoint sin mock) — causa raíz

`PermisosClient` fue diseñado para un backend real con endpoint granular
`/api/permisos/verificar/{id}/capacidades/`. El mock interceptor de IACT-ui
opera sobre un conjunto diferente de endpoints (`/api/v1/*` legacy y `/api/admin/*`).
Al migrar el sistema de menú al nuevo AppRouter, no se creó el handler mock
para el nuevo endpoint de permisos.

**Workaround actual (SPECULATIVE):** Posiblemente el sistema en dev usa los
`capacidades` del `permissions.json` via alguna redirección no documentada,
o el `usePermisos` detecta modo test y carga directamente del mock. Requiere
verificación.

### G-M3 (Admin sin AGR) — causa raíz

El catálogo AGR v5.6.0 define AGR-010 (`system_admin_group`) con funciones base
de autenticación y logs, más `adm:manage_catalog` y `adm:create_sod` de MOD_Admin.
Sin embargo, la composición de AGR-010 en `rbac-v560-spec-analysis.md:sección 3.12`
lista: `view_own_sessions`, `close_user_session`, `reset_password`,
`view_all_active_sessions`, `view_application_logs`, `export_logs`.

**MOD_Admin (3 funciones) aparece listado separadamente** — `adm:manage_catalog`
no está en la composición de AGR-010. Es una función sin AGR asignado en el catálogo.
Esto significa que "Admin" nunca aparece en el menú de ningún usuario según el
modelo RBAC v5.6.0 actual — es un acceso de superadmin fuera del modelo AGR.

---

## 5. Stopping Point Manifest

| ID | Descripción | Tipo |
|----|-------------|------|
| SP-01 | Confirmar causa de G-M1: ¿cómo funciona el mock actual para permisos? Verificar en browser dev tools o en código | GATE HUMANO |
| SP-02 | Decisión: ¿corregir G-M3 agregando `adm:manage_catalog` a AGR-010 o crear mecanismo de superadmin? | GATE HUMANO |
| SP-03 | Decisión: ¿sub-menús (G-M9) están en scope para este WP? | GATE HUMANO |

---

## 6. Próximos pasos sugeridos

1. **Verificar G-M1** — ejecutar la app en modo dev, abrir DevTools → Network,
   navegar al dashboard, confirmar si `/api/permisos/verificar/*/capacidades/`
   retorna datos o 404.

2. **Decidir arquitectura** — ¿el menú debe ser:
   (A) Hardcoded `ALL_NAV_LINKS` filtrado por `capacidades` (actual), o
   (B) Dinámico basado en `funciones_accesibles` del backend (legacy), o
   (C) Híbrido: `ALL_NAV_LINKS` como config base, enriquecido con orden del backend

3. **Agregar handler mock** para `/api/permisos/verificar/{userId}/capacidades/`
   que retorne el array `capacidades` de `permissions.json`.

4. **Resolver G-M3** — definir qué usuario puede acceder a `/admin/*`.
