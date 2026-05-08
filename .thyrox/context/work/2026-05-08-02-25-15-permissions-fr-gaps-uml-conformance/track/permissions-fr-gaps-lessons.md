```yml
created_at: 2026-05-08 03:53:51
project: THYROX
work_package: 2026-05-08-02-25-15-permissions-fr-gaps-uml-conformance
phase: Phase 11 — TRACK/EVALUATE
author: NestorMonroy
status: Aprobado
```

# Lessons Learned — permissions-fr-gaps-uml-conformance

## L-001: `__esModule: true` en mocks de jest.mock factories

**Contexto:** El mock de `accessGateway` usaba el patrón `{ default: {...} }` sin
`__esModule: true`. Esto causó que `import accessService from '...'` en el componente
NO desenvuelva el `default` — Babel's interop solo lo hace cuando `__esModule: true`
está presente. Resultado: `accessService.getGroupCascadeImpact` era `undefined`,
activando el catch block silenciosamente.

**Síntoma:** Tests que verifican textos condicionales (ej. "Sin impacto cascade")
pasaban por la razón incorrecta (catch block → count=0), mientras que spy assertions
(`toHaveBeenCalledWith`) mostraban 0 calls consistentemente.

**Fix:** Agregar `__esModule: true` al objeto devuelto por la factory de `jest.mock`
cuando el módulo usa `export default`. Esto aplica a TODOS los mocks de módulos con
default exports en este proyecto.

**Patrón correcto:**
```javascript
jest.mock('../path/to/module', () => ({
  __esModule: true,          // ← obligatorio para default exports
  default: {
    methodA: jest.fn(),
    methodB: jest.fn(),
  },
}))
```

## L-002: Spy assertions verifican el flujo real; text assertions pueden ser engañosas

Verificar únicamente texto en el DOM no distingue entre:
- El texto aparece por el flujo correcto (mock llamado, state actualizado)
- El texto aparece por el flujo de error/catch (mock no llamado, state defaults)

Agregar `expect(mockFn).toHaveBeenCalledWith(...)` como assertion paralela protege
contra falsos positivos donde el test pasa por razones incorrectas.

## L-003: Debugging loop: señal de que el approach es incorrecto

Después de 8+ intentos fallidos de hacer funcionar el mismo test con pequeñas
variaciones, el problema era estructural (mock mal configurado), no de timing.
La señal correcta para parar el loop: cuando el mismo assertion falla sistemáticamente
a pesar de cambios superficiales → cuestionar el premise del test, no los detalles.

## L-004: `await act(async () => {})` como drain de microtask queue

El patrón `await act(async () => {})` (sin contenido) sirve para drenar el queue
de microtasks de React después de un `fireEvent` que dispara operaciones async.
Útil cuando se verifica estado post-async sin `waitFor` (que es más lento y verboso
para assertions simples post-drain).

## Métricas finales del WP

- Tests totales después del WP: 1820 (verificado con `npx jest --no-coverage`)
- Commits: 3 (GAP-3/4/6, GAP-1/2/5 main + commit de cierre)
- Tiempo de sesión: ~2h (incluyendo loop de debugging del mock)
- Gaps cerrados: 6/6 (T-001..T-025 completos)
