```yml
project: IACT-UI
work_package: 2026-05-06-05-45-28-requisitos-gap-analysis
created_at: 2026-05-06 05:52:29
updated_at: 2026-05-06 06:00:02
current_phase: Phase 3 — ANALYZE
open_risks: 1
mitigated_risks: 2
closed_risks: 2
author: NestorMonroy
```

# Risk Register — requisitos-gap-analysis

## Matriz de riesgos

| ID | Descripción | Probabilidad | Impacto | Severidad | Estado |
|----|-------------|:---:|:---:|:---:|--------|
| R-001 | Módulo Operador depende de CTI backend no implementado | alta | alto | crítica | **cerrado** |
| R-002 | Módulo Supervisión requiere WebSocket/SSE en tiempo real | alta | alto | crítica | **cerrado** |
| R-003 | uc-rpt-02 (tiempo real) puede requerir cambio arquitectónico | baja | bajo | **baja** | **mitigado** |
| R-004 | Regressions al agregar módulo Operador (10 páginas nuevas) | baja | medio | **media** | **mitigado** |
| R-005 | Ambigüedad entre UCs similares (uc-acc-* vs uc-perm-*) | media | bajo | media | abierto |

---

## Detalle de riesgos

### R-001: Módulo Operador bloqueado por ausencia de CTI backend

**Descripción**

uc-opr-02..05 (aceptar llamada, llamada saliente, hold, transferir) requieren
integración en tiempo real con el PBX/ACD via CTI. El backend CTI no existe aún.
Los 4 UCs de softphone son implementables solo cuando el backend esté disponible.

**Probabilidad**: alta  
**Impacto**: alto  
**Severidad**: crítica  
**Estado**: abierto  
**Fase de identificación**: Phase 1

**Señales de alerta**
- El backend no expone endpoints WebSocket para eventos de llamada
- No hay documentación de API CTI en el corpus

**Mitigación**
- Implementar uc-opr-01, 06, 07, 08, 09, 10 primero (no dependen de CTI)
- Crear UI del softphone con mock-first para los 4 UCs CTI-dependientes
- Marcar explícitamente en AppRouter con feature flag o placeholder

**Plan de contingencia**
- Si el backend CTI no llega en el plazo: documentar los 4 UCs como "pendientes de backend" y entregar los 6 UCs independientes de CTI completos

---

### R-002: Módulo Supervisión requiere integración CTI/SSE

**Descripción**

uc-sup-01 (monitor silent/whisper) y uc-sup-02 (barge-in) requieren stream en
tiempo real de audio de llamadas activas. uc-sup-03 requiere SSE para mensajería
broadcast. Ninguno de estos endpoints existe en el backend.

**Probabilidad**: alta  
**Impacto**: alto  
**Severidad**: crítica  
**Estado**: abierto  
**Fase de identificación**: Phase 1

**Señales de alerta**
- No hay endpoints `/api/calls/live` ni WebSocket de audio en el corpus de API

**Mitigación**
- Postponer Grupo C hasta que el backend esté disponible
- Crear pages placeholder con "Funcionalidad disponible próximamente"

**Plan de contingencia**
- Entregar páginas vacías con mensaje explicativo; activar cuando backend esté listo

---

### R-003: uc-rpt-02 puede requerir cambio arquitectónico

**Descripción**

uc-rpt-02 (métricas en tiempo real, sub-minuto) requiere o WebSocket push o
polling agresivo (<30s). La arquitectura actual del dashboard es REST polling.
Un WebSocket client podría requerir cambios en el store de Redux y el layout.

**Probabilidad**: media  
**Impacto**: medio  
**Severidad**: alta  
**Estado**: abierto  
**Fase de identificación**: Phase 1

**Mitigación**
- Implementar primero con polling de 30s como fallback
- Investigar si el backend expone SSE/WebSocket para métricas en tiempo real

---

### R-004: Regressions al agregar módulo Operador

**Descripción**

El módulo Operador añade ~10 páginas nuevas, nuevos slices Redux y posiblemente
nuevas rutas en AppRouter. Cada adición puede romper tests existentes si los
mocks de slices no se actualizan (patrón documentado en L-003 del WP anterior).

**Probabilidad**: media  
**Impacto**: alto  
**Severidad**: alta  
**Estado**: abierto  
**Fase de identificación**: Phase 1

**Mitigación**
- Aplicar PAT-UI-003 (grep consumers antes de agregar exports a slices)
- TDD estricto: tests antes de implementación en cada UC
- Correr suite completa (npx jest --no-coverage) al final de cada ITER

---

### R-005: Ambigüedad entre UCs similares en access/permissions

**Descripción**

Varios UCs parecen solaparse: uc-acc-03 vs uc-perm-10 (auditoría de acceso),
uc-acc-04 vs uc-perm-01 (asignar agrupador). El corpus usa el mismo concepto
en dos dominios con distintos actores. Puede haber implementaciones duplicadas
o incompletas.

**Probabilidad**: media  
**Impacto**: bajo  
**Severidad**: media  
**Estado**: abierto  
**Fase de identificación**: Phase 1

**Mitigación**
- En Phase 3 DIAGNOSE: mapear explícitamente los solapamientos y decidir si
  son la misma vista (diferente actor) o páginas distintas
- Documentar la decisión como ADR

---

## Riesgos cerrados / mitigados (Phase 3)

### R-001 — CERRADO (Phase 3)

Decisión de usuario: uc-opr-* excluido del scope del WP. El riesgo deja
de ser relevante para esta iteración.

### R-002 — CERRADO (Phase 3)

Decisión de usuario: uc-sup-* excluido del scope del WP. El riesgo deja
de ser relevante para esta iteración.

### R-003 — MITIGADO (Phase 3)

Phase 3 confirmó: rpt-02 usará polling a 30s con mock-first — no requiere
WebSocket ni cambio arquitectónico en el store Redux. Cuando el backend
exponga el endpoint, se sustituye el mock por la llamada real (1 línea).
El riesgo arquitectónico era especulativo.

### R-004 — MITIGADO (Phase 3)

Scope reducido de 10 páginas (módulo Operador) a ~6 UCs en total —
riesgo de regresión proporcionalmente menor. Se aplica PAT-UI-003
(grep consumers antes de agregar exports a slices) en cada iteración.

---

## Checklist de gestión

- [x] Riesgos identificados en Phase 1 antes de planificar
- [x] Cada riesgo tiene señales de alerta definidas
- [x] Cada riesgo tiene plan de contingencia
- [ ] Registro actualizado al final de cada fase
- [ ] Riesgos materializados referenciados en `context/errors/`
