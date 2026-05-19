```yml
created_at: 2026-05-05 22:50:40
project: IACT-UI
work_package: 2026-05-05-22-50-40-spinner-components-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# DISCOVER — spinner-components-audit

## Contexto

**WP anterior:** `2026-05-05-22-24-51-ui-feedback-naming-and-loading` documentó el
criterio de uso de los dos spinners como parte de la estrategia de loading centralizado,
pero dejó fuera cualquier cambio a `AnimatedLoadingSpinner`. Este WP retoma ese hilo.

**Criterio ya documentado (heredado del WP anterior):**
- `LoadingSpinner` (CSS puro) → carga **inline** dentro de una sección
- `AnimatedLoadingSpinner` (Framer Motion) → carga de **página completa** o transición de ruta

---

## Objetivo

Auditar si los dos componentes de spinner están siendo usados correctamente en todo el
codebase, identificar inconsistencias, y decidir si hay mejoras de diseño necesarias
(naming, deduplicación de API, coordinación con React Router/Suspense).

---

## Inventario de componentes [PROVEN]

### `LoadingSpinner` — `src/components/shared/LoadingSpinner.jsx`

- API: `{ fullScreen, size, message, overlay }` (misma que `AnimatedLoadingSpinner`)
- Implementación: CSS puro (`className="spinner"`)
- `fullScreen` prop: presente en el componente pero **nunca usada en el codebase** [PROVEN]
- Usos en páginas: 12 (todas inline — tablas, listas, paneles)

### `AnimatedLoadingSpinner` — `src/components/animations/AnimatedLoadingSpinner.jsx`

- API: `{ fullScreen, size, message, overlay }` (misma que `LoadingSpinner`)
- Implementación: Framer Motion (`motion.div` con fade-in/fade-out + rotation)
- Props exportadas: `spinnerVariants`, `containerVariants` para uso externo
- Usos en codebase: 7 [PROVEN]

---

## Inventario de usos — AnimatedLoadingSpinner [PROVEN]

| Archivo | `fullScreen` | Contexto | ¿Correcto? |
|---------|:------------:|---------|:----------:|
| `AppRouter.jsx` — `RouteLoadingFallback` | `false` | Suspense fallback para rutas lazy | ✓ correcto |
| `LoginPage.jsx` | `true` (implícito) | Overlay durante login submit | ✓ correcto |
| `DashboardPage.jsx` | `false` (default) | Loading del dashboard entero | ✓ correcto |
| `FormStepper.jsx` | `false` explícito | Loading durante submit de form | **⚠ inconsistente** |

### Hallazgo principal: `FormStepper.jsx` viola el criterio

`FormStepper` usa `<AnimatedLoadingSpinner fullScreen={false} size="md" message="Processing..."/>`
en un contexto inline (dentro del stepper, no es transición de página). Por el criterio
documentado, ese uso debería ser `<LoadingSpinner>`.

**Impacto UX:** Framer Motion se carga innecesariamente en el contexto de un formulario.
La animación de fade-in/out tiene sentido para transiciones de página; en un stepper inline
genera un efecto visual más pesado de lo necesario.

---

## Hallazgos de diseño [PROVEN + INFERRED]

### H-001: API duplicada entre ambos componentes [PROVEN]

Ambos componentes exponen exactamente las mismas props:
`{ fullScreen, size, message, overlay }`

Esto crea dos problemas:
1. Un desarrollador nuevo no sabe cuál usar — tienen la misma firma
2. `LoadingSpinner.fullScreen` es dead code (existe la prop, nadie la usa)

**Evidencia:** `grep -rn "LoadingSpinner.*fullScreen\|fullScreen.*LoadingSpinner" src/` = 0 resultados
(excluyendo tests y la definición del componente).

### H-002: `LoadingSpinner.overlay` es dead code [PROVEN]

La prop `overlay` en `LoadingSpinner` nunca se usa en el codebase. Solo existe
en `AnimatedLoadingSpinner` donde sí tiene efecto (controla el background oscuro
del overlay fullScreen).

### H-003: `AnimatedLoadingSpinner` no está conectado a React Router [INFERRED]

`AppRouter` usa `<Suspense fallback={<RouteLoadingFallback />}>` manualmente en cada
ruta. No hay un mecanismo automático para transiciones de página — cada ruta requiere
su propio `<Suspense>`. Esto es correcto para lazy loading, pero podría mejorarse con
un wrapper de route transition.

**Nota:** Esta mejora es opcional — el patrón actual es correcto y funciona. No hay bug.

### H-004: `DashboardPage` usa `AnimatedLoadingSpinner` sin `fullScreen` [INFERRED]

`DashboardPage` usa `<AnimatedLoadingSpinner message="Cargando dashboard..."/>` (fullScreen=false).
Esto es correcto por el criterio (página completa del dashboard), pero el componente
renderiza como inline (no ocupa toda la pantalla). Si la intención era un overlay de
página, debería ser `fullScreen`.

Verificar intent con el criterio: ¿es "transición de página" o "inline dentro del dashboard"?

---

## Stakeholders

| Rol | Necesidad |
|-----|-----------|
| Desarrolladores | Saber cuál spinner usar sin ambigüedad |
| Usuarios finales | Consistencia visual: animaciones pesadas solo donde tienen sentido |
| Mantenedores | Dead code eliminado, API limpia |

---

## Restricciones

- `AnimatedLoadingSpinner` y `LoadingSpinner` son componentes estables — cualquier cambio
  de API debe ser retrocompatible o actualizar todos los callsites en el mismo commit
- Framer Motion ya es dependencia del proyecto — no hay costo de añadirla, pero sí de
  usarla innecesariamente (bundle size en componentes que no necesitan animación)
- WP anterior (`ui-feedback-naming-and-loading`) está en curso — no modificar los
  archivos en su scope hasta que ese WP cierre

---

## Criterios de éxito

- [ ] Todos los usos de `AnimatedLoadingSpinner` respetan el criterio documentado
- [ ] Dead code eliminado (`fullScreen` y `overlay` en `LoadingSpinner` si no se usan)
- [ ] Criterio de elección visible en el componente (JSDoc o nombre más explícito)
- [ ] `FormStepper` usa el spinner correcto
- [ ] 0 regresiones en tests existentes

---

## Fuera de alcance

- Coordinación automática con React Router (mejora opcional — no hay bug)
- Migración de `LoadingSpinner` inline a `loadingMiddleware` (ya en scope del WP anterior)
- Cambios a `AnimatedLoadingSpinner` que afecten el WP anterior en ejecución

---

## Tamaño estimado

**Pequeño** — fases 1, 3, 10, 11. Los cambios son mecánicos: corregir 1 uso incorrecto
en `FormStepper`, limpiar dead code en `LoadingSpinner`, actualizar JSDoc del criterio.

---

## Stopping Point Manifest

| ID | Fase | Tipo | Evento | Acción requerida |
|----|------|------|--------|-----------------|
| SP-01 | 1→3 | gate-fase | Phase 1 completa | Confirmación del ejecutor antes de DIAGNOSE |
| SP-02 | 3→10 | gate-fase | Phase 3 completa | Confirmación del ejecutor antes de IMPLEMENT |
| SP-03 | 10→11 | gate-fase | Phase 10 completa | Validar build + tests antes de TRACK |
