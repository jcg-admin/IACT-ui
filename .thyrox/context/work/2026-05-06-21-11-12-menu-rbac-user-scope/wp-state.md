```yml
created_at: 2026-05-06 21:11:12
project: IACT-ui
work_package: 2026-05-06-21-11-12-menu-rbac-user-scope
phase: Phase 1 — DISCOVER
status: Activo
author: claude
size: mediano
```

# WP — Menú de navegación por usuario (RBAC scope)

## Trigger

Post-análisis del WP `rbac-v560-spec-analysis` reveló que el menú de
navegación (`ALL_NAV_LINKS` en AppRouter) tiene dos problemas estructurales:

1. El endpoint `/api/permisos/verificar/{userId}/capacidades/` usado por
   `usePermisos` no tiene handler en `mockInterceptor.js` — el menú
   probablemente no filtra en modo mock.

2. No existe matriz documentada de qué ítems de menú debe ver cada tipo de
   usuario (por AGR), lo que hace imposible verificar que el filtrado es correcto.

## Objetivo

Analizar el sistema de menú actual, documentar la matriz menú×AGR esperada
según RBAC v5.6.0, y corregir los gaps de cobertura de mock y filtrado.
