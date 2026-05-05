# IACT — Estructura de Proyecto (Referencia Histórica)

> Documento consolidado desde: ESTRUCTURA.md, START_HERE.md, PROJECT_STRUCTURE_FINAL.txt, TODO.md
>
> **NOTA:** Esta estructura documenta el estado de `/tmp/project/IACT` (sesión de desarrollo
> inicial, circa 2025-04-23). La estructura actual del proyecto está en `docs/ARCHITECTURE.md`.
> Este documento se conserva como referencia de la evolución arquitectónica.

---

## Estado inicial del proyecto (2025-04-23)

**Ubicación original:** `/tmp/project/IACT`  
**Estado:** MVP funcional sin dependencias externas  
**Flujo funcional:**

```
1. Usuario → /login
2. Credenciales: admin@iact.com / password123
3. Redux dispatch → login action
4. Token → localStorage
5. Redirect → /dashboard
6. Dashboard carga mocks de métricas y gráficos
7. Logout limpia estado
```

---

## Estructura de carpetas — versión inicial

```
IACT/
├── public/
│   └── index.html
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── containers/
│   │   │   ├── LoginPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   └── presentational/
│   │       ├── LoginForm.jsx
│   │       ├── DashboardHeader.jsx
│   │       ├── MetricsGrid.jsx
│   │       ├── MetricCard.jsx
│   │       ├── ChartsSection.jsx
│   │       └── Chart.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useFetch.js
│   │   └── useLocalStorage.js
│   │
│   ├── redux/
│   │   ├── store.js
│   │   ├── selectors.js
│   │   └── slices/
│   │       ├── authSlice.js
│   │       └── dashboardSlice.js
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── apiService.js
│   │   └── websocketService.js
│   │
│   └── mocks/
│       ├── authMocks.js
│       └── dashboardMocks.js
│
├── webpack.config.js
├── babel.config.js
├── postcss.config.js
├── package.json
└── .env.example
```

---

## Estructura final del proyecto (version CSS Modules — PROJECT_STRUCTURE_FINAL)

Evolución hacia arquitectura con CSS Modules (patrón tomado de Raid Party):

```
src/
├── components/
│   ├── common/
│   │   ├── Header/
│   │   │   ├── index.jsx             ← barrel export
│   │   │   ├── Header.jsx + Header.module.scss
│   │   │   ├── LogoBrand.jsx + LogoBrand.module.scss
│   │   │   ├── MenuButton.jsx + MenuButton.module.scss
│   │   │   ├── BreadcrumbNav.jsx + BreadcrumbNav.module.scss
│   │   │   ├── NotificationBell.jsx + NotificationBell.module.scss
│   │   │   └── UserMenu.jsx + UserMenu.module.scss
│   │   │
│   │   └── Sidebar/
│   │       ├── index.jsx             ← barrel export
│   │       ├── Sidebar.jsx + Sidebar.module.scss
│   │       ├── SidebarNav.jsx + SidebarNav.module.scss
│   │       └── NavLink.jsx + NavLink.module.scss
│   │
│   ├── auth/
│   ├── alerts/
│   ├── presentational/
│   └── containers/
│
├── layouts/
│   └── DashboardLayout/
│       ├── index.jsx
│       ├── DashboardLayout.jsx
│       └── DashboardLayout.module.scss
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   ├── Settings.jsx
│   └── NotFound.jsx
│
└── redux/
    ├── store.js
    ├── index.js                      ← barrel export
    └── slices/
        ├── uiSlice.js               ← UI state (sidebar, theme)
        ├── userSlice.js
        ├── authSlice.js
        ├── sessionSlice.js
        ├── errorSlice.js
        └── dashboardSlice.js
```

**Patrón de barrel exports:** Cada directorio de componente tiene `index.jsx` para importaciones limpias:
```js
// En lugar de: import Header from './common/Header/Header.jsx'
import Header from './common/Header'
```

---

## TODOs de la versión inicial (referencia histórica)

> Estos TODOs corresponden al MVP inicial. El estado actual del proyecto está
> documentado en `.thyrox/context/technical-debt.md`.

### Pendientes de UI/UX (Fase 2)
- Input validation (email format, password length)
- Password visibility toggle
- "Remember me" checkbox
- Animaciones de entrada en login

### Pendientes técnicos
- Agregar `tsconfig.json` + `tsc --noEmit` (ver TD-002 en technical-debt.md)
- Routing con `react-router-dom` (instalado pero sin rutas — TD-005)
- Consolidar `homeSlice.js` duplicado (TD-004)
- Completar import paths de los 37 test suites fallando (TD-001)

### Pendientes de infraestructura
- Coverage reports automatizados
- CI/CD pipeline (GitHub Actions)
- Code splitting optimizado

---

## Configuración inicial — Tech stack

| Herramienta | Versión inicial | Estado actual |
|-------------|----------------|---------------|
| Webpack | 5 | ✅ `webpack.config.cjs` |
| Babel | preset-env + react | ✅ + `@babel/preset-typescript` |
| Tailwind CSS | integrado | ❌ Removido (ver `docs/analysis/changelog-tailwind-removal.md`) |
| Redux Toolkit | presente | ✅ Slices por dominio |
| React | 18 | ✅ Actualizado a 18/19 |
| Jest | presente | ✅ 29 con RTL |
| PostCSS + Autoprefixer | presente | ✅ |
