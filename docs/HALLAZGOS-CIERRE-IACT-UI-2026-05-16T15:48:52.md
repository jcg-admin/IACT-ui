# HALLAZGOS-CIERRE-IACT-UI-2026-05-16T15:48:52

**Documento:** HALLAZGOS-CIERRE-IACT-UI-2026-05-16T15:48:52  
**Fecha:** 2026-05-16  
**Repositorio:** IACT-ui  
**Commit:** 0542cc0  
**Contexto:** Resolución de la deuda técnica residual documentada en FASE 8

---

## Antecedente

Al cerrar FASE 8 quedó documentada una deuda técnica residual:

> `Home.jsx` pendiente de consolidar con `src/app/App.jsx` — requiere
> decisión de arquitectura sobre el sistema paralelo.

El motivo para no resolverla en FASE 8 fue que `Home.jsx` tenía un dependiente
real (`src/app/App.jsx`) y eliminarla de forma aislada habría roto ese sistema.

---

## Análisis del sistema paralelo

La lectura completa de los archivos involucrados reveló:

**`src/pages/Home.jsx`** — thin wrapper sin lógica propia:

```jsx
const HomeModule = lazy(() => import('@modules/home/HomeModule'))

function Home() {
  return (
    <div className="page-container">
      <Suspense fallback={<div>Cargando modulo...</div>}>
        <HomeModule />
      </Suspense>
    </div>
  )
}
```

El componente no añade nada sobre `HomeModule` excepto un `div.page-container`
y el `Suspense`. No hay lógica de negocio, props, ni estado local.

**`src/app/App.jsx`** — sistema de entrada paralelo con propósito claro:

El sistema paralelo (`src/index.jsx` → `src/app/App.jsx`) NO es un prototipo
ni código abandonado. Tiene tests propios (`App.test.jsx`, 4 tests), usa hooks
especializados (`useAppConfig`, `useHealthStatus`, `useMockMetrics`) y su
propósito es mostrar el estado del backend y los datos mock en un layout
alternativo (`MainLayout`).

**Decisión arquitectónica:** el sistema paralelo se conserva porque tiene
propósito y cobertura. Lo que se elimina es el intermediario innecesario.

---

## Corrección aplicada

`src/app/App.jsx` refactorizado para importar `HomeModule` directamente:

```jsx
// Antes:
import { useEffect } from 'react'
import Home from '../pages/Home'
// ...
return (
  <MainLayout ...>
    <Home />
  </MainLayout>
)

// Después:
import { useEffect, lazy, Suspense } from 'react'
const HomeModule = lazy(() => import('@modules/home/HomeModule'))
// ...
return (
  <MainLayout ...>
    <Suspense fallback={<div>Cargando módulo...</div>}>
      <HomeModule />
    </Suspense>
  </MainLayout>
)
```

`src/pages/Home.jsx` eliminado. Sin dependientes residuales.

---

## Verificaciones

| Verificación | Resultado |
|---|---|
| Referencias a `pages/Home` en toda la base de código | 0 |
| Tests `App.test.jsx` | 4 passed (sin regresiones) |
| Suite completa | 2377 passed, 0 failed |

---

## Estado final IACT-ui — deuda técnica CERO

```
npx jest --no-coverage → 2377 passed, 0 failed
Deuda técnica residual: 0
```

### Resumen de todas las fases ejecutadas

| Fase | DTs resueltas | Commits | Tests delta |
|---|---|---|---|
| FASE 1 | DT-UI-001, DT-UI-009 | 2 | +14 |
| FASE 2 | DT-UI-002, DT-UI-004 | 2 | 0 |
| FASE 3 | DT-UI-005, DT-UI-006 | 2 | −3 |
| FASE 4 | DT-UI-003, DT-UI-007, DT-UI-008, W-004 | 2 | 0 |
| FASE 5 | W-001 (50 componentes) | 6 | 0 |
| FASE 6 | W-002 | 2 | 0 |
| FASE 7 | W-003 (17 casos) | 2 | 0 |
| FASE 8 | DT-UI-010 (parcial) | 2 | 0 |
| Cierre | DT-UI-010 (residual Home.jsx) | 1 | 0 |
| **Total** | **14 DTs + 4 warnings** | **21** | **+11** |

### Hallazgos documentados

| Código | Fase | Descripción |
|---|---|---|
| H-F1-001 | 1 | Bug 3 no documentado: error renderizado como objeto React |
| H-F1-002 | 1 | Test de fallo confirma comportamiento correcto del slice |
| H-F1-003 | 1 | alertsPages.test.jsx usa mock con selectSuccess obsoleto |
| H-F2-001 | 2 | buildShareUrl: firma distinta entre local y utils/ |
| H-F2-002 | 2 | Tests de reportes no verifican la URL generada |
| H-F3-001 | 3 | currentUser puede ser null antes del login |
| H-F3-002 | 3 | Tests de AppRouter no verifican contenido de userInfo |
| H-F3-003 | 3 | navigation.js creado en T2.6 pero nunca conectado al store |
| H-F4-001 | 4 | eslint-disable-file para archivos cuyo propósito es logging |
| H-F4-002 | 4 | permisos-client.ts no estaba en el plan |
| H-F4-003 | 4 | Guards NODE_ENV no rompen tests (NODE_ENV=test ≠ 'production') |
| H-F5-001 | 5 | Import PropTypes insertado en medio de bloque multilínea |
| H-F5-002 | 5 | Archivos sin ningún import de una sola línea |
| H-F5-003 | 5 | Subcomponentes internos requieren PropTypes propios |
| H-F5-004 | 5 | UserList (features) no recibe props — UserModal sí |
| H-F6-001 | 6 | 10 de 13 casos del plan eran falsos positivos |
| H-F7-001 | 7 | 4 casos del plan ya eran correctos |
| H-F7-002 | 7 | Criterio eslint-disable vs corrección estructural |
| H-F8-001 | 8 | Sistema de entrada paralelo descubierto |
| H-Cierre | Cierre | Home.jsx era thin wrapper eliminable sin pérdida de funcionalidad |

---

*Generado: 2026-05-16T15:48:52 | Commit: 0542cc0 | Suite: 2377 passed*  
*IACT-ui — Deuda técnica: CERO*
