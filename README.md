# IACT UI

Frontend de la aplicación IACT Call Center System construido con React 18, Redux Toolkit y Webpack.

## Descripción

Interfaz de usuario para el sistema de análisis de llamadas (IVR Analytics & Customer Tracking). Consume la API REST de IACT-api y proporciona dashboards, reportes y gestión de usuarios con control de acceso basado en roles (RBAC).

## Stack Tecnológico

- React 18.3.1
- Redux Toolkit 2.2.5
- Webpack 5.95.0
- Babel 7.25.2
- Jest 29.7.0
- React Testing Library 16.0.0
- ESLint 8.57.0
- Node.js 18+ LTS

## Requisitos

- Node.js 18+
- npm 9+ o yarn 3+
- IACT-api ejecutándose en `http://192.168.56.11:8000` (desarrollo)

## Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/jcg-admin/IACT-ui.git
cd IACT-ui
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```
REACT_APP_API_URL=http://192.168.56.11:8000
REACT_APP_API_TIMEOUT=30000
REACT_APP_APP_NAME=IACT
REACT_APP_ENV=development
REACT_APP_MOCK_MODE=false
```

## Desarrollo

### Iniciar servidor de desarrollo

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000` y se abrirá automáticamente en el navegador.

### Estructura del Proyecto

```
ui/
├── public/
│   └── index.html              # Punto de entrada HTML
├── src/
│   ├── app/
│   │   ├── App.jsx             # Componente raíz
│   │   └── App.test.jsx
│   ├── components/
│   │   ├── BackendStatusPanel.jsx
│   │   ├── MainLayout.jsx      # Layout principal
│   │   ├── MockDataNotice.jsx
│   │   ├── PermissionGate.tsx  # Control de permisos
│   │   └── ProtectedRoute.tsx  # Rutas protegidas
│   ├── config/
│   │   └── api.config.ts       # Configuración de API
│   ├── hooks/
│   │   ├── useAppConfig.js     # Config de app
│   │   ├── useHealthStatus.js  # Estado de salud backend
│   │   ├── useMockMetrics.js   # Métricas mock
│   │   ├── usePermisos.ts      # Permisos del usuario
│   │   └── *.test.js
│   ├── lib/
│   │   └── permisos-client.ts  # Cliente de permisos
│   ├── mocks/
│   │   ├── config.json         # Config mock
│   │   ├── dashboard.json      # Dashboard mock
│   │   ├── health.json         # Health check mock
│   │   ├── llamadas.json       # Llamadas mock
│   │   ├── permissions.json    # Permisos mock
│   │   ├── reportes.json       # Reportes mock
│   │   ├── usuarios.json       # Usuarios mock
│   │   ├── metadata.js         # Metadata de mocks
│   │   ├── registry.js         # Registro de mocks
│   │   └── schemas.js          # Schemas de mocks
│   ├── modules/
│   │   └── home/
│   │       ├── components/
│   │       │   └── AnnouncementContent.jsx
│   │       ├── constants/
│   │       ├── hooks/
│   │       │   ├── useCallsSummary.js
│   │       │   └── useHomeAnnouncement.js
│   │       ├── state/
│   │       │   └── homeSlice.js
│   │       └── HomeModule.jsx  # Módulo Home
│   ├── pages/
│   │   └── HomePage.jsx        # Página principal
│   ├── services/
│   │   ├── calls/
│   │   │   └── CallsService.js # Servicio de llamadas
│   │   ├── config/
│   │   │   └── AppConfigService.js
│   │   ├── health/
│   │   │   └── HealthService.js
│   │   ├── permissions/
│   │   │   └── PermissionsService.js
│   │   ├── utils/
│   │   │   ├── fetchWithFallback.js  # Fetch con fallback a mocks
│   │   │   ├── mockUsageTracker.js
│   │   │   └── cloneUtils.js
│   │   └── createResilientService.js # Factory de servicios resilientes
│   ├── state/
│   │   ├── slices/
│   │   │   ├── appConfigSlice.js
│   │   │   ├── healthSlice.js
│   │   │   └── homeSlice.js
│   │   └── store.js            # Redux store
│   ├── styles/
│   │   └── global.css          # Estilos globales
│   ├── types/
│   │   └── permisos.types.ts   # Types de TypeScript
│   └── index.jsx               # Entry point
├── scripts/
│   ├── refresh-mocks.js        # Refrescar datos mock
│   └── setup-services.js       # Setup de servicios
├── .gitignore
├── babel.config.cjs            # Configuración Babel
├── jest.config.cjs             # Configuración Jest
├── jest.setup.js               # Setup de Jest
├── webpack.config.cjs          # Configuración Webpack
├── package.json
├── README.md
├── SERVICES_SETUP.md
└── README_PERMISOS.md
```

## Testing

### Ejecutar tests

```bash
# Todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage
```

### Estructura de tests

Los tests están colocados junto a los componentes/servicios:
- `Component.jsx` con `Component.test.jsx`
- `service.js` con `service.test.js`

### Escribir tests

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });

  it('handles click', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByText(/clicked/i)).toBeInTheDocument();
  });
});
```

## Linting y Formato

```bash
# Lint de código
npm run lint

# Lint con fix
npm run lint -- --fix
```

## Mocks

El proyecto incluye un sistema completo de mocks para desarrollo sin backend.

### Estructura de mocks

```
mocks/
├── metadata.js       # Metadata de mocks
├── registry.js       # Registro y routing de mocks
├── schemas.js        # Schemas de validación
└── *.json            # Datos mock por módulo
```

### Usar mocks

```bash
# Refrescar mocks (regenera datos)
npm run mocks:refresh

# Setup de servicios
npm run services:setup
```

### Modo mock

En `.env.local`:

```
REACT_APP_MOCK_MODE=true
```

Los servicios fallecerán al backend si está disponible, solo usarán mocks como fallback:

```javascript
// fetchWithFallback automáticamente:
// 1. Intenta llamar al backend real
// 2. Si falla, carga el mock
// 3. Registra el uso de mocks
```

## Servicios Principales

### HealthService

Verifica el estado del backend:

```javascript
import HealthService from '@/services/health/HealthService';

const health = await HealthService.check();
// {
//   status: 'healthy' | 'degraded' | 'unavailable',
//   backend: { reachable: boolean, latency: number },
//   timestamp: ISO8601
// }
```

### PermissionsService

Obtiene permisos del usuario autenticado:

```javascript
import PermissionsService from '@/services/permissions/PermissionsService';

const permisos = await PermissionsService.getUserPermissions();
// {
//   modules: [{ id, name, permissions: [...] }],
//   canAccess: (moduleName, permissionName) => boolean
// }
```

### CallsService

Obtiene datos de llamadas:

```javascript
import CallsService from '@/services/calls/CallsService';

const calls = await CallsService.getSummary({ period: 'today' });
const callDetails = await CallsService.getDetails(callId);
```

## Redux State Management

### Crear un slice

```javascript
// src/state/slices/mySlice.js
import { createSlice } from '@reduxjs/toolkit';

export const mySlice = createSlice({
  name: 'my',
  initialState: { data: null },
  reducers: {
    setData: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setData } = mySlice.actions;
export default mySlice.reducer;
```

### Usar en componentes

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { setData } from '@/state/slices/mySlice';

function MyComponent() {
  const dispatch = useDispatch();
  const data = useSelector(state => state.my.data);

  const handleClick = () => {
    dispatch(setData({ foo: 'bar' }));
  };

  return <div onClick={handleClick}>{data?.foo}</div>;
}
```

## Control de Acceso (RBAC)

### PermissionGate

Controla qué ven los usuarios según sus permisos:

```jsx
import PermissionGate from '@/components/PermissionGate';

<PermissionGate module="pipeline" permission="view_calls">
  <CallsPanel />
</PermissionGate>

// Solo muestra CallsPanel si el usuario tiene
// permiso 'view_calls' en el módulo 'pipeline'
```

### ProtectedRoute

Protege rutas según autenticación y permisos:

```jsx
import ProtectedRoute from '@/components/ProtectedRoute';

<Routes>
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute module="dashboard" permission="view">
        <DashboardPage />
      </ProtectedRoute>
    }
  />
</Routes>
```

## Build para Producción

### Generar build

```bash
npm run build
```

Genera una carpeta `dist/` con los archivos optimizados.

### Optimizaciones

- Code splitting automático
- Tree shaking
- Minificación
- Source maps (development)

### Servir build localmente

```bash
npx serve dist
```

Abre en `http://localhost:3000`

## Despliegue en Producción

### Opción 1: Con Apache (recomendado)

```bash
# Generar build
npm run build

# Copiar a servidor
scp -r dist/* user@servidor:/var/www/iact-ui/

# Configurar Apache VirtualHost
```

Apache config (`/etc/apache2/sites-available/iact-ui.conf`):

```apache
<VirtualHost *:80>
    ServerName tu-dominio.com
    DocumentRoot /var/www/iact-ui

    <Directory /var/www/iact-ui>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA routing fallback
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule ^ index.html [QSA,L]
        </IfModule>
    </Directory>

    # Logs
    ErrorLog ${APACHE_LOG_DIR}/iact-ui-error.log
    CustomLog ${APACHE_LOG_DIR}/iact-ui-access.log combined
</VirtualHost>
```

Habilitar:

```bash
sudo a2enmod rewrite
sudo a2ensite iact-ui.conf
sudo systemctl restart apache2
```

### Opción 2: Con Node.js

```bash
# Instalar servidor estático
npm install -g serve

# Servir build
serve -s dist -l 3000

# O usar en producción con PM2
npm install -g pm2
pm2 start "serve -s dist -l 3000" --name iact-ui
pm2 startup
pm2 save
```

### Opción 3: Con Nginx

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    root /var/www/iact-ui;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    error_log /var/log/nginx/iact-ui-error.log;
    access_log /var/log/nginx/iact-ui-access.log;
}
```

## Variables de Entorno

### Desarrollo

```
REACT_APP_API_URL=http://192.168.56.11:8000
REACT_APP_API_TIMEOUT=30000
REACT_APP_APP_NAME=IACT
REACT_APP_ENV=development
REACT_APP_MOCK_MODE=false
```

### Producción

```
REACT_APP_API_URL=https://api.tu-dominio.com
REACT_APP_API_TIMEOUT=30000
REACT_APP_APP_NAME=IACT
REACT_APP_ENV=production
REACT_APP_MOCK_MODE=false
```

## Conexión con IACT-API

### Configuración de API

El archivo `src/config/api.config.ts` configura la conexión:

```typescript
export const apiConfig = {
  baseURL: process.env.REACT_APP_API_URL,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT),
  endpoints: {
    health: '/api/health/',
    users: '/api/users/',
    calls: '/api/pipeline/calls/',
    permissions: '/api/access/user-permissions/',
    // ... más endpoints
  }
};
```

### Autenticación

Los servicios manejan automáticamente:
- Envío de cookies de sesión
- Manejo de CSRF tokens
- Refresh de tokens si es necesario

## Troubleshooting

### Puerto 3000 en uso

```bash
npm start -- --port 3001
```

### Limpiar caché de Webpack

```bash
rm -rf node_modules/.cache
npm start
```

### Issues con mocks

```bash
# Refrescar sistema de mocks
npm run mocks:refresh

# Ver qué mocks se están usando
npm run services:setup
```

### Backend no responde

- Verificar que IACT-api está corriendo en 192.168.56.11:8000
- Verificar REACT_APP_API_URL en .env.local
- Activar REACT_APP_MOCK_MODE=true para desarrollo sin backend

## Contribuciones

Por favor lee CONTRIBUTING.md antes de hacer cambios.

## Licencia

Propiedad de JCG Admin
