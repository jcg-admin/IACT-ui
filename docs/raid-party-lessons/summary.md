# Raid Party App — Resumen y Funcionalidad Útil para IACT

> Documento consolidado desde: RAID_PARTY_SUMMARY.txt, RAID_PARTY_USEFUL_FUNCTIONALITY.txt,
> RESUMEN_FINAL_PICKERS.txt
>
> Ver también: `docs/raid-party-lessons/adaptation-analysis.md` y
> `docs/raid-party-lessons/deep-analysis.md` para análisis detallados.

---

## Raid Party App — Descripción

**Tipo:** Aplicación Metaverso 3D  
**Tamaño:** 40+ componentes, Three.js, Blockchain  
**Nivel:** Production-grade codebase  
**Ubicación original analizada:** `/tmp/raid-party-app-master/`

---

## 3 Patrones clave identificados para IACT

### Patrón 1 — CSS Modules (Component-Scoped Styling)

**Problema en IACT:** Global SCSS con conflictos de nombres  
**Solución Raid Party:** 100% adopción de CSS Modules en 40/40 componentes

```
src/components/
├── Header/
│   ├── Header.jsx
│   ├── Header.module.scss     ← Estilos encapsulados
│   └── LogoBrand.module.scss  ← Estilos encapsulados
```

```jsx
// Antes (global):
<div className="header__nav">

// Después (scoped):
<div className={styles.nav}>
```

**Beneficios:** Sin conflictos de nombres, mejor aislamiento, refactoring más fácil, CSS bundles menores, scope local predecible.

**Esfuerzo:** Medio | **Impacto:** Alto

**Componentes IACT prioritarios para migrar:**
1. LoginForm (alta visibilidad, styling complejo)
2. Header (usado en todas las páginas)
3. Sidebar (usado en todas las páginas)
4. Dashboard (styling intensivo)
5. ProgressBar (styling complejo)

---

### Patrón 2 — React Query para data fetching

**Problema en IACT (patrón actual):**
```javascript
const [jobs, setJobs] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  setLoading(true)
  jobService.getJobs()
    .then(data => { setJobs(data); setLoading(false) })
    .catch(err => { setError(err); setLoading(false) })
}, [])
```

**Solución con React Query:**
```javascript
import { useQuery } from '@tanstack/react-query'

const { data: jobs, isLoading, error } = useQuery({
  queryKey: ['jobs'],
  queryFn: () => jobService.getJobs(),
})
```

**Beneficios:** Sin boilerplate de 3 useState, caching automático, refetching background, deduplicación de requests, sincronización entre pestañas, retry automático, optimistic updates, menos tests.

> **NOTA para IACT:** El proyecto ya tiene `@tanstack/react-query` instalado. Ver `docs/guides/services-setup.md` para el patrón `createResilientService` alternativo.

**Esfuerzo:** 4–6 horas | **Impacto:** Alto (simplifica toda la app)

---

### Patrón 3 — Feature Folders

Organización por feature en lugar de por tipo de archivo:

```
# En lugar de:
src/
├── components/AlertItem.jsx
├── hooks/useAlerts.js
├── services/alertsService.js
└── redux/slices/alertsSlice.js

# Feature folders:
src/
└── features/
    └── alerts/
        ├── AlertItem.jsx
        ├── useAlerts.js
        ├── alertsService.js
        └── alertsSlice.js
```

**Beneficios:** Todo lo de una feature junto, fácil de encontrar, eliminar o mover features completas.

> **Estado en IACT:** Parcialmente implementado — `src/modules/home/` sigue este patrón.

---

## Pickers: análisis MX-Template → IACT (RESUMEN_FINAL_PICKERS)

### Librerías del MX-Template (jQuery-based, no compatibles con React)

| Librería | Problema |
|---------|---------|
| `moment.js v2.22.2` | Pesado, deprecado para nuevos proyectos |
| `bootstrap-datetimepicker.js` | Requiere jQuery, manipulación DOM directa |
| `bootstrap-selectpicker.js` | Requiere jQuery |

**Problemas del approach jQuery:**
- Fuertemente acoplado a jQuery
- Manipulación directa del DOM (anti-patrón React)
- Sin soporte dark mode
- Sin accesibilidad WCAG
- Desactualizado (última actualización 2017-2018)
- Bundle size grande (~150KB)

### Solución implementada para IACT

Componentes React nativos (sin jQuery):

```
src/components/DateTimeInputs/
├── DateTimeInput.jsx       — date, time, datetime-local nativo
├── DateTimeInput.scss      — Dark mode completo
├── SelectDropdown.jsx      — Multi-select con búsqueda, limpieza
└── SelectDropdown.scss     — Animaciones
```

**Redux formSlice integrado:**
```javascript
// Selectors
selectDateStart, selectDateEnd, selectSelectedAction,
selectActiveFilters, selectSearchQuery

// Actions
setDateStart, setDateEnd, setSelectedAction,
resetFilters, applyFilters, setSearchQuery
```

**Ventajas sobre jQuery pickers:**
- ✅ Sin dependencias extra
- ✅ Accesible (WCAG AA)
- ✅ Dark mode nativo
- ✅ Compatible con React controlled components
- ✅ Bundle size mínimo

---

## Lecciones aprendidas de Raid Party

1. **CSS Modules desde el inicio** — migrar después es costoso (40 componentes en Raid Party)
2. **Feature folders escalan mejor** — organización por tipo de archivo se rompe en proyectos grandes
3. **React Query elimina boilerplate** — los 3 useState (data, loading, error) son un anti-patrón
4. **Pickers nativos > jQuery pickers** — mejor accesibilidad, sin dependencias, dark mode fácil
