# HALLAZGOS-IMPLEMENTACION-PENDIENTES-2026-05-16T15:55:12

**Documento:** HALLAZGOS-IMPLEMENTACION-PENDIENTES-2026-05-16T15:55:12  
**Fecha:** 2026-05-16  
**Repositorio:** IACT-ui  
**Commit:** 29200cc  
**Contexto:** Los hallazgos H-F1-003, H-F2-002 y H-F3-002 habían sido documentados
pero marcados como "fuera del alcance" de sus fases respectivas. Esta sesión los implementa.

---

## H-F1-003 — `alertsPages.test.jsx`: mock del slice desactualizado

**Problema:** el mock del slice `alerts` en `alertsPages.test.jsx` exponía
`selectSuccess` (que `AlertConfig.jsx` ya no importa desde FASE 1) y
no exponía `clearDryRunResult` (añadido en FASE 1).

El stub del reducer tenía `success: false` en el estado inicial, que ya no
es parte del estado observable desde `AlertConfig.jsx`.

**Corrección aplicada:**

```js
// Mock actualizado:
// - selectSuccess: eliminado
// + clearDryRunResult: jest.fn(() => ({ type: 'alerts/clearDryRunResult' }))

// Stub del reducer actualizado:
// - success: false  (eliminado)
// dryRunResult conservado
```

**Test nuevo añadido:**

```js
it('usa clearDryRunResult y NO importa selectSuccess (H-F1-003)', () => {
  const src = readFileSync('src/pages/alerts/AlertConfig.jsx', 'utf8')
  expect(src).toContain('clearDryRunResult')
  expect(src).not.toContain('selectSuccess')
  expect(src).not.toContain('setDryRunResult')
})
```

---

## H-F2-002 — `AgentsReportPage.test.jsx`: URL de share no verificada

**Problema:** el test existente solo verificaba que el botón "Compartir" existe.
No verificaba que `handleShare` llama a `buildShareUrl` con el `basePath` correcto
(`'/reports/agents'`) y no con el formato anterior (`'agents'`).

La corrección de FASE 2 (T2.1a) había cambiado la llamada de
`buildShareUrl('agents', filters)` a `buildShareUrl('/reports/agents', filters)`.
Sin un test que lo verifique, una regresión podría pasar desapercibida.

**Corrección aplicada:**

Mock de `reportShareUrl` añadido al archivo de test:

```js
jest.mock('../../../utils/reportShareUrl', () => ({
  buildShareUrl: jest.fn((basePath, filters) =>
    `https://example.com${basePath}?...`
  ),
}))
```

**Test nuevo añadido:**

```js
it('llama a buildShareUrl con basePath /reports/agents (H-F2-002)', async () => {
  const { buildShareUrl } = require('../../../utils/reportShareUrl')
  buildShareUrl.mockClear()
  wrapper(<AgentsReport />)
  await userEvent.click(screen.getByRole('button', { name: /compartir/i }))

  expect(buildShareUrl).toHaveBeenCalledWith(
    '/reports/agents',
    expect.objectContaining({ trimestre: expect.any(String), segmento: expect.any(String) })
  )
  expect(buildShareUrl).not.toHaveBeenCalledWith('agents', expect.anything())
})
```

---

## H-F3-002 — `AppRouter.test.jsx`: `userInfo` no verificado

**Problema:** el test de `AppRouter` mockeaba `DashboardLayout` completamente
(`({ children }) => <div data-testid="layout">{children}</div>`), por lo que
la corrección de FASE 3 (reemplazar `'John Doe'` por `selectUser`) no tenía
ninguna cobertura de tests. Una regresión podría restaurar los datos ficticios
sin que ningún test fallara.

**Corrección aplicada — dos tests nuevos:**

```js
describe('AppRouter — userInfo desde selectUser (H-F3-002)', () => {
  it('AppRouter.jsx importa selectUser y NO contiene datos ficticios hardcodeados', () => {
    const src = readFileSync('src/router/AppRouter.jsx', 'utf8')
    expect(src).toContain('selectUser')
    expect(src).toContain('useSelector(selectUser)')
    expect(src).not.toContain('John Doe')
    expect(src).not.toContain('john.doe@example.com')
    expect(src).not.toContain('via.placeholder.com')
  })

  it('userInfo usa optional chaining para proteger el caso user=null', () => {
    const src = readFileSync('src/router/AppRouter.jsx', 'utf8')
    expect(src).toContain("currentUser?.name")
    expect(src).toContain("currentUser?.email")
    expect(src).toContain("currentUser?.avatar_url")
    expect(src).toMatch(/currentUser\?\.name\s*\?\?\s*''/)
  })
})
```

---

## Verificaciones

| Verificación | Resultado |
|---|---|
| `alertsPages.test.jsx` | 10 passed (+1 test nuevo) |
| `AgentsReportPage.test.jsx` | 17 passed (+1 test nuevo) |
| `AppRouter.test.jsx` | 39 passed (+2 tests nuevos) |
| Suite completa | 2381 passed (+4), 0 failed |

---

## Estado final definitivo — IACT-ui

```
npx jest --no-coverage → 2381 passed, 0 failed
Hallazgos sin implementar: 0
Deuda técnica: CERO
```

| Métrica | Valor |
|---|---|
| Tests antes del plan | 2366 |
| Tests después | 2381 |
| Delta neto | +15 |
| Commits totales | 22 |
| Deuda técnica resuelta | 14 DTs + 4 warning categories |
| Hallazgos documentados | 20 |
| Hallazgos implementados | 17 (14 durante sus fases + 3 en esta sesión) |
| Hallazgos informativos (sin acción) | 3 |

---

*Generado: 2026-05-16T15:55:12 | Commit: 29200cc | Suite: 2381 passed*  
*IACT-ui — Deuda técnica: CERO — Hallazgos: TODOS IMPLEMENTADOS*
