```yaml
project: IACT-UI
work_package: 2026-05-05-08-27-35-test-failures-fix
created_at: 2026-05-05 08:27:35
current_phase: Phase 1 — DISCOVER
flow: thyrox
methodology_step: workflow-discover
author: NestorMonroy
status: active
epic: ÉPICA 5 — Corrección de 37 suites de tests fallidas
blockers: []
agents: []
```

# WP — Corrección de fallos en suite de tests

## Resultado de `npm test`

```
Test Suites: 37 failed, 60 passed, 97 total
Tests:       10 failed, 506 passed, 516 total
Time:        51.729 s
```

## Categorías de fallo identificadas (DISCOVER)

### Categoría A — Módulos/hooks no creados (19 suites)
Tests que importan hooks vía `@hooks/` que no existen en `src/hooks/`:
- `@hooks/useAsync`, `@hooks/useClickAway`, `@hooks/useDebounce`
- `@hooks/useForm`, `@hooks/useInterval`, `@hooks/useKeyPress`
- `@hooks/useLocalStorage`, `@hooks/useMediaQuery`, `@hooks/useMountedState`
- `@hooks/usePasswordStrength`, `@hooks/usePrevious`, `@hooks/useThrottle`
- `@hooks/useTimeout`, `@hooks/useJobs`, `@hooks/useMenuToggle` (ruta incorrecta)

### Categoría B — Componentes no creados (9 suites)
Tests que importan componentes que no existen en `src/components/common/`:
- `Header`, `BreadcrumbNav`, `LogoBrand`, `MenuButton`, `NotificationBell`, `UserMenu`
- `Sidebar`, `SidebarNav`, `NavLink`
También: `@components/shared/Header` (alias incorrecto), `@components/common/Header`

### Categoría C — Context missing (3 suites)
- `src/context/ToastContext` no existe (importado por Jobs, Transactions, UserManagement)

### Categoría D — Servicio faltante (1 suite)
- `@services/alertService` no existe en `src/services/`

### Categoría E — Fallos lógicos en tests existentes (5 tests en 4 suites)
- `MainLayout` — texto esperado "Menu no disponible" pero recibe "Cargando menu..."
- `useExport` — `exporting` permanece `true` tras exportar
- `animations` — `buttonVariants` no exportado desde `AnimatedButton`
- `JobOrchestrator` — 4 tests (3 timeouts, 1 status mismatch, 1 error handling)
