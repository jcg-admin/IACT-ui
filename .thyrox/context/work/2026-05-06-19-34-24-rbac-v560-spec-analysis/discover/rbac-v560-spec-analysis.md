```yml
project: IACT-UI
work_package: 2026-05-06-19-34-24-rbac-v560-spec-analysis
created_at: 2026-05-06 19:34:24
current_phase: Phase 1 — DISCOVER
status: Activo
author: claude
source_branch: feature/cnst-033-uml-conformance (IACT-docs)
source_commit: c2c61825
```

# WP — Análisis RBAC v5.6.0 para IACT-UI

## Trigger

Nuevo vocabulario canónico RBAC v5.6.0 publicado en
`feature/cnst-033-uml-conformance` (IACT-docs, commit `c2c61825`).
El ejecutor indicó guardar el análisis en un nuevo WP de IACT-UI para
alinear la implementación frontend con la spec actualizada.

## Fuente de datos

- **Rama analizada:** `origin/feature/cnst-033-uml-conformance` (IACT-docs)
- **Último commit:** `c2c61825` — "Mark ARQ_MOD_009/010 + RACI AGR-011/012 reserved (B-10, B-11)"
- **WP upstream clave:** `2026-05-06-09-02-26-rbac-v5-6-0-corpus-alignment` (IACT-docs, cerrado B-1..B-6)
- **Archivos canónicos leídos:**
  - `source/requisitos/reglas-negocio/rbac/catalogo-funciones.rst`
  - `source/requisitos/reglas-negocio/rbac/grupos-funciones.rst`
  - `source/arquitectura-tecnica/rbac/modelo-rbac-iact/resumen.rst`
  - `track/uc-rbac-v5-6-0-corpus-alignment-changelog.md`

---

## 1. Resumen ejecutivo — RBAC v5.6.0

| Métrica | v5.5.0 | v5.6.0 (actual) |
|---------|--------|-----------------|
| Funciones atómicas **activas** | 74 (incluía OPR+SUP) | **64** |
| Funciones **reservadas** (open-closed) | — | **13** |
| Total catálogo declarado | 74 | **77** |
| Módulos **activos** | 11 | **9** |
| Módulos **reservados** | — | 2 |
| Grupos AGR | 12 | 12 (AGR-011/012 reclasificados como RESERVADOS) |
| Reglas SoD | 3 | 3 |

**Conteo verificado por suma del catálogo:**
`4+9+12+4+11+10+4+7+3 = 64` activas + `10+3 = 13` reservadas = **77 total**

---

## 2. Catálogo completo — 64 funciones activas

### 3.1 MOD_Auth (4 funciones)

| Función | Capacidad | UC |
|---------|-----------|-----|
| `view_own_sessions` | `auth:view_own_sessions` | UC-005 |
| `close_user_session` | `auth:close_session` | UC-005 |
| `reset_password` | `auth:reset_password` | UC-003 |
| `view_all_active_sessions` | `auth:view_all_sessions` | UC-005 |

CNST: CNST-001 (no email), CNST-002 (sesión única, timeout 15 min)

### 3.2 MOD_Users (9 funciones)

| Función | Capacidad | UC |
|---------|-----------|-----|
| `create_users` | `users:create` | UC-006 |
| `update_users` | `users:update` | UC-007 |
| `deactivate_users` | `users:deactivate` | UC-008 |
| `list_users` | `users:list` | UC-009 |
| `search_users` | `users:search` | UC-009 |
| `block_users` | `users:block` | UC-007 |
| `unblock_users` | `users:unblock` | UC-007 |
| `reactivate_users` | `users:reactivate` | UC-007 |
| `view_users` | `users:view` | UC-009 |

CNST: CNST-001 (no email), CNST-005 (bajas lógicas, username autogenerado)

### 3.3 MOD_Access (12 funciones)

| Función | Capacidad | UC |
|---------|-----------|-----|
| `assign_functions` | `access:assign` | UC-010, UC-042 |
| `revoke_functions` | `access:revoke` | UC-010 |
| `view_assignments` | `access:view` | UC-011, UC-044 |
| `assign_function_groups` | `access:assign_group` | UC-010 |
| `view_separation_rules` | `access:view_sod` | UC_ADM_01 |
| `create_function_group` | `access:create_group` | UC_PERM_05 |
| `assign_functions_to_group` | `access:assign_to_group` | UC_PERM_06 |
| `grant_exceptional_permission` | `access:grant_exceptional` | UC_PERM_03 |
| `revoke_exceptional_permission` | `access:revoke_exceptional` | UC_PERM_04 |
| `revoke_function_group` | `access:revoke_group` | UC_PERM_02 |
| `update_separation_rule` | `access:update_sod` | UC_ADM_01 |
| `disable_separation_rule` | `access:disable_sod` | UC_ADM_01 |

CNST: CNST-005 (Flat RBAC, SoD obligatorio); permisos temporales: justificación ≥20 chars, vencimiento máx 6 meses

### 3.4 MOD_Pipeline (4 funciones)

| Función | Capacidad | UC |
|---------|-----------|-----|
| `view_pipeline_status` | `pipeline:view_status` | UC-050 |
| `view_pipeline_errors` | `pipeline:view_errors` | UC-051 |
| `view_data_availability` | `pipeline:availability` | UC-052 |
| `request_pipeline_retry` | `pipeline:retry` | UC-053 |

CNST: CNST-003 (BD IVR solo lectura, ETL c/6-12h, no real-time)

### 3.5 MOD_Reports (11 funciones) — CORE NEGOCIO

| Función | Capacidad | UC |
|---------|-----------|-----|
| `view_reports` | `reports:view` | UC-017, UC-018, UC-019 |
| `view_dashboard` | `reports:dashboard` | UC-025 |
| `filter_reports` | `reports:filter` | UC-020, UC-021 |
| `export_csv` | `reports:export_csv` | UC-022 |
| `export_excel` | `reports:export_excel` | UC-023 |
| `export_pdf` | `reports:export_pdf` | UC-024 |
| `view_kpis` | `reports:kpis` | UC-025 |
| `view_charts` | `reports:charts` | UC-027, UC-028, UC-029 |
| `schedule_report` | `reports:schedule` | UC_RPT_07 |
| `save_view` | `reports:save_view` | UC_RPT_10 |
| `share_report` | `reports:share` | UC_RPT_11 |

Límites exportación: CSV 100K, Excel 50K, PDF 10K
CNST: CNST-003 (datos desfasados 6-12h), CNST-006 (rango máx 2 años), CNST-007 (throttling)

### 3.6 MOD_Alerts (10 funciones)

| Función | Capacidad | UC |
|---------|-----------|-----|
| `view_alerts` | `alerts:view` | UC-039 |
| `configure_alerts` | `alerts:configure` | UC-036 |
| `configure_team_alerts` | `alerts:config_team` | UC-040 |
| `pause_alerts` | `alerts:pause` | UC-038 |
| `disable_alerts` | `alerts:disable` | UC-038 |
| `view_alert_history` | `alerts:history` | UC-039 |
| `acknowledge_alert` | `alerts:acknowledge` | uc-alr-03 |
| `subscribe_to_alert` | `alerts:subscribe` | uc-alr-05 |
| `unsubscribe_from_alert` | `alerts:unsubscribe` | uc-alr-05 |
| `configure_subscription_severity` | `alerts:config_severity` | uc-alr-05 |

CNST: CNST-001 (no email), CNST-004 (máx 50 destinatarios)

### 3.7 MOD_Audit (4 funciones)

| Función | Capacidad | UC |
|---------|-----------|-----|
| `view_audit_log` | `audit:view` | UC-061 |
| `search_audit_log` | `audit:search` | UC-061 |
| `export_audit_log` | `audit:export` | UC-063 |
| `generate_compliance_report` | `audit:compliance` | UC-062 |

CNST: CNST-008 (registros inmutables, retención ≥2 años, checksum SHA-256)

### 3.8 MOD_Logs (7 funciones)

| Función | Capacidad | UC |
|---------|-----------|-----|
| `view_application_logs` | `logs:view_app` | uc-log-01 |
| `export_logs` | `logs:export` | uc-log-04 |
| `search_logs` | `logs:search` | uc-log-03 |
| `view_pipeline_logs` | `logs:view_etl` | uc-log-02 |
| `view_infrastructure_logs` | `logs:view_infra` | uc-log-05 |
| `view_system_health` | `logs:view_health` | uc-log-06 |
| `view_technical_metrics` | `logs:view_metrics` | uc-log-07 |

CNST: CNST-008 (sin PII, JSON estructurado, retención 30-90d)
Diferencia con MOD_Audit: MOD_Audit = eventos de negocio; MOD_Logs = eventos técnicos.

### 3.11 MOD_Admin (3 funciones) — NUEVO v5.6.0

| Función | Capacidad | UC |
|---------|-----------|-----|
| `create_separation_rule` | `adm:create_sod` | UC_ADM_01 |
| `manage_function_catalog` | `adm:manage_catalog` | UC_ADM_02 |
| `assign_functions_to_group` | `access:assign_to_group` | UC_ADM_03, UC_PERM_06 |

Actor: `system_admin` (AGR-010). Audita eventos de alta criticidad.
CNST: CNST-029 (RBAC Flat), BR-007 (SoD — par de conjuntos válidos).

---

## 3. Catálogo de grupos — 12 AGRs

| ID | Nombre | Funciones | Actor típico |
|----|--------|-----------|--------------|
| AGR-001 | `basic_operator_group` | 6 | Operador |
| AGR-002 | `report_viewer_group` | 8 | Analista |
| AGR-003 | `quality_supervisor_group` | 11 | Supervisor |
| AGR-004 | `data_exporter_group` | 14 | Data Analyst |
| AGR-005 | `alert_manager_group` | 6 | Gestor Alertas |
| AGR-006 | `user_admin_group` | 9 | Admin Usuarios |
| AGR-007 | `permission_admin_group` | 5 | Admin Permisos |
| AGR-008 | `auditor_group` | 4 | Auditor |
| AGR-009 | `pipeline_admin_group` | 4 | Admin Pipeline |
| AGR-010 | `system_admin_group` | 6 | Sysadmin |
| AGR-011 **RESERVADO v5.6.0** | `call_center_operator_group` | 10 (open-closed) | Agente |
| AGR-012 **RESERVADO v5.6.0** | `call_center_supervisor_group` | 3+AGR-003 (open-closed) | Supervisor CC |

### Composición de grupos activos

**AGR-001 basic_operator_group (6):**
`view_own_sessions`, `view_all_active_sessions`, `view_reports`,
`view_dashboard`, `view_kpis`, `view_charts`

**AGR-002 report_viewer_group (8):**
Todas de AGR-001 + `filter_reports`, `view_users`

**AGR-003 quality_supervisor_group (11):**
Todas de AGR-002 + `view_alerts`, `configure_alerts`, `view_alert_history`

**AGR-004 data_exporter_group (14):**
Todas de AGR-003 + `export_csv`, `export_excel`, `export_pdf`

**AGR-005 alert_manager_group (6):**
`view_alerts`, `configure_alerts`, `configure_team_alerts`,
`pause_alerts`, `disable_alerts`, `view_alert_history`

**AGR-006 user_admin_group (9):**
`create_users`, `update_users`, `deactivate_users`, `list_users`,
`search_users`, `block_users`, `unblock_users`, `reactivate_users`, `view_users`
SoD: NO puede combinarse con AGR-008.

**AGR-007 permission_admin_group (5):**
`assign_functions`, `revoke_functions`, `view_assignments`,
`assign_function_groups`, `view_separation_rules`
SoD: NO puede combinarse con AGR-008.

**AGR-008 auditor_group (4):**
`view_audit_log`, `search_audit_log`, `export_audit_log`, `generate_compliance_report`
SoD CRÍTICA: NO puede combinarse con AGR-006, AGR-007, AGR-009.

**AGR-009 pipeline_admin_group (4):**
`view_pipeline_status`, `view_pipeline_errors`, `view_data_availability`, `request_pipeline_retry`
SoD: NO puede combinarse con AGR-008.

**AGR-010 system_admin_group (6):**
`view_own_sessions`, `close_user_session`, `reset_password`,
`view_all_active_sessions`, `view_application_logs`, `export_logs`

---

## 4. Reglas SoD (3 — sin cambios en v5.6.0)

| Regla | Conjuntos mutuamente excluyentes |
|-------|----------------------------------|
| SOD-001 | AGR-006 (user_admin) ⊥ AGR-008 (auditor) |
| SOD-002 | AGR-007 (permission_admin) ⊥ AGR-008 (auditor) |
| SOD-003 | AGR-009 (pipeline_admin) ⊥ AGR-008 (auditor) |

Nombres canonicos en inglés (sin prefijo `sod_`):
`pipeline_audit_separation`, etc.

---

## 5. Cambios clave v5.5.0 → v5.6.0

### Cambio 1: MOD_Admin NUEVO (3 funciones)

- `create_separation_rule` (ADM-001) — extiende ciclo de vida SoD completo
- `manage_function_catalog` (ADM-002) — CRUD de definiciones de funciones
- `assign_functions_to_group` (ADM-003) — reutilizada de MOD_Permissions
  con scope extendido a `system_admin`

### Cambio 2: MOD_Operator + MOD_Supervision → RESERVADOS open-closed

10+3 = 13 funciones permanecen en el catálogo pero son out-of-scope para
esta release. AGR-011 y AGR-012 reclasificados como RESERVADOS.

**Impacto en número "activo":** 74 → 64 (no es una reducción real — es
re-clasificación de scope).

### Cambio 3: Corpus IACT-docs actualizado (6 batches)

6 zonas actualizadas (B-1..B-6): RBAC canónico, reglas de negocio, base
cognitiva (11 archivos de frontmatter), arquitectura técnica (8 archivos),
backend ADRs + normativa (7 archivos), metodología + UCs (6 archivos).
Verificado: `grep -rniE "RBAC v5.5.0|74 funciones" source/` → 0 ocurrencias.

---

## 6. Cambios del corpus en cnst-033 relevantes para IACT-UI

Además de la alineación RBAC v5.6.0, el branch contiene:

### STD-013 REST API Conventions (nuevo estándar)
Documentado en `normativa/estandares/std-013-rest-api-conventions.rst`.
Confirma las convenciones aplicadas en IACT-UI:
- Kebab-case en paths (✅ ya aplicado: `/access/separation-rules`)
- No acrónimos (✅ ya aplicado: `sod-rules` → `separation-rules`)

### Spanish class names audit completado
WP `2026-05-06-06-32-20-spanish-class-names-corpus-audit` — 147 class
violations corregidas a 0. STD-008 bumpeado a v1.3.0.
**Impacto en UI:** los nombres de clases/entidades en specs son ahora
100% inglés — los names en el código IACT-UI deben seguir el mismo patrón.

### UC_RPT stored procedures alignment
WP `2026-05-06-08-04-31-uc-rpt-stored-procedures-alignment` — diagnóstico
que identificó que UC_RPT_01/13/15/16/17 describen `cursor.callproc(sp_rpt_*)`.
Los `reportsService` en IACT-UI que consuman estos UCs deben conocer que el
backend llama SPs legacy, no ORM.

---

## 7. Gaps identificados — IACT-UI vs spec v5.6.0

### G-01: `permissions.json` — MOD_Admin ausente

El nuevo MOD_Admin (3 funciones: `create_separation_rule`,
`manage_function_catalog`, `assign_functions_to_group` con scope `adm:`)
no está representado en `src/mocks/permissions.json`. Las funciones
del módulo admin necesitan su propia entrada.

### G-02: `FunctionCatalog.js` — 64 vs total declarado

Verificar si `FunctionCatalog.js` refleja 64 funciones activas con
notación `{modulo}:{accion}` (ej. `reports:view`, `access:assign`).
MOD_Operator y MOD_Supervision deben estar marcados como `RESERVADO`
o simplemente ausentes del catálogo activo.

### G-03: AGR-011/012 en mock state

El mock state en tests/interceptors podría tener AGR-011/AGR-012 como
grupos activos. Deben estar marcados como reservados o excluidos.

### G-04: Notación de capacidades

La spec v5.6.0 usa `{modulo}:{accion}` (ej. `reports:view`, `adm:create_sod`).
Verificar que la capa de RBAC en IACT-UI (`PermissionGate.tsx`,
`accessSlice`, mock) usa esta notación y no variantes previas.

---

## 8. Stopping points

- **SP-01** (gate humano, este): framing del análisis + gaps identificados.
  El ejecutor decide si proceder a Phase 8 (task plan) o solo usar como referencia.
