```yml
created_at: 2026-05-05 22:29:27
project: IACT-UI
work_package: 2026-05-05-22-24-51-ui-feedback-naming-and-loading
phase: Phase 3 — DIAGNOSE
author: NestorMonroy
status: Borrador
```

# Naming Analysis — ApiErrorToast y el sistema de feedback

## Causa raíz del smell

**¿Por qué `ApiErrorToast` es un mal nombre?**

| Why | Respuesta |
|-----|-----------|
| 1º ¿Por qué hay confusión? | Porque "Toast" nombra la presentación (pop-up efímero en esquina), no la intención |
| 2º ¿Por qué eso es un problema? | Porque ya existe `ToastContext/Toast/ToastContainer` — otro sistema que SÍ usa el patrón Toast de UI |
| 3º ¿Por qué coexisten dos sistemas con "Toast"? | El componente nuevo fue nombrado siguiendo el patrón del componente que reemplazó (`GlobalErrorToast`) sin revisar el namespace existente |
| 4º ¿Por qué importa? | Un desarrollador nuevo no sabe si `ApiErrorToast` usa `ToastContext` (no lo usa) o es independiente |
| 5º Causa raíz | Naming por analogía visual en lugar de naming por intención de dominio |

**Clean Code cap. 2 — reglas violadas:**
- *"Use Intention-Revealing Names"*: `Toast` revela implementación, no intención
- *"Avoid Disinformation"*: `ApiErrorToast` sugiere que es un Toast del sistema Toast existente
- *"Make Meaningful Distinctions"*: dos sistemas con "Toast" no se distinguen por propósito

## Mapa del namespace actual [PROVEN]

```
src/
├── context/
│   └── ToastContext.jsx          ← Sistema A: notificaciones UI (success/info/warning)
├── components/
│   ├── shared/Toast/
│   │   ├── Toast.jsx             ← Sistema A: elemento visual individual
│   │   └── ToastContainer.jsx    ← Sistema A: lista de toasts activos
│   └── feedback/
│       ├── ApiErrorToast.jsx     ← Sistema B: errores HTTP del errorSlice (Redux)
│       └── ServerErrorBanner.jsx ← Sistema B: errores 502/503 persistentes
```

**Sistema A** — `ToastContext`: notificaciones efímeras de UI iniciadas por el usuario
(`addToast("CSV exportado")`, `addToast("Usuario eliminado")`). Estado: local en Context.

**Sistema B** — `ApiErrorToast`: errores HTTP del middleware Redux. Estado: en `errorSlice`.
No usa `ToastContext`. No comparten nada salvo el concepto visual de "aparece y desaparece".

La ambigüedad es real: el nombre `ApiErrorToast` sugiere que pertenece al Sistema A.

## Evaluación de candidatos [PROVEN — verificado con grep]

Todos los candidatos tienen **0 referencias** en el codebase — ninguno colisiona.

| Candidato | Claridad de intención | Consistencia con `ServerErrorBanner` | Longitud | Veredicto |
|-----------|----------------------|--------------------------------------|----------|-----------|
| `ApiErrorNotification` | Alta — "Notification" es dominio, no presentación | Media — `Banner` ≠ `Notification` pero ambos son feedback | Larga | Válido |
| `HttpErrorAlert` | Alta — `Alert` es término ARIA estándar (ya usa `role="alert"`) | Media | Media | **Preferido** |
| `ErrorAlert` | Media — ambiguo (¿qué tipo de error?) | Media | Corta | Aceptable |
| `ApiErrorAlert` | Alta — `Api` aclara origen, `Alert` aclara rol ARIA | Alta — `Alert` ≠ `Banner` pero son presentaciones distintas | Media | **Preferido** |
| `ErrorFeedback` | Media — "Feedback" es muy genérico | Baja | Corta | Descartado |

### Ganador recomendado: `ApiErrorAlert`

**Razones:**
1. `Api` mantiene el origen del error (errores de API HTTP, no errores de UI)
2. `Alert` es semánticamente correcto — el componente ya usa `role="alert"` en el DOM
3. No colisiona con nada existente (0 refs verificado)
4. Consistente con `ServerErrorBanner`: ambos son del Sistema B (feedback de errores HTTP)
5. Elimina completamente la ambigüedad con `ToastContext` (Sistema A)

### Impacto del renombre [PROVEN]

Puntos a actualizar (verificado con grep):

| Archivo | Cambio |
|---------|--------|
| `src/components/feedback/ApiErrorToast.jsx` | Renombrar archivo + función export |
| `src/App.jsx` | Actualizar import + JSX tag |
| `src/components/feedback/__tests__/ApiErrorToast.test.jsx` | Renombrar archivo + import + describe strings |
| `src/components/feedback/__tests__/ServerErrorBanner.test.jsx` | Un comentario en test string |
| `src/styles/iact-ui-kit.scss` | Comentario en línea 80 |
| `src/styles/components/_feedback.scss` | Comentario en línea 4 |

**CSS classes** (`.api-error-toast`, `.api-error-toast--danger`, etc.): se pueden
mantener o renombrar. Recomendación: renombrar a `.api-error-alert` en el mismo commit
para coherencia total. Son clases internas, no CSS API pública.

**Total:** 6 archivos, ~15 líneas. Cambio de bajo riesgo y alta claridad.

## ¿Qué hacer con `ServerErrorBanner`?

`ServerErrorBanner` describe correctamente su comportamiento:
- `Server` → 5xx errores de servidor
- `Error` → es un error
- `Banner` → es un banner persistente (no desaparece hasta dismiss manual)

No viola Clean Code. **No requiere renombre.**

## Decisión recomendada

```
ApiErrorToast  →  ApiErrorAlert
```

El directorio `src/components/feedback/` se mantiene. El Sistema A (`ToastContext`) 
no se toca. La distinción queda clara:

```
feedback/ApiErrorAlert.jsx     ← errores HTTP Redux (role="alert", efímero)
feedback/ServerErrorBanner.jsx ← errores 502/503 Redux (banner persistente)
context/ToastContext.jsx       ← notificaciones UI (success/info/warning)
```
