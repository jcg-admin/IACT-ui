```yml
created_at: 2026-05-06 21:55:12
project: IACT-ui
work_package: 2026-05-06-21-55-12-menu-submenu-ux
phase: Phase 1 — DISCOVER
author: claude
status: Borrador
version: 1.0.0
```

# Análisis — Sub-menús jerárquicos en Sidebar

## 1. Estado actual

`ALL_NAV_LINKS` en `AppRouter.jsx:124-134` define 9 ítems planos:

```
Dashboard   → /dashboard   (VIEW_DASHBOARD)
Usuarios    → /users       (VIEW_USERS)
Reportes    → /reports     (VIEW_REPORTS)
Acceso      → /access      (VIEW_ACCESS)
Auditoría   → /audit       (VIEW_AUDIT)
Alertas     → /alerts      (VIEW_ALERTS)
Logs        → /logs        (VIEW_LOGS)
Admin       → /admin       (MANAGE_CATALOG)
Ajustes     → /settings    (VIEW_OWN_SESSIONS)
```

`SidebarNav.jsx` renderiza `<ul>` plano — no tiene concepto de children ni estado expandido.

## 2. Sub-rutas existentes en AppRouter (PROVEN — audit de AppRouter.jsx)

### MOD_Reports — 11 sub-rutas

| Path | Permission | Label propuesto |
|------|-----------|----------------|
| `/reports` | `VIEW_REPORTS` | (parent — redirige a /reports/historical) |
| `/reports/agents` | `VIEW_REPORTS` | Agentes IVR |
| `/reports/queues` | `VIEW_REPORTS` | Colas IVR |
| `/reports/campaigns` | `VIEW_REPORTS` | Campañas |
| `/reports/transfers` | `VIEW_REPORTS` | Transferencias |
| `/reports/ivr-menus` | `VIEW_REPORTS` | Menús IVR |
| `/reports/unique-clients` | `VIEW_REPORTS` | Clientes únicos |
| `/reports/historical` | `VIEW_REPORTS` | Históricos |
| `/reports/realtime` | `VIEW_METRICS` | Tiempo real |
| `/reports/scheduled` | `SCHEDULE_REPORTS` | Programados |
| `/reports/export` | `EXPORT_CSV` | Exportar |
| `/reports/saved` | `SAVE_VIEW` | Vistas guardadas |

### MOD_Logs — 8 sub-rutas con 6 permisos distintos

| Path | Permission | Label propuesto |
|------|-----------|----------------|
| `/logs` | `VIEW_LOGS` | App logs |
| `/logs/etl` | `VIEW_PIPELINE_LOGS` | ETL logs |
| `/logs/etl/availability` | `VIEW_PIPELINE_LOGS` | Disponibilidad |
| `/logs/search` | `SEARCH_LOGS` | Buscar logs |
| `/logs/export` | `EXPORT_LOGS` | Exportar logs |
| `/logs/infra` | `VIEW_INFRA_LOGS` | Infraestructura |
| `/logs/status` | `VIEW_SYSTEM_HEALTH` | Estado sistema |
| `/logs/metrics` | `VIEW_TECHNICAL_METRICS` | Métricas |
| `/logs/pipeline` | `VIEW_ETL_SUPERVISION` | Supervisión ETL |

### MOD_Access — 5 sub-rutas con 3 permisos distintos

| Path | Permission | Label propuesto |
|------|-----------|----------------|
| `/access/groups` | `MANAGE_GROUPS` | Grupos de acceso |
| `/access/groups/composition` | `MANAGE_GROUPS` | Composición |
| `/access/groupers` | `MANAGE_ACCESS` | Agrupadores |
| `/access/separation-rules` | `MANAGE_SEPARATION_RULES` | Reglas SoD |
| `/access/segments` | `MANAGE_ACCESS` | Segmentos |
| `/access/assign-group` | `MANAGE_ACCESS` | Asignar grupo |

### MOD_Admin — 2 sub-rutas, mismo permiso

| Path | Permission | Label propuesto |
|------|-----------|----------------|
| `/admin/functions` | `MANAGE_CATALOG` | Funciones RBAC |
| `/admin/groups` | `MANAGE_CATALOG` | Grupos (AGR) |

## 3. Diseño de la solución

### 3.1 Extensión del data model de nav links

```js
// Forma actual (plana)
{ id, label, icon, path, permission }

// Forma extendida (con children)
{
  id, label, icon, path, permission,
  children: [                          // opcional
    { label, icon?, path, permission }
  ]
}
```

El parent permanece navegable (navega a `path` al hacer click en el label principal).
Los children se muestran en un sub-panel expandible debajo del parent.

### 3.2 Filtrado por capacidades

`useFilteredNavLinks` debe:
1. Filtrar parents: `hasPermission(link.permission)`
2. Filtrar children: `child => hasPermission(child.permission)`
3. Mostrar parent aunque sus children estén todos ocultos (el parent tiene su propio permiso)
4. Un parent con children: si el parent pasa el filtro, mostrar solo los children que también pasan

### 3.3 Estado expandido

- `SidebarNav` necesita estado local `expandedId` (cuál grupo está expandido)
- Click en el label del parent → expandir/colapsar children (no navegar)
- Click en un child → navegar a `child.path`
- Solo un grupo expandido a la vez (accordion)
- El parent activo (ruta actual está dentro del grupo) → expandido por defecto

### 3.4 SidebarNav refactor

```jsx
// Pseudocódigo
function SidebarNav({ navLinks, currentPath, onNavigate }) {
  const [expandedId, setExpandedId] = useState(
    navLinks.find(l => l.children?.some(c => currentPath.startsWith(c.path)))?.id
  )

  return navLinks.map(link => {
    if (!link.children) {
      return <NavItem key={link.id} link={link} ... />
    }
    return (
      <NavGroup key={link.id} link={link}
        isExpanded={expandedId === link.id}
        onToggle={() => setExpandedId(expandedId === link.id ? null : link.id)}
        currentPath={currentPath}
      >
        {link.children.map(child => <NavItem key={child.path} link={child} ... />)}
      </NavGroup>
    )
  })
}
```

## 4. Gaps identificados

| ID | Severidad | Descripción |
|----|-----------|-------------|
| G-S1 | CRÍTICO | `SidebarNav` no soporta children — todas las sub-rutas son inaccesibles desde el sidebar |
| G-S2 | Alta | `ALL_NAV_LINKS` plano — 26 sub-rutas sin representación en nav |
| G-S3 | Alta | `useFilteredNavLinks` no filtra children por `hasPermission` |
| G-S4 | Media | `SidebarNav.propTypes` no declara la shape de children |
| G-S5 | Baja | Sin test de comportamiento de expansión accordion |

## 5. Priorización de grupos

| Prioridad | Módulo | Sub-rutas | Razón |
|-----------|--------|-----------|-------|
| 1 | Admin | 2 | Sin sub-menú, FunctionCatalogPage y AGRCatalogPage son las más importantes del sprint |
| 2 | Logs | 8 | Alta granularidad de permisos — algunos usuarios solo pueden ver app logs, otros ETL |
| 3 | Reportes | 11 | El más amplio — todos bajo VIEW_REPORTS excepto 3 casos especiales |
| 4 | Acceso | 5 | 3 permisos distintos — MANAGE_GROUPS vs MANAGE_ACCESS vs MANAGE_SEPARATION_RULES |
