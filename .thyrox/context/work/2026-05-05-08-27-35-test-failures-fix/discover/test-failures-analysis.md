```yaml
created_at: 2026-05-05 08:35:00
project: IACT-UI
work_package: 2026-05-05-08-27-35-test-failures-fix
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Aprobado
```

# DISCOVER — Test failures analysis

## Resumen (verificado con `npm test`)

```
Test Suites: 37 failed, 60 passed, 97 total
Tests:       10 failed, 506 passed, 516 total
```

## Categoría A — Hooks sin archivo plano (19 suites)

**Causa raíz:** Tests importan `@hooks/hookName` → Jest mapea a `src/hooks/hookName.js`
que NO existe. Los hooks reales están en `src/hooks/utils/` o `src/hooks/domain/`.

**Hooks utils faltantes en `src/hooks/`:**
useAsync, useClickAway, useDebounce, useInterval, useKeyPress,
useLocalStorage, useMediaQuery, useMountedState, usePrevious, useThrottle, useTimeout

**Hooks domain faltantes en `src/hooks/`:**
usePasswordStrength, useMenuToggle, useForm, useJobs

**Caso especial `useMenuToggle`:**
`__tests__/hooks/useMenuToggle.test.js` importa via relative path `../../src/hooks/useMenuToggle`
→ también necesita `src/hooks/useMenuToggle.js`

**Fix:** Crear 15 archivos proxy en `src/hooks/` que re-exporten desde el subdirectorio correcto.

## Categoría B — Componentes en path incorrecto (9 suites)

**Causa raíz:** Tests importan de `src/components/common/Header/*` y
`src/components/common/Sidebar/*` pero los archivos están en
`src/components/navigation/Header/*` y `src/components/navigation/Sidebar/*`.

**Header missing:** Header, BreadcrumbNav, LogoBrand, MenuButton, NotificationBell, UserMenu
**Sidebar missing:** Sidebar, SidebarNav, NavLink

`AppRouter` test importa `DashboardLayout from '@components/common/Header'` → necesita
re-export desde `src/components/common/Header/index.jsx`.

**Fix:** Crear `src/components/common/Header/` y `src/components/common/Sidebar/` con
archivos proxy que re-exporten desde navigation/.

## Categoría C — Context en path incorrecto (3 suites)

**Causa raíz:** Tests en `src/components/features/*/Jobs/__tests__/` importan
`../../../context/ToastContext` → resuelve a `src/components/context/ToastContext`.
El archivo real está en `src/context/ToastContext.jsx`.

**Fix:** Crear `src/components/context/ToastContext.jsx` como proxy.

## Categoría D — Servicio faltante (1 suite)

`src/services/alertService.js` no existe. El test espera un default export con método
`getNew(since?)` que llama a `apiService.get('/api/alerts/')`.

**Fix:** Crear `src/services/alertService.js` con la interfaz esperada.

## Categoría E — Fallos lógicos (4 suites, 10 tests)

### E1: MainLayout — timing en test (1 test)
`findByTestId('menu-placeholder')` resuelve inmediatamente con "Cargando menu..."
antes de que el reject del servicio propague. Fix: usar `waitFor` en el test.

### E2: useExport CSV — setTimeout innecesario (1 test)
`handleExportCSV` usa `setTimeout(() => setExporting(false), 100)` pero CSV es síncrono.
Con fake timers del test, el setTimeout no se adelanta. Fix: eliminar setTimeout,
llamar `setExporting(false)` directamente.

### E3: AnimatedButton — buttonVariants no exportado (1 test)
El test hace `const { buttonVariants } = await import('../AnimatedButton')` pero solo
está exportado `getButtonVariants`. Fix: exportar `buttonVariants` estático.

### E4: JobOrchestrator — timeouts con fake timers (5 tests)
`jest.useFakeTimers()` está declarado pero `jest.advanceTimersByTime(2000)` +
`await Promise.resolve()` no es suficiente para flush el chain async completo.
Fix: usar `jest.runAllTimersAsync()` en los tests que hacen polling.

### E4b: JobOrchestrator — status mapping y error handling (2 tests)
- `getJobSummary` retorna `status: 'running'` pero test espera `'processing'`
  → el facade debe mapear estados del servicio a estados de UI
- `getJobSummary` no propaga errores cuando el servicio falla
  → debe hacer throw en lugar de swallow the error
