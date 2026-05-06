```yml
created_at: 2026-05-06 08:14:41
updated_at: 2026-05-06 08:14:41
project: THYROX
work_package: 2026-05-06-08-10-48-rbac-permissions-mock-alignment
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# Risk Register — RBAC Permissions Mock Alignment

| ID | Descripción | Prob | Impacto | Mitigación |
|---|---|---|---|---|
| R-001 | `catalog.test.js` valida formato `sistema.X.Y.Z` — falla si se cambia notación | Alta | Alto | Actualizar test en el mismo commit que catalog.js |
| R-002 | Rutas `/admin` y `/settings` en AppRouter usan constantes sin equivalente en spec RBAC v5.4.0 | Alta | Medio | Decisión DP-001 antes de ejecutar — mantener como extensiones UI |
| R-003 | Renaming de constantes podría romper componentes que importan FunctionCatalog | Media | Alto | grep exhaustivo antes de cambiar nombres de constantes |
| R-004 | Persona mock (maria.garcia) pierde acceso a features si AGR-002 no incluye suficientes funciones | Media | Medio | Elegir AGR-004 (data exporter) para demo completo |
| R-005 | `PermissionGate.tsx` docstrings con notación vieja confunden futuros devs | Baja | Bajo | Actualizar en mismo commit (solo comentarios) |
| R-006 | Tests que hardcodean strings de capacidades en otros archivos | Media | Medio | Buscar `sistema\.` en `/src/**/__tests__/` antes de ejecutar |
