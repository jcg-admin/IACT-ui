```yml
project: IACT-UI
work_package: 2026-05-05-22-24-51-ui-feedback-naming-and-loading
created_at: 2026-05-05 22:24:51
updated_at: 2026-05-05 22:29:27
current_phase: Phase 3 — DIAGNOSE
open_risks: 1
mitigated_risks: 2
closed_risks: 1
author: NestorMonroy
```

# Risk Register — ui-feedback-naming-and-loading

## Matriz de riesgos

| ID | Descripción | Probabilidad | Impacto | Severidad | Estado | Dueño |
|----|-------------|:------------:|:-------:|:---------:|--------|-------|
| R-001 | Renombre de `ApiErrorToast` rompe tests existentes | alta | medio | alta | abierto | NestorMonroy |
| R-002 | `loadingMiddleware` intercepta todos los `*/pending` y causa spinners indeseados en operaciones silenciosas | media | alto | alta | abierto | NestorMonroy |
| R-003 | Ambigüedad entre `ToastContext` y el componente renombrado — el nombre elegido colisiona con algo existente | baja | medio | baja | abierto | NestorMonroy |
| R-004 | Migración de slices existentes introduce regresión en páginas no migradas | media | alto | alta | abierto | NestorMonroy |

## Detalle de riesgos

### R-001: Renombre de `ApiErrorToast` rompe tests existentes

**Descripción**

El archivo `ApiErrorToast.test.jsx` recién creado (WP http-error-handling) y
el `App.jsx` que monta el componente referencian el nombre actual. Un renombre
sin actualizar todas las referencias deja el proyecto sin compilar.

**Probabilidad**: alta
**Impacto**: medio (reversible con git)
**Severidad**: alta
**Estado**: abierto
**Fase de identificación**: Phase 1

**Señales de alerta**
- `npx jest` falla con "Cannot find module 'ApiErrorToast'"
- `npm run build` emite error de import

**Mitigación**
- Hacer el renombre con `grep -rn ApiErrorToast src/` para listar todos los
  puntos de referencia antes de editar
- Commitear en un solo paso: rename archivo + actualizar todos los imports + test

**Plan de contingencia**
- `git revert` del commit de renombre si el build falla

| Fecha | Fase | Cambio | Autor |
|-------|------|--------|-------|
| 2026-05-05 | Phase 1 | Identificado | NestorMonroy |

---

### R-002: `loadingMiddleware` causa spinners en operaciones silenciosas

**Descripción**

Si el middleware intercepta todos los `*/pending` indiscriminadamente, operaciones
en background (polling, prefetch silencioso, refresh de token) mostrarán spinners
al usuario cuando no deberían. Esto es regresión UX.

**Probabilidad**: media
**Impacto**: alto
**Severidad**: alta
**Estado**: abierto
**Fase de identificación**: Phase 1

**Señales de alerta**
- Spinner aparece brevemente al navegar entre páginas sin acción del usuario
- Operaciones de autenticación (`refreshToken`) muestran spinner global

**Mitigación**
- Diseñar el middleware con lista de exclusiones (`ignoreActions: ['auth/refresh']`)
  o con opt-in explícito via metadatos en el action (`action.meta.showLoading = true`)
- Fase PILOT en una sola página antes de conectar globalmente

**Plan de contingencia**
- Usar opt-in en lugar de opt-out: solo acciones que declaren `meta.showLoading`
  activan el spinner

| Fecha | Fase | Cambio | Autor |
|-------|------|--------|-------|
| 2026-05-05 | Phase 1 | Identificado | NestorMonroy |

---

### R-003: Nombre elegido para reemplazar `ApiErrorToast` colisiona con algo existente

**Descripción**

El codebase tiene `ToastContext`, `Toast`, `ToastContainer`, `ErrorDisplay`,
`ApiErrorToast`, `ServerErrorBanner`. Cualquier candidato de renombre debe
verificarse contra todo el namespace para no introducir otra ambigüedad.

**Probabilidad**: baja
**Impacto**: medio
**Severidad**: baja
**Estado**: abierto
**Fase de identificación**: Phase 1

**Mitigación**
- En Phase 3 DIAGNOSE: verificar el nombre candidato con `grep -rn` antes de
  comprometerse

| Fecha | Fase | Cambio | Autor |
|-------|------|--------|-------|
| 2026-05-05 | Phase 1 | Identificado | NestorMonroy |

---

### R-004: Migración de slices rompe páginas no migradas

**Descripción**

Si se migra el loading de algunos slices al `loadingSlice` global pero otros
siguen con `loading` local, la transición parcial puede generar estado inconsistente
(spinner global activo + spinner local activo simultáneamente).

**Probabilidad**: media
**Impacto**: alto
**Severidad**: alta
**Estado**: abierto
**Fase de identificación**: Phase 1

**Mitigación**
- Definir en Phase 6 SCOPE si este WP migra TODOS los slices o solo hace el
  piloto con 1-2 páginas
- Si solo piloto: no tocar los slices existentes — el `loadingMiddleware` y
  `loadingSlice` son nuevos, no reemplazan nada aún

**Plan de contingencia**
- Scope conservador: implementar `loadingMiddleware` sin migrar los slices
  existentes. Las páginas nuevas usan el nuevo sistema; las antiguas mantienen
  su `loading` local hasta un WP dedicado a migración.

| Fecha | Fase | Cambio | Autor |
|-------|------|--------|-------|
| 2026-05-05 | Phase 1 | Identificado | NestorMonroy |

---

## Riesgos cerrados

*(Ninguno aún)*

## Checklist de gestión

- [x] Riesgos identificados en Phase 1 antes de planificar
- [x] Cada riesgo tiene señales de alerta definidas
- [x] Cada riesgo tiene plan de contingencia
- [ ] Registro actualizado al final de cada fase
- [ ] Riesgos materializados referenciados en `context/errors/`
