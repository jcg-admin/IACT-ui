# HALLAZGOS-FASE3-IACT-UI-2026-05-16T13:57:27

**Documento:** HALLAZGOS-FASE3-IACT-UI-2026-05-16T13:57:27  
**Fecha:** 2026-05-16  
**Repositorio:** IACT-ui  
**Commit:** cdfca0d  
**Plan base:** PLAN-IMPL-IACT-UI-2026-05-16T13:29:38.md — FASE 3

---

## Estado antes de FASE 3

```
npx jest --no-coverage → 2380 passed, 0 failed
src/redux/slices/navigation.js: 55 líneas — no registrado en store, sin consumidores
src/router/AppRouter.jsx: userInfo hardcodeado con datos ficticios
  name: 'John Doe', email: 'john.doe@example.com', avatar_url: 'via.placeholder.com/40'
```

---

## Tareas ejecutadas

### T3.1 — Auditoría exhaustiva antes de eliminar

Comandos ejecutados para confirmar que nadie consume el slice:

```bash
# En src/ (componentes, hooks, páginas, services)
grep -rn "fetchNavigationMenu|fetchNavigationModules|selectNavMenu|
  selectNavModules|selectNavLoading|selectNavError|clearNavError|
  from.*slices/navigation" src/ --include="*.jsx|*.js|*.ts|*.tsx"
# → 0 líneas

# En __tests__/ (excluyendo el propio test del slice)
grep -rn "fetchNavigationMenu|..." __tests__/ | grep -v navigationSlice.test.js
# → 0 líneas

# En store.js
grep "navigation" src/redux/store.js
# → 0 líneas
```

Resultado: **0 consumidores en toda la base de código** (fuera del propio slice
y su test). La eliminación es segura.

---

### T3.2 — Eliminación de `navigation.js` y su test

```bash
git rm src/redux/slices/navigation.js
git rm __tests__/slices/navigationSlice.test.js
```

Estado de la suite tras la eliminación: **2377 passed** (−3 tests que
pertenecían al slice eliminado, correcto).

---

### T3.3 — Conectar `selectUser` al `DashboardLayout` en `AppRouter.jsx`

**Cambio 1 — import:**
```js
// Antes:
import { selectIsAuthenticated } from '@store/selectors'

// Después:
import { selectIsAuthenticated, selectUser } from '@store/selectors'
```

**Cambio 2 — añadir `currentUser` en `RoutesWithTransitions()`:**
```js
const currentUser = useSelector(selectUser)
```

**Cambio 3 — reemplazar `userInfo` hardcodeado:**
```jsx
// Antes:
userInfo={{
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar_url: 'https://via.placeholder.com/40',
}}

// Después:
userInfo={{
  name:       currentUser?.name       ?? '',
  email:      currentUser?.email      ?? '',
  avatar_url: currentUser?.avatar_url ?? '',
}}
```

---

## Hallazgos durante la implementación

### H-F3-001 — El estado `user` es `null` antes del login

**Origen del análisis:** al leer `auth.js`, el `initialState` tiene `user: null`.
El `loginUser.fulfilled` es quien asigna el objeto de usuario al store.

Si `currentUser` es `null` (estado antes del login o durante la carga),
el opcional chaining sin protección habría causado errores. Los optional
chaining (`currentUser?.name`) combinados con el operador `?? ''` aseguran
que `userInfo` siempre recibe strings vacíos en lugar de `undefined` o
`null`, que romperían `PropTypes` del `DashboardLayout`.

El layout vive dentro de `AuthGuard`, que redirige a `/login` si el usuario
no está autenticado. Sin embargo, existe una ventana temporal entre que el
usuario se autentica y que `loginUser.fulfilled` actualiza el store donde
`currentUser` podría ser temporalmente `null`. Los optional chaining cubren
ese caso sin necesidad de un guard adicional.

---

### H-F3-002 — El test de AppRouter no verifica el contenido de `userInfo`

Los 37 tests de `AppRouter.test.jsx` pasan sin modificaciones porque el test
mockea `DashboardLayout` completo:

```js
jest.mock('../../layouts/DashboardLayout', () => ({
  DashboardLayout: ({ children }) => <div data-testid="layout">{children}</div>,
}))
```

El mock descarta `userInfo` — el test verifica rutas y guards, no el contenido
del layout. Esto significa que si se pasa `userInfo` con datos incorrectos, el
test no lo detecta.

El comportamiento correcto (`currentUser` del store) se verifica visualmente
en el entorno de desarrollo, no por tests automatizados. Queda documentado como
gap de cobertura para una iteración futura: un test de integración que verifique
que `DashboardLayout` recibe el nombre del usuario autenticado después del login.

No se añade ahora porque está fuera del alcance de FASE 3.

---

### H-F3-003 — `navigation.js` fue creado en T2.6 pero nunca conectado al store

El comentario en la cabecera del slice decía:
```
navigation.slice — IACT v2 (nuevo)
Sincronizado con navigationGateway.js (T2.6).
```

El slice fue implementado correctamente (thunks, reducers, selectors) y
tiene un test propio que pasa. El problema es que nunca se añadió al
`configureStore` en `src/redux/store.js`. El diseño original de navegación
dinámica (UC_PERM_08) no llegó a implementarse en los componentes.

La eliminación del slice y su test es la decisión correcta. Mantener código
muerto que "pasa sus tests" da una falsa sensación de completitud. Si el
navegador dinámico se implementa en el futuro, se creará el slice en ese
contexto con todos sus consumidores conectados desde el principio.

---

## Verificaciones realizadas (T3.4)

| Verificación | Resultado |
|---|---|
| 1. `navigation.js` eliminado | `ls src/redux/slices/navigation.js` → no existe |
| 2. `navigationSlice.test.js` eliminado | `ls __tests__/slices/...` → no existe |
| 3. `John Doe` / `via.placeholder` eliminados | `grep` en AppRouter.jsx → 0 líneas |
| 4. `selectUser` + `currentUser` presentes | L32, L272, L306-L308 confirmados |
| 5. Tests AppRouter | 37 passed (sin variación) |
| 6. Suite completa | 2377 passed, 0 failed |

---

## Estado después de FASE 3

```
npx jest --no-coverage → 2377 passed, 0 failed
  Variación vs FASE 2: −3 (tests del navigationSlice eliminados — correcto)

git diff --stat HEAD~1:
  __tests__/slices/navigationSlice.test.js | 35 --------------------  (eliminado)
  src/redux/slices/navigation.js           | 55 -------------------------------- (eliminado)
  src/router/AppRouter.jsx                 |  9 +++---
  3 files changed, 5 insertions(+), 94 deletions(-)
```

### Deudas técnicas resueltas

| DT | Descripción | Estado |
|---|---|---|
| DT-UI-005 | Slice `navigation.js` no registrado — código muerto | Resuelto |
| DT-UI-006 | `userInfo` hardcodeado en `AppRouter.jsx` | Resuelto |

---

*Generado: 2026-05-16T13:57:27 | Commit: cdfca0d | Suite: 2377 passed*
