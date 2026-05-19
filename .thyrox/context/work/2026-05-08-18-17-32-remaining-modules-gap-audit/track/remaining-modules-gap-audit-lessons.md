```yml
created_at: 2026-05-08 20:00:00
project: IACT-UI
work_package: 2026-05-08-18-17-32-remaining-modules-gap-audit
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — remaining-modules-gap-audit

## L-01: State field vs isActive boolean — coexistencia necesaria

**Contexto:** `_handleGetAlerts` retornaba `isActive: bool` sin campo `state`.
La spec uc-alr-03 requiere `state: 'firing'|'acknowledged'|'resolved'`.

**Lección:** Al extender mock data para nuevos UC, añadir los campos de estado
del spec (state machine) y mantener campos legacy para compatibilidad hacia
atrás. En `getStatusBadge`, priorizar `alert.state` sobre `alert.isActive`.

**Patrón:** `alert.state === 'acknowledged' ? ... : (alert.state === 'firing' || alert.is_active) ? ...`

---

## L-02: Route ordering crítico en mockInterceptor

**Contexto:** La ruta `/api/alerts/{id}/ack/` contiene `/api/alerts` como
substring. El bloque genérico `if (url.includes('/api/alerts'))` capturaba
TODAS las requests de alerts antes de que el handler específico pudiera matchear.

**Lección:** Siempre registrar rutas específicas (con regex pattern) ANTES de
las rutas genéricas (con includes). El orden en `intercept()` define precedencia.

**Patrón verificado en pipeline-scope-audit:** El handler de retry también se
registró antes del bloque genérico ETL.

---

## L-03: note opcional no requiere validación de mínimo

**Contexto:** A diferencia de `motivo` en uc-pip-04 (mínimo 20 chars),
`note` en uc-alr-03 es `note?: string (≤ 500 char)` — explícitamente opcional.

**Lección:** Leer la spec completa antes de diseñar validaciones. `?` en el
contrato de datos = opcional. El botón "Confirmar" en modales con campos
opcionales debe estar SIEMPRE habilitado (a diferencia de campos obligatorios
con mínimo como motivo).

---

## L-04: PAT-UC-AUDIT-001 en auditoría completa — 8 módulos, 1 gap

**Contexto:** Auditoría de 8 módulos (reports, alerts, admin, audit, access,
permissions, logs, users) con 60+ UCs en scope v5.6.0.

**Lección:** Aplicar PAT-UC-AUDIT-001 (archivo + ruta) y PAT-UC-AUDIT-002
(leer fuente antes de clasificar) en paralelo, módulo por módulo. La mayoría
de los "posibles gaps" se resuelven al verificar que el UC está inline (tab,
modal, componente compartido). Solo 1 gap genuino en 8 módulos.

**Señales de falso positivo:** UC "Gestionar X" implementado como tab en
página "Gestionar Y" (uc-adm-05 en MenuItemCatalog), revoke inline en assign
(uc-acc-02 en AssignFunctions), share como modal inline (uc-rpt-11).
