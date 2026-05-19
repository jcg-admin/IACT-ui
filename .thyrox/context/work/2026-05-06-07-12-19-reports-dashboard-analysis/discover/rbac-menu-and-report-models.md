```yml
created_at: 2026-05-06 07:40:36
project: THYROX
work_package: 2026-05-06-07-12-19-reports-dashboard-analysis
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# RBAC Menu dinámico + Modelos de reportes IVR

Fuente: `/tmp/references/IACT-docs/source/requisitos/`
- `reglas-negocio/rbac/catalogo-funciones.rst`
- `reglas-negocio/rbac/grupos-funciones.rst`
- `casos-uso/reports/uc-rpt-*/datos-involucrados.rst`
- `casos-uso/permissions/uc-perm-08/informacion-general.rst`

---

## 1. Menú dinámico — UC_PERM_08

### 1.1 Estructura del response

El backend retorna una estructura jerárquica basada en las funciones
efectivas del usuario (`effective_set`):

```json
{
  "domains": [
    {
      "code": "reports",
      "label": "Reportes",
      "sections": [
        {
          "code": "ivr",
          "label": "IVR",
          "actions": [
            { "code": "view_reports", "label": "Ver Reportes", "icon": "chart-bar", "path": "/reports" },
            { "code": "view_dashboard", "label": "Dashboard", "icon": "dashboard", "path": "/dashboard" }
          ]
        }
      ]
    }
  ],
  "user_id": "...",
  "generated_at": "2026-05-06T07:40:00Z",
  "cache": { "key": "menu:{user_id}:{locale}", "ttl": 300 }
}
```

### 1.2 Metadata por función (en registro `Function`)

Cada función RBAC tiene campos de menú:

| Campo | Uso |
|-------|-----|
| `menu_visible` | Si aparece en el menú (algunas funciones son internas, no de menú) |
| `menu_domain` | Agrupador de primer nivel (ej: `reports`, `admin`, `pipeline`) |
| `menu_section` | Sub-agrupador (ej: `ivr`, `scheduled`, `users`) |
| `menu_action` | Código de la acción (ej: `view_reports`) |
| `menu_label_es` | Label en español |
| `menu_icon` | Icono (ej: `chart-bar`, `user`, `pipeline`) |
| `menu_order` | Orden de aparición dentro de la sección |

**Regla clave:** El menú OCULTA ítems — NO bloquea acceso.
UC_PERM_07 (`verificar_permiso`) sigue siendo el enforce real en cada request.

### 1.3 Qué ve cada tipo de usuario (por AGR)

| AGR | Nombre | Módulos visibles en menú |
|-----|--------|--------------------------|
| AGR-001 | `basic_operator_group` | Dashboard, Reportes (solo ver), KPIs, Gráficos |
| AGR-002 | `report_viewer_group` | + Filtros de reportes, Ver usuarios |
| AGR-003 | `quality_supervisor_group` | + Alertas (ver, configurar propias) |
| AGR-004 | `data_exporter_group` | + Exportar CSV/Excel/PDF |
| AGR-005 | `alert_manager_group` | Alertas (gestión de equipo completa) |
| AGR-006 | `user_admin_group` | Usuarios (CRUD completo) |
| AGR-007 | `permission_admin_group` | Acceso/RBAC (asignar, revocar, ver SoD) |
| AGR-008 | `auditor_group` | Auditoría (ver, buscar, exportar, compliance) |
| AGR-009 | `pipeline_admin_group` | Pipeline ETL (estado, errores, disponibilidad, reintentar) |
| AGR-010 | `system_admin_group` | Sesiones, Logs de aplicación, Exportar logs |
| AGR-011 | `call_center_operator_group` | Estado agente, Llamadas, Dashboard propio, Historial propio, Buzón |
| AGR-012 | `call_center_supervisor_group` | + Monitor llamadas en vivo, Intervención, Mensajes equipo |

### 1.4 Impacto en IACT-UI

El componente `ProtectedRoute` ya usa `FunctionCatalog` para mostrar/ocultar rutas.
Lo que falta (gap UC_PERM_08):
- No hay un hook `useDynamicMenu()` que consuma `/api/permissions/menu/`
- El sidebar actual hardcodea items — no los genera desde el response del backend
- El cache de menú (TTL 300s, key `menu:{user_id}:{locale}`) no está implementado

---

## 2. Catálogo de funciones RBAC — 73 funciones en 11 módulos

### 2.1 MOD_Reports (11 funciones) — CORE NEGOCIO

| Función | Capacidad | UC | Descripción |
|---------|-----------|-----|-------------|
| `view_reports` | `reports:view` | UC-017..019 | Ve reportes tabulares |
| `view_dashboard` | `reports:dashboard` | UC-025 | Ve dashboard principal |
| `filter_reports` | `reports:filter` | UC-020..021 | Aplica filtros |
| `export_csv` | `reports:export_csv` | UC-022 | CSV (límite 100K registros) |
| `export_excel` | `reports:export_excel` | UC-023 | Excel (límite 50K) |
| `export_pdf` | `reports:export_pdf` | UC-024 | PDF (límite 10K) |
| `view_kpis` | `reports:kpis` | UC-025 | KPIs estáticos |
| `view_charts` | `reports:charts` | UC-027..029 | Gráficos predefinidos |
| `schedule_report` | `reports:schedule` | UC_RPT_07 | Programar reportes |
| `save_view` | `reports:save_view` | UC_RPT_10 | Persistir filtros como vista |
| `share_report` | `reports:share` | UC_RPT_11 | Compartir vía URL/buzón |

### 2.2 MOD_Pipeline (4 funciones)

| Función | Capacidad | UC |
|---------|-----------|-----|
| `view_pipeline_status` | `pipeline:view_status` | UC-050 |
| `view_pipeline_errors` | `pipeline:view_errors` | UC-051 |
| `view_data_availability` | `pipeline:availability` | UC-052 |
| `request_pipeline_retry` | `pipeline:retry` | UC-053 |

### 2.3 Alineación con FunctionCatalog.js actual

La notation actual en `catalog.js` usa `sistema.{domain}.{resource}.{action}`.
La spec usa `{module}:{action}` (ej: `reports:view`).

**No hay conflicto directo** — son capas distintas:
- `FunctionCatalog.js` = constantes para el frontend (no es el valor literal del backend)
- El backend retorna las capacidades en su propio formato

**Gaps detectados en `FunctionCatalog.js`:**
- `save_view` (`reports:save_view`) → NO tiene entrada en FunctionCatalog
- `view_kpis` → NO tiene entrada separada (merged en VIEW_METRICS)
- `view_charts` → NO tiene entrada separada
- `filter_reports` → NO tiene entrada separada

---

## 3. Modelos de datos de reportes IVR — para actualizar mocks

### 3.1 DashboardIVR (uc-rpt-01)

```json
{
  "segmentos_activos": ["nacional_A", "nacional_B", "Puebla"],
  "trimestre_activo": "Q3_25",
  "total_llamadas": 18420,
  "total_abandonadas": 1564,
  "tasa_abandono": 8.49,
  "centros_principales": [
    { "centro": "Servicio_General", "total": 7200 },
    { "centro": "Soporte_Tecnico", "total": 5100 },
    { "centro": "Cobranza", "total": 3800 }
  ]
}
```

Cache: `key = "dashboard:{user_id}:{trimestre}:{segments_hash}"`, TTL 30s,
invalidado por `pipeline_runs.estado = 'exitoso'`.

### 3.2 ReporteHistorico (uc-rpt-03)

```json
{
  "trimestre": "Q3_25",
  "segmento": "nacional_A",
  "total_llamadas": 12300,
  "tasa_abandono": 7.2,
  "centros_principales": [
    { "centro": "Servicio_General", "total": 4800 },
    { "centro": "Soporte_Tecnico", "total": 3200 }
  ],
  "menus_frecuentes": [
    { "menu": "MENU_PRINCIPAL", "total": 9100 },
    { "menu": "MENU_SOPORTE", "total": 2100 }
  ]
}
```

Cache TTL 300s (datos históricos inmutables post-ETL).

### 3.3 ReporteAbandono (uc-rpt-13 → `sp_rpt_llamadas_abandonadas`)

```json
{
  "segmento": "nacional_A",
  "total_llamadas": 12300,
  "abandonadas_vacio": 420,
  "abandonadas_cliente_colgo": 680,
  "abandonadas_sin_opcion": 464,
  "total_abandonadas": 1564,
  "tasa_abandono": 12.72,
  "trimestre": "Q3_25"
}
```

Tipos de abandono (BR_016):
- `VACIO` — llamada sin llegar a ningún menú
- `cliente_colgo` — cliente colgó antes de ser atendido
- `SinOpcion_Cabecera` — menú inicial sin selección

### 3.4 ReporteCentros (uc-rpt-15 → `sp_rpt_centros_transferencia`)

```json
{
  "por_centro": [
    { "centro_transferencia": "Servicio_General", "segmento": "nacional_A", "total_llamadas": 7200, "trimestre": "Q3_25" },
    { "centro_transferencia": "Soporte_Tecnico", "segmento": "nacional_A", "total_llamadas": 5100, "trimestre": "Q3_25" },
    { "centro_transferencia": "Cobranza", "segmento": "nacional_B", "total_llamadas": 3800, "trimestre": "Q3_25" }
  ],
  "por_segmento": [
    { "segmento": "nacional_A", "centro": "Servicio_General", "total": 7200 },
    { "segmento": "nacional_B", "centro": "Cobranza", "total": 3800 }
  ]
}
```

### 3.5 ReporteMenus (uc-rpt-16 → tres stored procedures)

```json
{
  "menus_redirigidos": [
    { "menu": "MENU_PRINCIPAL", "total_llamadas": 9100, "trimestre": "Q3_25" },
    { "menu": "MENU_SOPORTE", "total_llamadas": 3200, "trimestre": "Q3_25" },
    { "menu": "VACIO", "total_llamadas": 420, "trimestre": "Q3_25" }
  ],
  "menu_por_centro": [
    { "menu": "MENU_PRINCIPAL", "centro": "Servicio_General", "total": 5800 },
    { "menu": "MENU_SOPORTE", "centro": "Soporte_Tecnico", "total": 2900 }
  ],
  "errores_menu": [
    { "menu": "MENU_ERROR_TIMEOUT", "segmento": "nacional_A", "total": 87, "trimestre": "Q3_25" },
    { "menu": "MENU_ERROR_INVALID", "segmento": "nacional_B", "total": 43, "trimestre": "Q3_25" }
  ]
}
```

Centinela: valor `'VACIO'` en campo `menu` = llamada sin llegar a ningún menú.

### 3.6 ReporteClientes (uc-rpt-17 → `sp_rpt_clientes`)

```json
{
  "clientes": [
    {
      "telefono_hashed": "a3f8c2d1e9b4...",
      "segmento": "nacional_A",
      "total_llamadas": 12,
      "primera_llamada": "2025-07-03",
      "ultima_llamada": "2025-09-28",
      "trimestre": "Q3_25"
    }
  ],
  "pagination": { "page": 1, "page_size": 50, "total": 4821 }
}
```

PII: `cTelefono_Origen` NUNCA expuesto. Solo `telefono_hashed` (hash unidireccional del ETL).

### 3.7 Métricas en tiempo real (uc-rpt-02 → SSE)

```json
{
  "timestamp": "2026-05-06T07:40:00Z",
  "trimestre_activo": "Q3_25",
  "segmentos_activos": ["nacional_A", "nacional_B"],
  "total_llamadas_hoy": 842,
  "tasa_abandono_5min": 6.3,
  "centros_activos": [
    { "centro": "Servicio_General", "llamadas_hoy": 340 },
    { "centro": "Soporte_Tecnico", "llamadas_hoy": 280 }
  ],
  "ultima_ejecucion_etl": "2026-05-06T06:00:00Z",
  "lag_seconds": 8
}
```

**Nota:** La data fuente es el ETL con delay de 6-12h. Las "métricas en tiempo real"
del IVR son las del último batch del ETL, no true real-time.

---

## 4. Mocks a actualizar en IACT-UI

| Archivo | Estado actual | Actualización necesaria |
|---------|---------------|-------------------------|
| `src/mocks/dashboardData.js` | revenue/users/conversion/retention | → DashboardIVR spec |
| `src/mocks/dashboard.json` | agents, active_agents, satisfaction | → DashboardIVR fields |
| `src/mocks/reportes.json` | tipos genéricos (call_volume, agent_performance) | → tipos IVR reales |
| `src/services/reportsService.js` | `getRealTimeMetrics()` con queue_count/agents_busy | → campos IVR (tasa_abandono, centros_activos, lag_seconds) |

---

## 5. Tipos de reporte IVR vigentes (Scope 1)

Los 7 reportes reales (prefijo `rpt_`) son:

| Tipo | Stored Procedure | UC |
|------|-----------------|-----|
| `ivr_abandono` | `sp_rpt_llamadas_abandonadas` | uc-rpt-13 |
| `ivr_centros` | `sp_rpt_centros_transferencia` | uc-rpt-15 |
| `ivr_centros_segmento` | `sp_rpt_centros_xsegmento` | uc-rpt-15 |
| `ivr_menu_redirigidos` | `sp_rpt_menu_redirigidos` | uc-rpt-16 |
| `ivr_menu_centro` | `sp_rpt_menu_centro` | uc-rpt-16 |
| `ivr_menu_error` | `sp_rpt_cMENU_ERROR` | uc-rpt-16 |
| `ivr_clientes` | `sp_rpt_clientes` | uc-rpt-17 |

No son 14 genéricos (agents/queues/campaigns) — ese scope es incorrecto para este sistema.
