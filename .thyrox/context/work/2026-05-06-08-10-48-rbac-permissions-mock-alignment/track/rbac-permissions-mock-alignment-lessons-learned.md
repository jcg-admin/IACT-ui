```yml
created_at: 2026-05-06 19:15:06
project: THYROX
work_package: 2026-05-06-08-10-48-rbac-permissions-mock-alignment
phase: Phase 11 — TRACK/EVALUATE
author: claude
status: Aprobado
```

# Lessons Learned — rbac-permissions-mock-alignment

## L-01: Las guías de naming son la fuente de verdad — no el código existente

Cuando se detectó que `sod-rules` era el nombre usado en toda la codebase,
la primera reacción fue continuar con ese nombre. Pero `docs/guides/rest-api-conventions.md`
y `docs/guides/rbac-naming-standard.md` documentan explícitamente los nombres prohibidos
con ejemplos: `❌ /access/sod-rules`, `❌ selectSodRules`. El código existente tenía
deuda técnica de nomenclatura que debía corregirse, no propagarse.

**Patrón:** Antes de añadir cualquier referencia nueva a un identificador existente, verificar
que ese identificador cumple las guías del proyecto.

## L-02: Módulos de permisos comparten componentes — no duplicar

UC-PERM-01 (assign group desde módulo Permissions) y UC-PERM-03 (temp permissions desde
módulo Permissions) no requirieron nuevos componentes — solo nuevas rutas apuntando a
`AssignGroupPage` y `TemporaryPermissionsPage` ya existentes. El router con RBAC gates
es el punto de control, no la duplicación de páginas.

**Patrón:** Antes de crear un componente nuevo para un UC, verificar si existe un componente
con funcionalidad equivalente que pueda reusarse con una ruta diferente.

## L-03: revoke_reason es un invariante de BR-009 — no un detalle de UI

La constraint `revoke_reason` obligatorio (BR-009) aplica a todas las operaciones de
revocación: `revokeFunction`, `revokeGroupFromUser`. Al implementar `TemporaryPermissionsPage`
la primera versión no tenía `revoke_reason` en `handleRevoke`. BR-009 no está solo en
la spec — está en los tests de integración como validación contractual.

**Patrón:** Al implementar cualquier operación de "revocar", siempre incluir `revoke_reason`
obligatorio con validación de string no vacío.

## L-04: Los datos mock en-componente deben ser consistentes con sus handlers

`TemporaryPermissionsPage` tenía datos mock con campos `user` e `id`, pero `handleRevoke`
usaba `perm.userId` y `perm.catalogId` — ambos `undefined`. El bug no era visible en
render pero sí en dispatches. Verificar que los field names del mock de datos coinciden
con los accedidos en los handlers.

## L-05: Lazy imports en AppRouter — agregar antes de usar

`TemporaryPermissionsPage` existía pero no estaba declarado como lazy import en
`AppRouter.jsx`. Al agregar la ruta `/permissions/temp-permissions` sin el import
correspondiente, se producía un error en runtime. El patrón es: primero lazy import,
luego ruta.
