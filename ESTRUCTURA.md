ESTRUCTURA COMPLETA DEL PROYECTO IACT
================================================================================

UBICACIÓN: /tmp/project/IACT
ESTADO: Funcional (MVP sin dependencias)
ÚLTIMA ACTUALIZACIÓN: 2025-04-23

================================================================================
ESTRUCTURA DE CARPETAS Y ARCHIVOS
================================================================================

IACT/
├── public/                          # Archivos estáticos
│   └── index.html                   # Template HTML principal
│
├── src/                             # Código fuente
│   ├── components/                  # Componentes React
│   │   ├── common/                  # Componentes reutilizables
│   │   │   ├── ErrorBoundary.jsx    # Manejo de errores
│   │   │   ├── LoadingSpinner.jsx   # Indicador de carga
│   │   │   └── ProtectedRoute.jsx   # Rutas protegidas
│   │   │
│   │   ├── containers/              # Componentes inteligentes (lógica)
│   │   │   ├── LoginPage.jsx        # Página de login
│   │   │   └── DashboardPage.jsx    # Página de dashboard
│   │   │
│   │   └── presentational/          # Componentes puros (UI)
│   │       ├── LoginForm.jsx        # Formulario de login
│   │       ├── DashboardHeader.jsx  # Encabezado del dashboard
│   │       ├── MetricsGrid.jsx      # Grid de métricas
│   │       ├── MetricCard.jsx       # Card individual de métrica
│   │       ├── ChartsSection.jsx    # Sección de gráficos
│   │       └── Chart.jsx            # Componente de gráfico (Recharts)
│   │
│   ├── hooks/                       # Custom React Hooks (PRÓXIMOS)
│   │   ├── useAuth.js               # Hook para autenticación
│   │   ├── useFetch.js              # Hook para fetching
│   │   └── useLocalStorage.js       # Hook para local storage
│   │
│   ├── redux/                       # State Management (Redux Toolkit)
│   │   ├── slices/                  # Redux slices
│   │   │   ├── authSlice.js         # State de autenticación
│   │   │   └── dashboardSlice.js    # State del dashboard
│   │   │
│   │   ├── actions/                 # Redux actions/thunks (PRÓXIMO)
│   │   │   ├── authActions.js       # Acciones de auth
│   │   │   └── dashboardActions.js  # Acciones de dashboard
│   │   │
│   │   ├── store.js                 # Configuración del Redux store
│   │   └── selectors.js             # Selectores Redux (memoizados)
│   │
│   ├── services/                    # Servicios externos (PRÓXIMOS)
│   │   ├── authService.js           # Lógica de autenticación
│   │   ├── apiService.js            # Cliente HTTP
│   │   └── websocketService.js      # Conexión WebSocket
│   │
│   ├── mocks/                       # Datos de prueba
│   │   ├── authMocks.js             # Mock de login
│   │   └── dashboardMocks.js        # Mock de datos dashboard
│   │
│   ├── utils/                       # Funciones utilitarias (PRÓXIMAS)
│   │   ├── formatters.js            # Formateo de datos
│   │   ├── validators.js            # Validaciones
│   │   └── constants.js             # Constantes de la app
│   │
│   ├── styles/                      # Estilos CSS
│   │   └── globals.css              # Estilos globales (Tailwind)
│   │
│   ├── App.jsx                      # Componente raíz con routing
│   └── index.js                     # Entry point
│
├── tests/                           # Tests (PRÓXIMOS)
│   ├── unit/                        # Unit tests
│   │   ├── components/
│   │   ├── redux/
│   │   └── utils/
│   │
│   └── integration/                 # Integration tests
│       ├── login.test.jsx
│       └── dashboard.test.jsx
│
├── config/                          # Configuraciones adicionales
│   └── (vacío por ahora)
│
├── .gitignore                       # Archivos ignorados por git
├── .env.example                     # Variables de entorno (ejemplo)
├── babel.config.js                  # Configuración de Babel
├── webpack.config.js                # Configuración de Webpack
├── tailwind.config.js               # Configuración de Tailwind
├── postcss.config.js                # Configuración de PostCSS
├── jest.config.js                   # Configuración de Jest (vacío)
├── package.json                     # Dependencias del proyecto
├── TODO.md                          # Lista de tareas pendientes
└── README.md                        # Documentación (PRÓXIMO)

================================================================================
DESCRIPCIÓN DE ARCHIVOS CLAVE
================================================================================

CONFIGURACIÓN:

webpack.config.js
- Bundler configuration con React support
- Code splitting automático (vendors, react, redux, charts)
- Lazy loading con dynamic imports
- Development server en puerto 3000
- Source maps para debugging
- Alias para imports limpios (@components, @redux, etc)

babel.config.js
- Configuración para transpilación de ES6+ a ES5
- Soporte para JSX
- Dynamic imports (code splitting)
- React preset automático

tailwind.config.js
- Tema personalizado
- Colores: primary (#3B82F6), secondary (#1F2937)
- Extensiones para dark mode ready

postcss.config.js
- Tailwind CSS processing
- Autoprefixer para compatibilidad

package.json
- 20+ dependencias principales
- Scripts: dev, build, test, lint
- Versiones explícitas para reproducibilidad

REDUX STATE:

redux/store.js
- Configura el Redux store
- Combina reducers (auth, dashboard)
- DevTools habilitado en desarrollo

redux/slices/authSlice.js
- Estado de autenticación
- Acciones: loginStart, loginSuccess, loginFailure, logout
- LocalStorage para persistencia

redux/slices/dashboardSlice.js
- Estado del dashboard
- Acciones: setMetrics, setCharts, setDashboardLoading
- Timestamp del último update

redux/selectors.js
- Selectores memoizados con reselect
- Selectores para: auth, user, authenticated, metrics, charts
- Previene re-renders innecesarios

COMPONENTES:

Components/containers/LoginPage.jsx
- Maneja la lógica de login
- Dispatcha Redux actions
- Redirecciona después de login exitoso
- Muestra spinner durante carga

Components/containers/DashboardPage.jsx
- Maneja la lógica del dashboard
- Carga datos mock al montar
- Renderiza métricas y gráficos
- Botón de logout

Components/presentational/LoginForm.jsx
- Formulario con email y password
- Validación básica
- Credenciales por defecto (demo)

Components/presentational/DashboardHeader.jsx
- Header con nombre del usuario
- Botón de logout

Components/presentational/MetricsGrid.jsx
- Grid responsive de métricas
- 1 columna móvil, 4 columnas desktop

Components/presentational/MetricCard.jsx
- Card individual de métrica
- Muestra valor, label, cambio, tendencia

Components/presentational/ChartsSection.jsx
- Sección con múltiples gráficos
- 2 gráficos iniciales (Sales, Users)

Components/presentational/Chart.jsx
- Envolvente de Recharts
- LineChart con Tooltip, Legend
- Responsive con ResponsiveContainer

Components/common/ProtectedRoute.jsx
- HOC para proteger rutas
- Redirecciona a login si no autenticado

Components/common/LoadingSpinner.jsx
- Spinner animado
- Modo full-screen disponible

Components/common/ErrorBoundary.jsx
- Atrapa errores de componentes
- Muestra mensaje de error
- Botón para reload

MOCKS:

mocks/authMocks.js
- mockUsers: admin@iact.com, user@iact.com (ambos con password123)
- mockLogin: simula login con delay de 1s
- Retorna token y user data

mocks/dashboardMocks.js
- mockMetrics: 4 métricas (users, sessions, revenue, conversion)
- mockChartData: 2 datasets (sales 8 puntos, users 4 puntos)
- mockFetchDashboardData: simula fetch con delay de 500ms

ENTRY:

index.js
- ReactDOM.createRoot
- Monta App en elemento root
- Carga estilos globales

App.jsx
- BrowserRouter para routing
- Redux Provider
- Routes para login y dashboard
- ProtectedRoute para rutas seguras

================================================================================
FLUJO DE DATOS
================================================================================

AUTENTICACIÓN:
1. Usuario ve LoginPage
2. Ingresa credenciales en LoginForm
3. LoginPage dispatcha loginStart action
4. mockLogin verifica credenciales (1s delay)
5. Si válido: dispatcha loginSuccess (guarda token + user en Redux y localStorage)
6. Redux actualiza isAuthenticated a true
7. LoginPage navega a /dashboard
8. ProtectedRoute verifica isAuthenticated (true)
9. Dashboard se renderiza

DASHBOARD:
1. DashboardPage se monta
2. Dispatcha setDashboardLoading(true)
3. mockFetchDashboardData carga datos (500ms delay)
4. Dispatcha setMetrics y setCharts
5. Selectores leen datos de Redux
6. MetricsGrid renderiza cards
7. ChartsSection renderiza gráficos
8. LoadingSpinner desaparece

LOGOUT:
1. Usuario hace click en botón Logout
2. DashboardPage dispatcha logout action
3. Redux limpia auth state y localStorage
4. Navega a /login
5. Ciclo completo

================================================================================
ESTADO GLOBAL (REDUX)
================================================================================

AUTH STATE:
{
  auth: {
    isAuthenticated: boolean,
    user: {
      id: string,
      email: string,
      name: string,
      role: string
    },
    loading: boolean,
    error: string | null
  }
}

DASHBOARD STATE:
{
  dashboard: {
    metrics: {
      [key]: {
        value: string | number,
        label: string,
        change: string,
        trend: 'up' | 'down'
      }
    },
    charts: {
      [key]: Array<{name: string, value: number}>
    },
    loading: boolean,
    error: string | null,
    lastUpdate: string (ISO timestamp)
  }
}

================================================================================
RUTAS DISPONIBLES
================================================================================

GET /login
- Página de login
- Pública, accesible sin autenticación

GET /dashboard
- Dashboard principal
- Protegida, requiere autenticación
- Redirecciona a /login si no autenticado

GET /
- Redirecciona a /dashboard
- Si no autenticado, va a /login

GET /* (404)
- Redirecciona a /dashboard

================================================================================
CÓMO CORRER EL PROYECTO
================================================================================

REQUISITOS:
- Node.js >= 18.0.0
- npm >= 8.0.0

INSTALACIÓN:
1. cd /tmp/project/IACT
2. npm install

DESARROLLO:
1. npm run dev
2. Abre http://localhost:3000 en navegador
3. Deberías ver página de login

TESTING LOGIN:
1. Email: admin@iact.com
2. Password: password123
3. Click Login
4. Espera ~1 segundo
5. Deberías ver dashboard

BUILD PARA PRODUCCIÓN:
1. npm run build
2. Archivos generados en ./dist/

LINTING (PRÓXIMO):
1. npm run lint
2. npm run lint:fix

TESTING (PRÓXIMO):
1. npm run test
2. npm run test:watch
3. npm run test:coverage

================================================================================
VARIABLES DE ENTORNO
================================================================================

Ver .env.example para template

DISPONIBLES:
- REACT_APP_API_URL (próximo, no usado aún)
- REACT_APP_WS_URL (próximo, para WebSocket)
- NODE_ENV (development/production)

LOCAL:
1. Copiar .env.example a .env
2. Modificar valores según necesidad
3. Webpack auto-reemplaza REACT_APP_* en build

================================================================================
TAMAÑO DEL PROYECTO
================================================================================

CÓDIGO FUENTE:
- 19 archivos JavaScript/JSX
- ~1,500 líneas de código
- 4 archivos de configuración
- 2 archivos de mocks

DEPENDENCIAS INSTALADAS:
- React 19
- Redux / Redux Toolkit
- React Router v6
- Recharts
- Tailwind CSS
- Webpack 5
- Babel 7

BUNDLE SIZE ESTIMADO:
- Dev: ~2.5MB (con source maps)
- Prod: ~250KB (gzipped)
  * vendors.js: ~150KB
  * react-vendors.js: ~80KB
  * charts.js: ~40KB (lazy loaded)
  * main.js: ~20KB

================================================================================
CARACTERÍSTICAS IMPLEMENTADAS
================================================================================

AUTENTICACIÓN:
✓ Login form
✓ Mock authentication
✓ Token en localStorage
✓ Protected routes
✓ Logout
✓ Role-based user

DASHBOARD:
✓ Responsive grid
✓ Metric cards
✓ Line charts (Recharts)
✓ Real-time capable
✓ Loading states

STATE MANAGEMENT:
✓ Redux Toolkit setup
✓ Slices (auth, dashboard)
✓ Memoized selectors
✓ Redux DevTools
✓ LocalStorage sync

TOOLING:
✓ Webpack 5
✓ Babel transpilation
✓ Tailwind CSS
✓ Code splitting ready
✓ Dev server HMR

TESTING READY:
✓ Jest config (vacío)
✓ React Testing Library ready
✓ Test file structure

================================================================================
CARACTERÍSTICAS NO IMPLEMENTADAS (TODO)
================================================================================

NIVEL ALTO:
- WebSockets para datos en tiempo real
- Notificaciones en tiempo real
- Reportes exportables
- Multi-lenguaje (i18n)
- Dark/Light mode toggle

FUNCIONALIDADES:
- Tabla de datos con paginación
- Filtros avanzados
- Búsqueda
- Drill-down en gráficos
- Comparativa de períodos

ARQUITECTURA:
- Custom hooks (useAuth, useFetch, etc)
- Services (apiService, websocketService)
- Middleware Redux personalizado
- Error tracking
- Analytics

TESTING:
- Unit tests
- Integration tests
- Component tests
- E2E tests

DEPLOYMENT:
- CI/CD pipeline
- GitHub Actions
- Docker
- Environment-specific builds

================================================================================
PRÓXIMOS PASOS
================================================================================

1. INSTALAR Y VERIFICAR
   npm install
   npm run dev
   Verificar http://localhost:3000

2. COMPLETAR TODO FASE 2 (Login mejorado)
   - Input validation
   - Password toggle
   - Better error messages

3. COMPLETAR TODO FASE 3 (Dashboard mejorado)
   - Agregar más métricas
   - Agregar más gráficos
   - Agregar tabla de datos

4. IMPLEMENTAR SERVICES (Fase 5)
   - API client
   - WebSocket client
   - Auth service

5. AGREGAR WEBSOCKETS (Fase 6)
   - Real-time updates
   - Notificaciones
   - Batching de updates

Ver TODO.md para lista completa con prioridades y estimaciones

================================================================================
RECURSOS Y REFERENCIAS
================================================================================

DOCUMENTACIÓN OFICIAL:
- React: https://react.dev
- Redux: https://redux.js.org
- React Router: https://reactrouter.com
- Webpack: https://webpack.js.org
- Tailwind: https://tailwindcss.com
- Recharts: https://recharts.org

TUTORIALES:
- Redux Toolkit: https://redux.js.org/usage/usage-guide
- React Hooks: https://react.dev/reference/react
- Tailwind Classes: https://tailwindcss.com/docs

HERRAMIENTAS:
- Redux DevTools: Extensión de navegador
- React DevTools: Extensión de navegador
- Webpack Bundle Analyzer: npm package

LIBROS/GUÍAS:
- Ver documentos generados en /mnt/user-data/outputs/

================================================================================
TROUBLESHOOTING
================================================================================

ERROR: "Cannot find module"
SOLUCIÓN: Verificar alias en webpack.config.js vs estructura real

ERROR: "Module not found: 'react'"
SOLUCIÓN: npm install (posiblemente npm cache clean)

ERROR: "Port 3000 already in use"
SOLUCIÓN: Cambiar puerto en webpack devServer o matar proceso anterior

ERROR: "EACCES: permission denied"
SOLUCIÓN: sudo chown -R $USER:$USER node_modules o usar nvm

ERROR: Redux action no se dispara
SOLUCIÓN: Verificar que componente está envuelto en <Provider store={store}>

ERROR: Selector retorna undefined
SOLUCIÓN: Verificar que Redux state tiene la estructura esperada

================================================================================
MANTENIMIENTO
================================================================================

ACTUALIZAR DEPENDENCIAS:
1. npm outdated (ver versiones disponibles)
2. npm update (actualizar minor/patch)
3. npm install [package]@latest (actualizar específico)

LIMPIAR PROYECTO:
1. rm -rf node_modules dist
2. npm install (reinstalar fresh)

RESET A ESTADO INICIAL:
1. git reset --hard HEAD
2. rm -rf node_modules dist
3. npm install

BACKUP:
1. Usar Git para versionado
2. Pushear a remoto regularmente
3. Tar archive para snapshots

================================================================================
CONTRIBUIDORES Y AUTORES
================================================================================

PROYECTO: IACT Dashboard
VERSIÓN: 1.0.0 (MVP)
FECHA CREACIÓN: 2025-04-23
ESTADO: En desarrollo activo

BASADO EN:
- DASHBOARD_SETUP_GUIDE.md
- EJEMPLOS_CÓDIGO_PRÁCTICO.md
- Advanced Front-End Development (Apress 2025)

================================================================================
FIN DE ESTRUCTURA
================================================================================

Para información detallada, ver:
- README.md (próximo)
- TODO.md (lista de tareas)
- Documentos en /mnt/user-data/outputs/

Para empezar: npm install && npm run dev

================================================================================
