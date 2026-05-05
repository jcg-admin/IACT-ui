```yml
project: IACT-UI
work_package: 2026-05-05-14-08-34-rbac-access-alignment
created_at: 2026-05-05 14:08:34
current_phase: Phase 1 — DISCOVER
status: active
author: claude
branch: claude/project-analysis-N9IkV
```

# WP — RBAC Access Module Alignment

## Objetivo

Corregir las tensiones identificadas entre el código del módulo de acceso
(ITER4) y las decisiones de diseño RBAC documentadas en el análisis externo.
5 hallazgos en 5 archivos — 3 críticos, 2 medios.

## Alcance

- `src/components/access/FunctionSelector.jsx` — SoD rules y categorías
- `src/services/permissions/PermissionsService.js` — validar contrato backend
- `src/redux/slices/accessSlice.js` — ambigüedad functionId vs codename
- `src/services/accessService.js` — terminología groupers → function_groups
- `src/router/AppRouter.jsx` — agregar ProtectedRoute y rutas del módulo Access

## Hallazgos del análisis externo

| ID | Archivo | Violación | Severidad |
|----|---------|-----------|-----------|
| H-01 | FunctionSelector.jsx | SoD regex contra function_id (PIP-*), no codenames | Crítica |
| H-02 | FunctionSelector.jsx | Categorías en español (USUARIO, AUDITORIA) | Media |
| H-03 | PermissionsService.js | Campos en español en contrato API | Crítica* |
| H-04 | accessSlice.js | functionId no distingue function_id vs codename | Alta |
| H-05 | accessService.js | groupers en lugar de function_groups | Media |
| H-06 | AppRouter.jsx | Sin ProtectedRoute ni rutas del módulo Access | Alta |

*H-03 requiere verificación — puede ser adaptación correcta de un contrato real.
