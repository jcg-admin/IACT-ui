# HALLAZGOS-FASE2-IACT-UI-2026-05-16T13:49:59

**Documento:** HALLAZGOS-FASE2-IACT-UI-2026-05-16T13:49:59  
**Fecha:** 2026-05-16  
**Repositorio:** IACT-ui  
**Commit:** 99bf11e  
**Plan base:** PLAN-IMPL-IACT-UI-2026-05-16T13:29:38.md — FASE 2

---

## Estado antes de FASE 2

```
npx jest --no-coverage → 2380 passed, 0 failed
ESLint errors en los 3 reportes:
  AgentsReport.jsx   L62: no-empty — catch (_) {}
  CampaignsReport.jsx L60: no-empty — catch (_) {}
  QueuesReport.jsx   L62: no-empty — catch (_) {}
buildShareUrl definida localmente en cada uno de los 3 archivos
  → DT-UI-004: función existía en src/utils/reportShareUrl.js sin uso
```

---

## Tareas ejecutadas

### T2.1a/b/c — Eliminar `buildShareUrl` local e importar desde `utils/`

En cada uno de los 3 archivos:
1. Añadido `import { buildShareUrl } from '../../utils/reportShareUrl'`
2. Eliminada la función local `buildShareUrl` (7 líneas por archivo, 21 en total)
3. Actualizada la llamada en `handleShare` (ver hallazgo H-F2-001)

### T2.2a/b/c — Corregir catch vacíos en `handleSaveView`

En cada uno de los 3 archivos:

```jsx
// Antes:
} catch (_) {}

// Después:
} catch (_) { /* guardar vista es opcional — fallo no interrumpe al usuario */ }
```

---

## Hallazgos durante la implementación

### H-F2-001 — Diferencia de firma entre `buildShareUrl` local y la de `utils/`

**Problema detectado antes de modificar el código — el plan no lo documentaba.**

La función local y la utilitaria tienen el mismo nombre pero **firmas distintas**:

**Función local (en los 3 componentes):**

```js
function buildShareUrl(reportType, filters = {}) {
  const params = new URLSearchParams(
    Object.fromEntries(Object.entries(filters).filter(([, v]) => v != null))
  )
  const query = params.toString()
  return `${window.location.origin}/reports/${reportType}${query ? '?' + query : ''}`
}
// Llamada: buildShareUrl('agents', filters)
// Resultado: http://host/reports/agents?trimestre=Q01_25&segmento=Nacional
```

**Función en `src/utils/reportShareUrl.js`:**

```js
export function buildShareUrl(basePath, filters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value != null) params.set(key, value)
  })
  const qs = params.toString()
  return `${window.location.origin}${basePath}${qs ? `?${qs}` : ''}`
}
// Llamada correcta: buildShareUrl('/reports/agents', filters)
// Resultado: http://host/reports/agents?trimestre=Q01_25&segmento=Nacional
```

**Diferencia 1 — primer parámetro:**

- Local: `reportType` — recibe `'agents'` y construye `/reports/${reportType}` internamente.
- Utils: `basePath` — recibe el path completo `/reports/agents`.

Si se hubiera importado `buildShareUrl` de utils sin actualizar la llamada:

```js
buildShareUrl('agents', filters)
// → http://host/agents?...   ← INCORRECTO (sin /reports/)
```

**Corrección aplicada:** las 3 llamadas en `handleShare` se actualizaron:

```js
buildShareUrl('agents', filters)    → buildShareUrl('/reports/agents', filters)
buildShareUrl('campaigns', filters) → buildShareUrl('/reports/campaigns', filters)
buildShareUrl('queues', filters)    → buildShareUrl('/reports/queues', filters)
```

**Diferencia 2 — criterio de filtrado (comportamiento ligeramente diferente):**

- Local: `filter(([, v]) => v != null)` — excluye `null` y `undefined`, incluye string vacío.
- Utils: `value !== '' && value != null` — excluye además el string vacío.

La utils es más estricta. Con los filtros actuales (`trimestre` y `segmento`
nunca son string vacío), el comportamiento final es idéntico. No requiere
ningún ajuste adicional.

---

### H-F2-002 — Los tests existentes no detectarían la URL incorrecta

Los tests de los 3 reportes (`AgentsReportPage.test.jsx`, etc.) verifican
que el botón "Compartir" existe y que el `ShareReportModal` se renderiza,
pero **no verifican la URL generada por `buildShareUrl`**. Si se hubiera
cometido el error de no actualizar el primer parámetro, los tests seguirían
pasando aunque la URL fuera incorrecta.

Este hallazgo queda documentado para considerarse en una futura iteración de
los tests de los reportes: añadir un test que verifique que `handleShare`
llama a `buildShareUrl` con el basePath correcto.

No se añade ahora porque FASE 2 tiene alcance acotado a los errores ESLint.

---

## Verificaciones realizadas (T2.3)

| Verificación | Resultado |
|---|---|
| 1. `function buildShareUrl` en los 3 archivos | 0 definiciones locales (esperado: 0) |
| 2. `catch (_) {}` en los 3 archivos | 0 bloques vacíos (esperado: 0) |
| 3. Import de `reportShareUrl` en los 3 archivos | `import=1` en cada uno |
| 4. Llamada con `/reports/` en basePath | Confirmada en los 3 archivos |
| 5. Tests de los 3 reportes | 46 passed, 0 failed (sin regresiones) |
| 6. Suite completa | 2380 passed, 0 failed |

---

## Estado después de FASE 2

```
npx jest --no-coverage → 2380 passed, 0 failed (sin variación — no se añadieron tests)
ESLint errors en los 3 reportes: 0
```

### Archivos modificados

| Archivo | Cambio neto |
|---|---|
| `src/pages/reports/AgentsReport.jsx`   | −8 líneas (−7 buildShareUrl, +1 import, actualización llamada) |
| `src/pages/reports/CampaignsReport.jsx` | −8 líneas |
| `src/pages/reports/QueuesReport.jsx`   | −8 líneas |

`git diff --stat`: 3 files changed, 9 insertions(+), 33 deletions(-)

### Deudas técnicas resueltas

| DT | Descripción | Estado |
|---|---|---|
| DT-UI-002 | catch vacíos en 3 reportes (ESLint error) | Resuelto |
| DT-UI-004 | `buildShareUrl` duplicada en 3 archivos | Resuelto |

---

*Generado: 2026-05-16T13:49:59 | Commit: 99bf11e | Suite: 2380 passed*
