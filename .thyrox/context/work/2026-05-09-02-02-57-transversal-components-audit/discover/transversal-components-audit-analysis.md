```yml
created_at: 2026-05-09 02:02:57
project: THYROX
work_package: 2026-05-09-02-02-57-transversal-components-audit
phase: Phase 1 — DISCOVER
author: NestorMonroy
status: Borrador
```

# DISCOVER — transversal-components-audit

Objetivo: auditoría de uso consistente de componentes transversales en todas las páginas.
Sin crear componentes nuevos — solo corregir el uso de los existentes.

---

## 1. Inventario de componentes shared

### Modal.jsx (`src/components/shared/Modal.jsx`)
- Acepta: `isOpen`, `onClose`, `title`, `children`, `footer`, `size`, `closeOnEscape`, `closeOnBackdrop`
- Cierre con Escape: SÍ (línea 27-33)
- Cierre con backdrop click: SÍ (línea 39-43)
- Clases SCSS usadas: `modal-overlay`, `modal`, `modal--{size}`, `modal-header`, `modal-title`, `modal-close`, `modal-content`, `modal-footer`
- SCSS `_modal.scss`: define TODAS las clases anteriores ✓
- **Sin gaps de clase SCSS**

### ConfirmModal.jsx (`src/components/shared/ConfirmModal.jsx`)
- Wrappea Modal con footer pre-configurado
- Acepta: `isOpen`, `onClose`, `onConfirm`, `title`, `message`, `confirmLabel`, `cancelLabel`, `variant`, `size`
- variants: `danger`, `warning`, `default`

**CRÍTICO — GAP-CM-01: Clases CSS inexistentes**
```
ConfirmModal.jsx:6   danger: 'btn--danger'     ← NO existe en _buttons.scss
ConfirmModal.jsx:7   warning: 'btn--warning'   ← NO existe en _buttons.scss
ConfirmModal.jsx:8   default: 'btn--primary'   ← NO existe en _buttons.scss
ConfirmModal.jsx:26  className="btn btn--secondary"  ← NO existe en _buttons.scss
```
`_buttons.scss` define: `btn-danger`, `btn-primary`, `btn-secondary`, `btn-warning` (con guion simple).
Las clases `btn--*` (doble guion BEM) NO existen en ningún archivo SCSS del proyecto.

**Impacto:** Todos los botones de ConfirmModal están sin estilo. Funcionales pero sin color/padding/border.

**Test afectado:** `src/components/shared/__tests__/ConfirmModal.test.jsx` verifica `toHaveClass('btn--danger')` etc. Los tests PASARÁN (la clase se aplica en el DOM) pero la clase aplicada no tiene estilos CSS.

**Corrección:** `btn--danger` → `btn-danger`, `btn--primary` → `btn-primary`, `btn--secondary` → `btn-secondary`, `btn--warning` → `btn-warning`.

**Efecto en tests:** Los tests de clase en ConfirmModal.test.jsx deben actualizarse al mismo tiempo.

### GroupAssignModal.jsx (`src/components/access/GroupAssignModal.jsx`)
**CRÍTICO — GAP-CM-02: Mismo problema de clases**
```
GroupAssignModal.jsx:31  className="btn btn--secondary"  ← NO existe
GroupAssignModal.jsx:33  className="btn btn--primary"    ← NO existe
```
Este componente no es shared/ pero usa el mismo patrón erróneo.

### ErrorBoundary.jsx (`src/components/shared/ErrorBoundary.jsx`)
- Clase simple con `hasError` state
- Fallback: div inline con Tailwind classes (`flex items-center justify-center min-h-screen bg-slate-900`)
- NO acepta prop `fallback` — renderiza su propio fallback hardcodeado
- Necesita extender con prop `fallback` antes de usarlo en App.jsx

### ErrorBoundaries.jsx (`src/components/shared/ErrorBoundaries.jsx`)
- `RootErrorBoundary` — fallback más completo con logError + retry count
- `APIErrorBoundary` — para componentes con API calls
- `ComponentErrorBoundary` — genérico con prop `fallback` (pero es una string, no JSX)
- `ModalErrorBoundary` — para modales
- Todos usan Tailwind classes — heterogéneo con el resto del proyecto

### LoadingSpinner.jsx, ExportButtons.jsx — sin gaps de clase encontrados

### Table.jsx (`src/components/presentational/Table.jsx`)
- Acepta: `columns` (con `col.render`), `data`, `onRowClick`, `onActionClick`, `loading`, `selectable`, `sortable`
- `col.render(value, row)` permite renderizar cualquier JSX por celda ✓
- `onActionClick` — una sola acción por fila (botón ⋮)
- **GAP-TABLE-01**: No soporta múltiples acciones por fila — necesita prop `actions` array

---

## 2. Inventario de modales inline con role="dialog"

**5 modales inline en pages** (PROVEN via grep):

| Archivo | Línea | Tipo | ¿Destructivo? | Escape? | Backdrop? |
|---------|-------|------|---------------|---------|-----------|
| `pages/permissions/RevokeGroup.jsx` | 180 | Formulario (preview revoke) | SÍ | NO | NO |
| `pages/admin/MenuItemCatalog.jsx` | 383 | Formulario (block archive reason) | Sí (bloqueo) | NO | NO |
| `pages/users/UserManagement/UserList.jsx` | 180 | Confirmación (bloquear/desbloquear) | SÍ | NO | NO |
| `pages/logs/ETLLogs.jsx` | 122 | Formulario (motivo reintento) | Sí (reintento) | SÍ (aria-labelledby) | NO |
| `pages/alerts/Alerts.jsx` | 174 | Formulario (nota reconocimiento) | No | SÍ (aria-labelledby) | NO |

**Análisis por modal:**

### RevokeGroup.jsx (línea 180)
- Modal de composición preview — flujo de 2 pasos con estado rico (badges, warnings, literal input)
- Implementado en WP anterior siguiendo spec UC_PERM_02 — tiene lógica de negocio específica
- **Decisión**: No migrar a Modal genérico — mantener inline. El flujo tiene estados demasiado específicos para el footer genérico de Modal. Documentar con comentario.

### MenuItemCatalog.jsx (línea 383)
- Modal de "bloquear archivado automático" — textarea con razón mínima 20 chars
- Se renderiza embebido en el DOM (sin `position: fixed`), no como overlay real
- **Migrar → Modal** con footer personalizado

### UserList.jsx (línea 180)
- Confirmación simple bloquear/desbloquear — ya tiene estado `confirmModal.type`
- Actualmente usa clases CSS custom (`confirm-modal-overlay`, `confirm-modal`)
- **Migrar → ConfirmModal variant="danger"** para bloquear, `variant="default"` para desbloquear

### ETLLogs.jsx (línea 122)
- Formulario con textarea (motivo reintento) + char counter + validación
- Tiene `aria-labelledby` correcto — tiene contenido propio de formulario
- **Migrar → Modal** con children=formulario y footer=botones

### Alerts.jsx (línea 174)
- Formulario nota reconocimiento — textarea opcional ≤500 chars
- Tiene `aria-labelledby` correcto
- **Migrar → Modal** con children=formulario y footer=botones

---

## 3. Acciones destructivas sin confirmación (window.confirm)

**5 usos de window.confirm** (PROVEN via grep):

| Archivo | Línea | Acción | Severidad |
|---------|-------|--------|-----------|
| `pages/admin/FunctionCatalog.jsx` | 124 | Desactivar función | ALTO |
| `pages/admin/AGRCatalog.jsx` | 126 | Desactivar AGR | ALTO |
| `pages/users/UserManagement/UserManagement.jsx` | 182 | Baja de usuario | ALTO |
| `pages/reports/SharedViews.jsx` | 117 | Revocar vista compartida | MEDIO |
| `pages/reports/SavedViews.jsx` | 39 | Eliminar vista guardada | MEDIO |

**Nota adicional — modales inline en scope del WP:**
- `pages/reports/ScheduledReport.jsx:205` — `dispatch(deleteSchedule(...))` directo en onClick, **sin confirmación de ningún tipo**

**Total acciones destructivas sin ConfirmModal: 6**

---

## 4. ErrorBoundary en árbol de componentes

**App.jsx** (PROVEN via Read):
```jsx
export default function App() {
  return (
    <AppProviders>
      <ServerErrorBanner />
      <Suspense fallback={<LoadingFallback />}>
        <AppRouter />        ← SIN ErrorBoundary
      </Suspense>
      <ToastContainer />
      <ApiErrorAlert />
    </AppProviders>
  )
}
```

**AppProviders.jsx**: Redux + QueryClient + Toast — sin ErrorBoundary.

**GAP-EB-01 — CRÍTICO:** No hay ErrorBoundary en ningún punto del árbol. Una excepción JavaScript en cualquier componente renderizado rompe la app silenciosamente o muestra pantalla en blanco.

**ErrorBoundary.jsx** existe pero:
- Fallback hardcodeado con Tailwind (inconsistente con el resto del proyecto)
- No acepta prop `fallback` — no es extensible
- RootErrorBoundary en ErrorBoundaries.jsx es más completo pero tampoco se usa

**Plan para Bloque IV:**
1. Agregar prop `fallback` a ErrorBoundary.jsx (o usar RootErrorBoundary directamente)
2. Envolver AppRouter en App.jsx con RootErrorBoundary

---

## 5. Tablas inline en pages

**14 ocurrencias de `<table` en pages** (PROVEN via grep):

| Archivo | Acciones por fila | Recomendación |
|---------|-------------------|---------------|
| `admin/SeparationRulesCatalog.jsx` | Toggle + Eliminar + Editar | Migrar a Table.jsx con `actions` array |
| `admin/MenuItemCatalog.jsx:235` | Drag reorder + Bloquear archivo | Mantener inline — drag no generalizable |
| `admin/MenuItemCatalog.jsx:313` | Ver lifecycle | Migrar a Table.jsx (solo display) |
| `admin/FunctionCatalog.jsx` | Toggle Activo/Inactivo + Desactivar | Migrar a Table.jsx con `actions` |
| `users/UserManagement/UserList.jsx` | Bloquear/Desbloquear + Editar + Dar de baja | Ya fue auditada — mantener (compleja) |
| `admin/AGRCatalog.jsx:281` | Desactivar + composición | Migrar a Table.jsx con `actions` |
| `admin/AGRCatalog.jsx:329` | Agregar composición | Migrar a Table.jsx |
| `access/GroupComposition.jsx` | Agregar/quitar funciones | Mantener inline — UI custom con inputs |
| `access/GroupManagement.jsx` | Editar + Retirar | Migrar a Table.jsx con `actions` |
| `access/PermissionsAudit.jsx` | Solo display | Migrar a Table.jsx (display-only) |
| `reports/SharedViews.jsx:28` | Revocar | Migrar a Table.jsx |
| `reports/SharedViews.jsx:71` | — | Migrar a Table.jsx |
| `reports/ScheduledReport.jsx` | Pausar/Reanudar + Ejecutar + Eliminar | Migrar a Table.jsx con `actions` |
| `reports/SavedViews.jsx` | Aplicar + Eliminar | Migrar a Table.jsx con `actions` |

**Conclusión tablas:** Table.jsx necesita prop `actions` para ser usable en los casos con múltiples acciones.

---

## 6. Páginas sin manejo de error visible

12 páginas sin `error` ni `Error` en su JSX (PROVEN via grep -rL):
- `Dashboard.jsx`, `Home.jsx`, `NotFound.jsx`, `Settings.jsx`
- `access/Segments.jsx` (stub estático — no aplica)
- `admin/AdminLayout.jsx` (layout — no aplica)
- `logs/InfraLogs.jsx`, `logs/LogSearch.jsx`, `logs/Logs.jsx`, `logs/PerformanceMetrics.jsx`, `logs/SystemStatus.jsx`
- `users/UserManagement/UserList.jsx`

Las páginas de logs son las más preocupantes — muestran datos de API pero sin fallback de error.

---

## 7. Gaps adicionales identificados (fuera del scope original)

**GAP-EXTRA-01:** `GroupAssignModal.jsx` usa `btn--primary` y `btn--secondary` — mismo problema que ConfirmModal. No es shared/ pero el gap es idéntico. Incluir en Bloque I.

**GAP-EXTRA-02:** `ScheduledReport.jsx:205` dispara `deleteSchedule` directamente en onClick sin ningún tipo de confirmación — ni `window.confirm` ni ConfirmModal. Incluir en Bloque III.

**GAP-EXTRA-03:** `SharedViews.jsx`, `AGRCatalog.jsx`, `FunctionCatalog.jsx`, `UserManagement.jsx` también tienen `window.confirm` — 4 adicionales a los 3 del scope original (SeparationRules, ScheduledReport, SavedViews). El scope del WP cubre solo SeparationRules + ScheduledReport + SavedViews. Los otros 4 son candidatos a extensión de scope.

---

## Resumen de gaps por bloque

| Bloque | Gap ID | Descripción | Severidad | Archivos afectados |
|--------|--------|-------------|-----------|-------------------|
| I | GAP-CM-01 | ConfirmModal usa `btn--*` inexistentes en SCSS | CRÍTICO | ConfirmModal.jsx + tests |
| I | GAP-CM-02 | GroupAssignModal usa `btn--*` inexistentes | CRÍTICO | GroupAssignModal.jsx |
| II | GAP-DLG-01 | UserList.jsx modal inline → ConfirmModal | ALTO | UserList.jsx |
| II | GAP-DLG-02 | ETLLogs.jsx modal inline → Modal | ALTO | ETLLogs.jsx |
| II | GAP-DLG-03 | Alerts.jsx modal inline → Modal | ALTO | Alerts.jsx |
| II | GAP-DLG-04 | MenuItemCatalog.jsx modal inline → Modal | MEDIO | MenuItemCatalog.jsx |
| II | GAP-DLG-05 | RevokeGroup.jsx modal inline — mantener, documentar | INFO | RevokeGroup.jsx |
| III | GAP-DESTR-01 | SeparationRules.jsx deleteSeparationRule sin confirm | ALTO | SeparationRules.jsx |
| III | GAP-DESTR-02 | ScheduledReport.jsx deleteSchedule sin confirm | ALTO | ScheduledReport.jsx |
| III | GAP-DESTR-03 | SavedViews.jsx deleteSavedView con window.confirm | MEDIO | SavedViews.jsx |
| III | GAP-EXTRA-02 | SharedViews.jsx revokeShare con window.confirm | MEDIO | SharedViews.jsx |
| IV | GAP-EB-01 | No hay ErrorBoundary en App.jsx | CRÍTICO | App.jsx, ErrorBoundary.jsx |
| V | GAP-TABLE-01 | Table.jsx onActionClick es único — necesita prop actions[] | ALTO | Table.jsx |

**Gaps fuera de scope aprobado (esperan aprobación):**
- GAP-EXTRA-03a: `FunctionCatalog.jsx` window.confirm → ConfirmModal
- GAP-EXTRA-03b: `AGRCatalog.jsx` window.confirm → ConfirmModal
- GAP-EXTRA-03c: `UserManagement.jsx` window.confirm → ConfirmModal

---

## Criterios de salida del WP (verificables)

1. `grep "btn--" src/components/shared/*.jsx` = 0 resultados
2. `grep "btn--" src/components/access/GroupAssignModal.jsx` = 0 resultados
3. `grep "role=\"dialog\"" src/pages/ -r` = 1 resultado (RevokeGroup — documentado como excepción)
4. `grep "ErrorBoundary" src/App.jsx` >= 1 resultado
5. `grep "window.confirm" src/pages/ -r` = 0 resultados (scope: SeparationRules, ScheduledReport, SavedViews, SharedViews)
6. `npx jest --watchAll=false`: 0 failures, >= 1987 tests
