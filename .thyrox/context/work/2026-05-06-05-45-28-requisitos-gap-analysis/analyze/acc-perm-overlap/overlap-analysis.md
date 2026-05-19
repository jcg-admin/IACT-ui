```yml
created_at: 2026-05-06 06:00:02
project: IACT-UI
work_package: 2026-05-06-05-45-28-requisitos-gap-analysis
phase: Phase 3 — ANALYZE
author: NestorMonroy
status: Borrador
```

# Análisis de Solapamiento — uc-acc-* vs uc-perm-*

Diagnóstico del riesgo R-005: ambigüedad entre UCs de los módulos
MOD_Access y MOD_Permissions.

---

## UCs en análisis

| UC | Nombre | Módulo | Página actual |
|----|--------|--------|---------------|
| uc-acc-03 | Consultar Permisos Efectivos | MOD_Access | `PermissionsPage.jsx` |
| uc-acc-04 | Asignar Agrupador a Usuario | MOD_Access | pendiente verificar |
| uc-perm-01 | Asignar Grupo a Usuario (vista PERM) | MOD_Permissions | `GroupManagementPage.jsx`? |
| uc-perm-10 | Consultar Auditoría de Permisos | MOD_Permissions | `PermissionsAuditPage.jsx` |

---

## Par 1: uc-acc-03 vs uc-perm-10

**Veredicto: NO son el mismo UC. Son complementarios. Ambos implementados.**

### uc-acc-03 (Consultar Permisos Efectivos)

Propósito: vista consolidada de las funciones efectivas de un User en un
momento dado. Agrega 3 fuentes: (1) funciones directas (acc-01), (2)
funciones vía AGR (acc-04), (3) permisos excepcionales (perm-03).

Pregunta que responde: **"¿Qué puede hacer este usuario AHORA?"**

Implementación (PROVEN): `PermissionsPage.jsx` — comentario de cabecera
dice `UC_ACC_03: Consultar y gestionar permisos de usuarios`. Despacha
`fetchUserPermissions` + `revokeFunction`. ✓

### uc-perm-10 (Consultar Auditoría de Permisos)

Propósito: historial de CAMBIOS de permisos — quién asignó/revocó qué,
cuándo, desde dónde. Para cumplimiento y forense.

Pregunta que responde: **"¿Quién cambió los permisos de este usuario y cuándo?"**

Implementación (PROVEN): `PermissionsAuditPage.jsx` — comentario dice
`UC-PERM-10 — Historial de cambios de permisos y grupos`. Filtra por
`PERMISSION_ACTIONS = ['ASSIGN_PERMISSION', 'REVOKE_PERMISSION', ...]`. ✓

**Conclusión:** R-005 era falso para este par. Funcionalidades distintas,
implementaciones distintas, páginas distintas. Sin conflicto.

---

## Par 2: uc-acc-04 vs uc-perm-01

**Veredicto: Son la MISMA operación con diferente contexto de UI. Decisión de diseño.**

### uc-acc-04 (Asignar Agrupador a Usuario)

Propósito: asignar un AccessGroup (AGR) a un User desde la vista operacional
del administrador de usuarios. Caso de uso: onboarding rápido, asignar
roles estándar.

Módulo: MOD_Access — "vista operacional del flujo de asignación".

### uc-perm-01 (Asignar Grupo a Usuario — vista PERM)

El corpus RST (`uc-perm-01/informacion-general.rst`) declara explícitamente:

> "Es vista alternativa de UC_ACC_04 — la operación subyacente, validaciones,
> side-effects y restricciones son IDÉNTICAS."
>
> "Ambas vistas usan la **misma función canónica** `assign_function_groups`
> y el mismo endpoint backend."
>
> "La diferencia es el enfoque" (MOD_Access → admin operacional;
> MOD_Permissions → admin de seguridad en compliance reviews).
>
> ADR-GOB-008 en el corpus documenta esta decisión de diseño.

### Implicación para la UI

Son 2 entries en el sidebar de módulos distintos que llegan a la **misma
funcionalidad de asignación de grupos**, posiblemente la misma página o
componente compartido.

### Estado de implementación

- `GroupManagementPage.jsx` — existente en `src/pages/access/`. Candidates:
  maneja la gestión de grupos (crear/editar AGRs).
- `GroupersPage.jsx` — existente. Candidates: lista de agrupadores.

Ninguna página está explícitamente taggeada como UC_ACC_04 o UC_PERM_01.
La asignación de AGR a usuario probablemente está en `GroupManagementPage.jsx`
o en `AssignFunctionsPage.jsx` (que está taggeada como UC_ACC_01).

**Decisión requerida (Phase 5):** ¿Se implementan como dos entradas separadas
al mismo componente, o como una sola página con contexto dinámico?

**Recomendación:** Una sola página `AssignGroupPage.jsx` accesible desde
ambos módulos (`/access/assign-group` y `/permissions/assign-group` → misma
ruta canónica). Evita duplicación de lógica.

---

## Conclusión R-005

| Par | Diagnóstico | Acción |
|-----|-------------|--------|
| acc-03 vs perm-10 | FALSO POSITIVO — funcionalidades distintas, ambos implementados | Cerrar R-005 para este par |
| acc-04 vs perm-01 | Solapamiento INTENCIONAL (ADR-GOB-008) — misma operación, distinto contexto UI | Decidir estrategia de página única vs dual en Phase 5 |

**R-005 re-clasificado:** No es ambigüedad — es arquitectura de dos módulos
que comparten una operación. El riesgo real es implementar la misma lógica
dos veces (duplicación de código). Mitigación: componente compartido.

---

## UCs pendientes de implementación en acc/perm

Verificados como NO implementados (require Phase 8 task plan):

| UC | Nombre | Evidencia de ausencia |
|----|--------|-----------------------|
| uc-acc-04 | Asignar AGR a Usuario | Ninguna página taggeada como UC_ACC_04 |
| uc-perm-01 | Asignar Grupo (vista PERM) | Sin route `/permissions/*` en AppRouter |
