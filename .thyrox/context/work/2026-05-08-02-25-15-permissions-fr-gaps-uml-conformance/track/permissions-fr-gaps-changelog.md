```yml
created_at: 2026-05-08 03:53:51
project: THYROX
work_package: 2026-05-08-02-25-15-permissions-fr-gaps-uml-conformance
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Changelog — permissions-fr-gaps-uml-conformance

## Added

- `src/pages/permissions/ExceptionalPermission.jsx` — Nueva página UC_PERM_03:
  "Conceder Permiso Excepcional" con justificación obligatoria (min 10 chars),
  validación anti-self (targetUserId === currentUserId bloquea submit con banner rojo),
  fecha expiración, feedback de `supervisor_notified` en success. (T-017, T-018, T-019)

- `src/pages/permissions/RevokeExceptionalPermission.jsx` — Nueva página UC-015:
  "Revocar Permiso Excepcional" con búsqueda por userId, tabla de permisos activos,
  confirm modal antes de DELETE, recarga lista post-revocación. (T-023, T-024, T-025)

- Rutas `/permissions/exceptional-permission` y `/permissions/revoke-exceptional`
  en `AppRouter.jsx` con lazy import y guards de permiso. (T-018, T-024)

## Changed

- `SeparationRulesValidator.jsx` — Diferenciación HARD/SOFT: HARD = panel rojo,
  bloqueo total; SOFT = panel amarillo, botón "Entendido, proceder de todas formas"
  → callback `onProceedAnyway`. Default severity = HARD si no se especifica.
  FR-010-02 cumplido. (T-002, T-003, T-004)

- `AssignGroup.jsx` — Flujo 2 pasos: step `form` con "Verificar separación" →
  step `review` con SeparationRulesValidator. Pre-validación antes del POST.
  SOFT permite proceder con confirmación. HARD bloquea submit. FR-012-03 cumplido.
  (T-005..T-009)

- `GroupComposition.jsx` — `handleConfirmAdd` con cascade impact preview:
  primer click fetches `getGroupCascadeImpact`, muestra notice (warning o neutro),
  segundo click confirma asignación. FR-017-01 cumplido. (T-010..T-013)

- `ComplianceReport.jsx:47` — Label `'Segregación de Deberes (SoD)'` →
  `'Separación de Funciones'` (corrección terminológica). (T-001)

- `mockInterceptor.js` — Handlers nuevos: `/separation-rules/validate`,
  `/groups/{id}/validate-for-user`, `/groups/{id}/cascade-impact`,
  `/users/{id}/exceptional-permissions/` (GET/POST/DELETE).

- `accessGateway.js` — Métodos nuevos: `validateGroupAssignment`,
  `getGroupCascadeImpact`, `grantExceptionalPermission`, `getExceptionalPermissions`,
  `revokeExceptionalPermission`.

- `access.js` — Thunks nuevos: `validateGroupAssignment`,
  `grantExceptionalPermission`, `fetchExceptionalPermissions`,
  `revokeExceptionalPermission`.

## Fixed

- `GroupCompositionPage.test.jsx` — Mock de `accessGateway` corregido con
  `__esModule: true`. Sin esta bandera, Babel's interop no desenvuelve el `default`
  export, causando que `accessService.getGroupCascadeImpact` sea `undefined` en el
  componente. El catch block se activaba silenciosamente y los spy assertions
  mostraban 0 calls. Todos los tests ahora verifican el flujo real.

## Status de promoción a CHANGELOG.md raíz

Pendiente hasta merge a main con bump de versión.
Entradas relevantes: Added (2 páginas nuevas + rutas), Changed (SeparationRulesValidator
HARD/SOFT, AssignGroup pre-validación, GroupComposition cascade preview).
