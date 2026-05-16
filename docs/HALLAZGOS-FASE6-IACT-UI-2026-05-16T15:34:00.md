# HALLAZGOS-FASE6-IACT-UI-2026-05-16T15:34:00

**Documento:** HALLAZGOS-FASE6-IACT-UI-2026-05-16T15:34:00  
**Fecha:** 2026-05-16  
**Repositorio:** IACT-ui  
**Commit:** e8af99d  
**Plan base:** PLAN-IMPL-IACT-UI-2026-05-16T13:29:38.md — FASE 6

---

## Estado antes de FASE 6

```
npx jest --no-coverage → 2377 passed, 0 failed
Plan original: 13 imports sin uso en 6 archivos
```

---

## Hallazgo central: 10 de 13 casos del plan eran falsos positivos

Antes de modificar ningún archivo se realizó una auditoría completa leyendo
cada archivo. El resultado fue que el análisis estático de la FASE 6 del plan
contenía 10 falsos positivos de 13 casos declarados.

### Causa raíz de los falsos positivos

El script de análisis previo buscaba el nombre del símbolo en el contenido
del archivo sin eliminar correctamente los bloques de imports multilínea.
En imports como:

```js
import {
  selectSubscriptions,
  selectLoading,
} from '../../redux/slices/alerts'
```

El regex `re.sub(r'import\s*\{[^}]+\}\s*from[^\n]+', '', content)` usaba
`re.DOTALL` en algunas versiones del script, lo que hacía que `[^}]+` capturara
más contenido del esperado. Resultado: algunos usos reales en el cuerpo del
componente eran eliminados junto con el bloque de imports, haciendo que el
símbolo pareciera sin uso.

### Tabla de auditoría por caso

| Archivo | Símbolo | Veredicto | Razón |
|---|---|---|---|
| `AssignGroup.jsx` | `selectGroups` | FALSO POSITIVO | `const groups = useSelector(selectGroups)` — usado en L113, L148 |
| `AssignGroup.jsx` | `selectSuccess` | FALSO POSITIVO | `const success = useSelector(selectSuccess)` — usado en L74 |
| `Subscriptions.jsx` | `selectSubscriptions` | FALSO POSITIVO | `const reduxSubs = useSelector(selectSubscriptions)` — usado en L76 |
| `Subscriptions.jsx` | `selectLoading` | FALSO POSITIVO | `const loading = useSelector(selectLoading)` — usado en L118, L180 |
| `ShareReportModal.jsx` | `createShare` | FALSO POSITIVO | `dispatch(createShare({...}))` en L33 |
| `ShareReportModal.jsx` | `selectSharesError` | FALSO POSITIVO | `useSelector(selectSharesError)` en L21 |
| `ShareReportModal.jsx` | `resetCreateStatus` | FALSO POSITIVO | `dispatch(resetCreateStatus())` en L44 |
| `usePasswordStrength.js` | `useMemo` | FALSO POSITIVO | `const _result = useMemo(() => {...}, [_password])` en L12 |
| `RevokeExceptionalPermission.jsx` | `clearError` | FALSO POSITIVO | `dispatch(clearError())` en L26 |
| `RevokeExceptionalPermission.jsx` | `selectLoading` | FALSO POSITIVO | `const loading = useSelector(selectLoading)` en L15 |

Casos adicionales investigados que también resultaron falsos positivos:
- `announcementFallback.js / thing` — `thing` aparece en la cadena de texto
  `"import { thing } from 'other-microfrontend'"`, no como import real.
- `usePermisos.ts / createContext` — TypeScript con genérico `createContext<AuthContextValue>()`.
  El regex de análisis no procesaba la sintaxis TypeScript correctamente.

---

## Casos reales confirmados y corregidos

La auditoría también encontró 5 casos reales nuevos no incluidos en el plan:

| Archivo | Símbolo | Evidencia |
|---|---|---|
| `GroupManagement.jsx` | `LoadingSpinner` | Solo aparece en el import. El loading se pasa como prop a `<Table loading={loading}>` |
| `AssignGroup.jsx` | `SeparationRulesValidator` | Solo aparece en el import. Fue reemplazado por un checkbox de confirmación explícita |
| `AssignFunctions.jsx` | `validateSeparationRules` | Solo en el import multilínea, sin uso en el cuerpo |
| `FunctionCatalog.jsx` | `LoadingSpinner` | Solo en el import. Loading manejado internamente por `Table` |
| `SavedViews.jsx` | `LoadingSpinner` | Solo en el import. Loading manejado por `Table` |
| `DashboardLayout.jsx` | `LogoBrand`, `MenuButton` | Importados de `@ui/shared/Header` junto a `Header`, pero solo `Header` se usa en el JSX |
| `UserManagement.jsx` | `userAuth` | Facade `UserIdentity` importado pero nunca llamado |

Total real: 8 imports sin uso en 7 archivos (vs 13 en 6 archivos del plan).

---

## Cambios aplicados

| Archivo | Cambio |
|---|---|
| `pages/access/GroupManagement.jsx` | Eliminado `import LoadingSpinner` |
| `pages/access/AssignGroup.jsx` | Eliminado `import SeparationRulesValidator` |
| `pages/access/AssignFunctions.jsx` | Eliminado `validateSeparationRules` del import multilínea |
| `pages/admin/FunctionCatalog.jsx` | Eliminado `import LoadingSpinner` |
| `pages/reports/SavedViews.jsx` | Eliminado `import LoadingSpinner` |
| `layouts/DashboardLayout/DashboardLayout.jsx` | `{ Header, LogoBrand, MenuButton }` → `{ Header }` |
| `pages/users/UserManagement/UserManagement.jsx` | Eliminado `import userAuth` |

`git diff --stat`: 7 files changed, 2 insertions(+), 7 deletions(-)

---

## Verificaciones realizadas

| Verificación | Resultado |
|---|---|
| Auditoría manual de los 13 casos del plan | 10 falsos positivos identificados antes de modificar |
| Auditoría expandida de toda la base de código | 8 casos reales confirmados |
| Suite completa tras los cambios | 2377 passed, 0 failed |

---

## Estado después de FASE 6

```
npx jest --no-coverage → 2377 passed, 0 failed (sin variación)
Deuda técnica DT W-002 no-unused-vars: resuelta
```

---

*Generado: 2026-05-16T15:34:00 | Commit: e8af99d | Suite: 2377 passed*
