```yml
created_at: 2026-05-06 02:07:30
project: IACT-UI
analysis_version: 1.0
author: NestorMonroy
status: Aprobado
```

# Phase 1 DISCOVER — uc-full-implementation

## Contexto y motivación

IACT-UI es el panel de analytics y administración del sistema IVR.
IACT-docs (rama `feature/cnst-033-uml-conformance`) documenta
**83 UCs** en `source/arquitectura-tecnica/use-case-view/`.

El análisis de cobertura ejecutado el 2026-05-06
(`.thyrox/context/research/uc-coverage-iact-ui-2026-05-06.md`)
mostró que IACT-UI implementa el **58% de los UCs en scope**.
El objetivo de este WP es implementar el **100%** de los UCs
en scope de IACT-UI.

---

## Universo de UCs

| Estado previo | UCs | Acción en este WP |
|---|---|---|
| ✅ Implementado completo | 48 | Verificar — no tocar salvo regresión |
| ⚠ Parcial | 13 | Completar gaps documentados |
| ❌ Sin implementación | 7 | Implementar desde cero |
| 🔲 Fuera de alcance (telephony) | 15 | No implementar en IACT-UI |
| **Total** | **83** | |

Después del fix de rutas del commit anterior (4 páginas registradas),
los parciales y faltantes suman **20 UCs** que requieren trabajo.

---

## Módulos y UCs por estado

### auth (5 UCs) — 4/5 completos

| UC | Gap | Trabajo |
|----|-----|---------|
| uc-auth-02 | Logout sin modal de confirmación ni manejo de sesiones concurrentes | `LogoutConfirmModal` en `UserMenu` |

### access (7 UCs) — 6/7 completos (después del fix de rutas)

| UC | Gap | Trabajo |
|----|-----|---------|
| uc-acc-02 | Revocar funciones comparte flujo con asignar, sin acción diferenciada | Separar acción "revocar" en `AssignFunctionsPage` |

### permissions (10 UCs) — 7/10 completos

| UC | Gap | Trabajo |
|----|-----|---------|
| uc-perm-01 | Sin flujo "asignar grupo a usuario" | Modal o sub-página `/users/:id/groups` |
| uc-perm-02 | Sin flujo "revocar grupo a usuario" | Simétrico a perm-01 |
| uc-perm-10 | Auditoría de permisos comparte vista con auditoría de acceso | Sub-ruta `/access/audit/permissions` |

### reports (16 UCs) — 12/16 completos (uc-inc-rpt-01 N/A)

| UC | Gap | Trabajo |
|----|-----|---------|
| uc-rpt-02 | Métricas RT sin ruta diferenciada | Sub-sección en DashboardPage o `/reports/realtime` |
| uc-rpt-03 | Reportes históricos dentro del AnalyticsDashboard | Sub-ruta `/reports/historical` |
| uc-rpt-09 | Filtros embedded en ReportBuilder | Evaluar si requiere ruta propia |
| uc-rpt-10 | Guardar vista solo en AgentsReportPage | Generalizar a todos los módulos de reports |
| uc-rpt-11 | Sin implementación (compartir reporte) | `ShareReportModal` o `/reports/shared` |

### alerts (5 UCs) — 4/5 completos

| UC | Gap | Trabajo |
|----|-----|---------|
| uc-alr-03 | Reconocer alerta sin flujo de confirmación | `AcknowledgeAlertModal` en `AlertsPage` |

### pipeline (4 UCs) — 2/4 completos

| UC | Gap | Trabajo |
|----|-----|---------|
| uc-pip-02 | Errores ETL comparten vista con supervisión ETL | Tab/filtro dedicado en `ETLLogsPage` |
| uc-pip-03 | Sin implementación (disponibilidad de datos) | Sub-vista `/logs/etl/availability` |
| uc-pip-04 | Sin implementación (reintento de pipeline) | Acción en `ETLLogsPage` + modal de confirmación |

### admin (3 UCs) — 2/3 completos

| UC | Gap | Trabajo |
|----|-----|---------|
| uc-adm-01 | SoD en access, no en admin — ruta discutible | Verificar si `/access/sod-rules` ya registrado cubre el UC o necesita `/admin/sod-rules` adicional |

### Módulos 100% cubiertos

- **users** (4/4) — completo
- **audit** (4/4) — completo
- **logs** (7/7) — completo

### Módulos fuera de alcance

- **operator** (10 UCs) — Softphone/Agent Desktop
- **supervision** (3 UCs) — Supervisor Desktop
- **caller** (5 UCs) — IVR engine externo

---

## Resumen de trabajo requerido

| Tipo de trabajo | UCs | Descripción |
|---|---|---|
| Modal/componente nuevo | 4 | auth-02, perm-01, perm-02, alr-03 |
| Feature nueva (página o sub-página) | 4 | rpt-11, pip-03, pip-04, perm-10 |
| Refactor de página existente | 5 | acc-02, rpt-02, rpt-03, rpt-09, rpt-10 |
| Feature en página existente (tab/filtro) | 1 | pip-02 |
| Verificación/decisión | 1 | adm-01 |
| **Total UCs a trabajar** | **15** | |

> **Nota:** El total bajó de 20 a ~15 porque el fix de rutas
> del commit anterior convirtió 4 ⚠ en ✅
> (GroupersPage, SeparationRulesPage, SegmentsPage, TemplatesPage).

---

## Grupos de implementación propuestos (G1..G6)

Para ejecutar este WP en bloques coherentes y testeables:

### G1 — Modales de confirmación (auth + alerts)
- uc-auth-02: `LogoutConfirmModal`
- uc-alr-03: `AcknowledgeAlertModal`
- **Esfuerzo:** Bajo — componentes standalone con lógica de Redux existente.

### G2 — Asignación/revocación de grupos (permissions)
- uc-perm-01: Asignar grupo a usuario
- uc-perm-02: Revocar grupo a usuario
- **Esfuerzo:** Medio — requiere flujo modal + slice update (o nuevo endpoint).

### G3 — Pipeline (ETL visibility)
- uc-pip-02: Tab "Errores" en ETLLogsPage
- uc-pip-03: Vista `/logs/etl/availability`
- uc-pip-04: Acción "Reintentar pipeline" en ETLLogsPage
- **Esfuerzo:** Medio — requiere nuevos componentes + mock de endpoints ETL.

### G4 — Reports (completar módulo)
- uc-rpt-09: Evaluar/confirmar filtros en ReportBuilder
- uc-rpt-10: Generalizar saveFilter a todos los módulos
- uc-rpt-11: ShareReportModal
- **Esfuerzo:** Medio-Alto — rpt-10 requiere refactor multi-página.

### G5 — Diferenciación de vistas (reports + permissions)
- uc-rpt-02: Ruta diferenciada métricas RT
- uc-rpt-03: Sub-ruta reportes históricos
- uc-perm-10: Sub-ruta auditoría de permisos
- **Esfuerzo:** Bajo-Medio — principalmente rutas + separación de componentes.

### G6 — Refactor access (acc-02) + decisión admin (adm-01)
- uc-acc-02: Separar flujo revocar de asignar funciones
- uc-adm-01: Verificar cobertura SoD bajo `/access/sod-rules`
- **Esfuerzo:** Bajo — decisión de diseño + cambio quirúrgico.

---

## Estrategia de implementación

1. **Un grupo a la vez** — commit atómico por grupo, tests verdes antes
   de avanzar al siguiente.
2. **TDD para lógica nueva** — modales, slices, actions nuevas.
3. **Mock-first para backends faltantes** — pip-03/04, rpt-11 y
   perm-01/02 requerirán mocks de endpoint hasta que el backend esté listo.
4. **No romper los 1460 tests existentes** — cada entrega verifica
   `npx jest --no-coverage`.

---

## Fuentes de verdad

| Artefacto | Path |
|-----------|------|
| Análisis de cobertura UC | `.thyrox/context/research/uc-coverage-iact-ui-2026-05-06.md` |
| Lista completa de 83 UCs | `/tmp/references/IACT-docs/.thyrox/context/work/.../uc-list-full.md` |
| use-case-view (diagramas) | `/tmp/references/IACT-docs/source/arquitectura-tecnica/use-case-view/` |
| AppRouter actual | `src/router/AppRouter.jsx` |
| FunctionCatalog (permisos) | `src/permissions/catalog.js` |

---

## Exit criteria Phase 1

- [x] WP creado con timestamp real
- [x] Risk register documentado
- [x] Análisis de descubrimiento completo (este archivo)
- [x] Grupos de implementación definidos (G1..G6)
- [x] Estrategia documentada

**Siguiente fase:** Phase 3 DIAGNOSE → análisis profundo por grupo
(specs de componentes, dependencias de backend, patrones de diseño).
