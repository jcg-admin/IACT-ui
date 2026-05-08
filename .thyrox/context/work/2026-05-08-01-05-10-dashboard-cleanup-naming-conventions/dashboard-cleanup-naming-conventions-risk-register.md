```yml
project: IACT-UI
work_package: 2026-05-08-01-05-10-dashboard-cleanup-naming-conventions
created_at: 2026-05-08 01:05:10
updated_at: 2026-05-08 01:05:10
current_phase: Phase 1 — DISCOVER
open_risks: 5
mitigated_risks: 0
closed_risks: 0
author: NestorMonroy
```

# Risk Register — dashboard-cleanup-naming-conventions

## Matriz de riesgos

| ID | Descripción | Probabilidad | Impacto | Severidad | Estado |
|----|-------------|:---:|:---:|:---:|--------|
| R-01 | `useDashboard.js` auto-refresh a 10s puede causar flood de requests si el endpoint real es lento | Media | Medio | media | abierto |
| R-02 | Rename de `alertManager.js` → `alertsGateway.js` rompe el import en `alertsSlice.js` y en `alertManager.test.js` | Alta | Bajo | baja | abierto |
| R-03 | `SessionManager.jsx` rename a `SessionGuard.jsx` puede confundir — el componente provee SessionContext (es un Provider, no un Guard) | Media | Medio | media | abierto |
| R-04 | `cloneUtils.js` rename afecta 3 consumidores internos — si se olvida uno el build silencia el error hasta runtime | Alta | Medio | alta | abierto |
| R-05 | HAL-6 (naming sistémico) puede filtrarse al scope del WP — riesgo de scope creep que bloquea la entrega | Media | Alto | alta | abierto |

---

## Detalle de riesgos

### R-01: `useDashboard.js` flood de requests al conectar endpoint real

**Descripción**

`useDashboard` tiene auto-refresh hardcodeado a 10000ms. Con datos mock el delay era
simulado (500ms setTimeout). Con endpoint real, si el servidor tarda >10s, se acumularían
requests en vuelo simultáneos.

**Probabilidad**: media · **Impacto**: medio · **Severidad**: media
**Estado**: abierto · **Fase**: Phase 1

**Señales de alerta**
- Múltiples requests a `/api/reports/metrics/dashboard/` visibles en Network tab simultáneamente
- Estado `loading` que nunca se resetea a `false`

**Mitigación**
- En Phase 3 ANALYZE: decidir si `useDashboard` sigue siendo necesario (si `Dashboard.jsx`
  se migra a `reportsSlice`, el hook se puede deprecar y el riesgo desaparece)
- Si se mantiene: agregar guard `if (loading) return` antes de despachar nuevo fetch

**Plan de contingencia**
- Si el flood ocurre en tests: mockear con `jest.useFakeTimers()` para controlar el intervalo

---

### R-02: Rename `alertManager.js` rompe imports

**Descripción**

`alertsSlice.js:8` importa con path relativo `'../../services/alertManager'`.
El test `alertManager.test.js` también hace referencia al filename actual.

**Probabilidad**: alta (rename es disruptivo por definición) · **Impacto**: bajo (solo 1 consumidor)
**Severidad**: baja · **Estado**: abierto · **Fase**: Phase 1

**Señales de alerta**
- Jest `Cannot find module '../../services/alertManager'` tras el rename

**Mitigación**
- Actualizar el import en `alertsSlice.js` en el mismo commit que el rename
- Actualizar el path en `alertManager.test.js` → `alertsGateway.test.js`
- Verificar `services/index.js` — re-exporta `alertManager` exports

**Plan de contingencia**
- Si se olvida un import: `grep -rn "alertManager"` post-rename detecta los rezagados

---

### R-03: `SessionManager.jsx` → `SessionGuard.jsx` — nombre semánticamente incorrecto

**Descripción**

`SessionManager` es un React Context Provider que gestiona el ciclo de vida de sesión
(checkSession, setIsAuthenticated, SessionContext). Un "Guard" en frontend convencional
es un componente que bloquea acceso si la condición no se cumple. `SessionManager` hace
ambas cosas (provider + lógica de validación), pero el rol principal es de provider.

**Probabilidad**: media (el nombre Guard puede ser semánticamente cuestionable)
**Impacto**: medio (puede confundir a futuros desarrolladores)
**Severidad**: media · **Estado**: abierto · **Fase**: Phase 1

**Señales de alerta**
- Revisión de código que cuestiona el nombre "Guard" cuando el componente renderiza children incondicionalmente durante loading

**Mitigación**
- En Phase 3: evaluar alternativas: `SessionLifecycleProvider`, `SessionProvider`, `AuthenticationProvider`
- `SessionProvider` describe el rol exacto (provider del contexto de sesión) sin implicar blocking

**Plan de contingencia**
- Si el nombre `SessionGuard` genera confusión post-rename: el rename es una línea — se puede corregir en el mismo WP

---

### R-04: `cloneUtils.js` rename deja consumidores rotos silenciosamente

**Descripción**

Tres archivos importan `cloneData` desde `cloneUtils.js` con paths distintos
(`./utils/cloneUtils`, `@services/utils/cloneUtils`, `./cloneUtils`). Si uno se olvida,
el build puede pasar (si no se ejercita ese módulo en el test) pero falla en runtime.

**Probabilidad**: alta · **Impacto**: medio · **Severidad**: alta
**Estado**: abierto · **Fase**: Phase 1

**Señales de alerta**
- `Cannot find module '*/cloneUtils'` en jest output después del rename

**Mitigación**
- Ejecutar `grep -rn "cloneUtils"` inmediatamente después del rename para verificar 0 hits
- Los 3 consumidores se actualizan en el mismo commit

**Plan de contingencia**
- `grep -rn "cloneUtils" src/` como step de verificación en el task plan antes del commit

---

### R-05: Scope creep de HAL-6 (naming sistémico) ingresa al WP

**Descripción**

El doc `CLEAN_CODE_NAMING_PRINCIPLES — Frontend` prohíbe sufijos que afectan 100+ archivos
(`*Page`, `*Slice`, `*Service`, aliases de Webpack). Si durante la ejecución se empieza
a renombrar items de HAL-6 "ya que estamos", el WP pierde foco y el riesgo de
regressions se vuelve inaceptable.

**Probabilidad**: media · **Impacto**: alto · **Severidad**: alta
**Estado**: abierto · **Fase**: Phase 1

**Señales de alerta**
- Task plan incluye T-NNN para renombrar `*Page` o `*Slice` files
- Commit message menciona renaming de `authSlice`, `reportsSlice` u otros slices de producción

**Mitigación**
- HAL-6 está explícitamente fuera de scope en el analysis document
- Las deudas sistémicas se registran como TD-NM-001..006 para WPs futuros
- Phase 8 PLAN EXECUTION: revisar que task plan no incluya items de HAL-6

**Plan de contingencia**
- Si se empieza a trabajar en HAL-6: STOP, crear nuevo WP separado

---

## Checklist de gestión

- [x] Riesgos identificados en Phase 1 antes de planificar
- [x] Cada riesgo tiene señales de alerta definidas
- [x] Cada riesgo tiene plan de contingencia
- [ ] Registro actualizado al final de cada fase
- [ ] Riesgos materializados referenciados en `context/errors/`
