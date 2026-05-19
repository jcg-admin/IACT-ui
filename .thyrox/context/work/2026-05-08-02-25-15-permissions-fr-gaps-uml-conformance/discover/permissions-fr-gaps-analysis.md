```yml
created_at: 2026-05-08 02:25:42
project: THYROX
work_package: 2026-05-08-02-25-15-permissions-fr-gaps-uml-conformance
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
version: 1.0.0
```

# Discover — Permissions FR Gaps (UML Conformance Sprint 2)

## Contexto

Branch de referencia: `feature/cnst-033-uml-conformance` en `/tmp/references/IACT-docs`
Implementación: `/home/user/IACT-ui/src/`
Branch de trabajo: `claude/project-analysis-N9IkV`

Sprint 2 del proyecto IACT-docs reemplazó la narrativa SoD → SeparationRule en:
- domain-model, backend-docs, requisitos-funcionales/access, requisitos-funcionales/permissions

Se identificaron 6 gaps entre los FRs actualizados y la implementación en IACT-ui.

## Gaps identificados

### GAP-1: SeparationRulesValidator no distingue severidad HARD/SOFT
- **FR:** FR-010-02 (validar-separacion-antes-asignar)
- **Archivo:** `src/components/access/SeparationRulesValidator.jsx`
- **Síntoma:** Muestra "INCOMPATIBLE" para todos los conflictos y bloquea siempre
- **FR requiere:**
  - HARD → bloquea asignación, muestra detalle del conflicto
  - SOFT → muestra advertencia, permite continuar con confirmación adicional

### GAP-2: AssignGroup.jsx no valida separación antes del POST
- **FR:** FR-012-03 (asignar-grupo-con-validacion)
- **Archivo:** `src/pages/access/AssignGroup.jsx`
- **Síntoma:** `handleSubmit` despacha `assignGroupToUser` directamente sin pre-validación
- **FR requiere:** Expandir AGR → validar separación del conjunto efectivo → mostrar conflictos → confirmar → POST

### GAP-3: Sin página para UC_PERM_03 "Conceder Permiso Excepcional"
- **FR:** FR-014-01 + FR-014-02
- **Síntoma:** No existe página en `src/pages/` para este UC
- **Nota:** `TemporaryPermissions.jsx` es UC_ACC_08, distinto de UC_PERM_03
- **FR requiere:**
  - Campo justificación obligatorio (no vacío)
  - Campo expires_at con límites validados
  - Validación anti-self (invoker ≠ target_user → P-11)
  - Validación separación del conjunto efectivo post-concesión
  - Respuesta muestra resumen + warnings separación si aplica

### GAP-4: Sin página para UC-015 "Revocar Permiso Excepcional"
- **Síntoma:** No existe página en `src/pages/` para este UC
- **Cobertura esperada:** Lista de permisos excepcionales activos, acción revocar, audit trail

### GAP-5: GroupComposition.jsx no muestra cascade_affected_user_count
- **FR:** FR-017-01 (actualizar-composicion-agr)
- **Archivo:** `src/pages/access/GroupComposition.jsx`
- **Síntoma:** Solo despacha `assignFunctionsToGroup` sin mostrar impacto cascade
- **FR requiere:** `cascade_affected_user_count` antes de confirmar cambio de composición, 422 con detalle de usuarios en conflicto si hay cascade conflict

### GAP-6: Label "SoD" en ComplianceReport.jsx (cosmético)
- **Archivo:** `src/pages/audit/ComplianceReport.jsx` línea 47
- **Síntoma:** `{ name: 'Segregación de Deberes (SoD)', ... }` — nomenclatura Sprint 1
- **Fix:** Cambiar a `'Separación de Funciones'` (SeparationRule)

## Prioridad propuesta

| Gap | Prioridad | Estimación |
|-----|-----------|------------|
| GAP-1 | Alta — bloquea correctness funcional | Pequeño (1 componente) |
| GAP-2 | Alta — flujo crítico de asignación | Mediano (1 página + thunk) |
| GAP-3 | Alta — UC completo faltante | Grande (nueva página completa) |
| GAP-4 | Media — UC completo faltante | Mediano (nueva página) |
| GAP-5 | Media — UX incompleta | Pequeño (1 componente) |
| GAP-6 | Baja — cosmético | Trivial (1 string) |

## Stakeholders

- **NestorMonroy** — autor FRs en IACT-docs
- **Equipo IACT** — implementación IACT-ui

## Riesgos preliminares

- GAP-3 requiere mock backend para `POST /api/users/{id}/exceptional-permissions/`
- GAP-4 requiere mock backend para `DELETE /api/users/{id}/exceptional-permissions/{id}`
- GAP-2 requiere que el mock de `validateSeparationRules` maneje AGR expansion (distinto de function-level validation)
