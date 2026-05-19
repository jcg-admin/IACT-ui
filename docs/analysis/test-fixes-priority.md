# PLAN PRIORITARIO: Resolver TODOS los Problemas de Tests en IACT
## Focus: Frontend con Mocks - Antes de optimizaciones

---

## 📊 STATUS ACTUAL DE TESTS

```
Test Suites: 26 failed, 21 passed, 47 total
Tests:       34 failed, 188 passed, 222 total
Success Rate: 84.7% (188/222) - Aceptable pero NO óptimo
```

---

## 🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS

### PROBLEMA 1: Módulos Faltantes y Rutas Incorrectas
**Severidad:** CRÍTICA
**Causa:** Rutas relativas vs aliases incorrectos

```
❌ Cannot find module '@config/securityConfig'
❌ Cannot find module '@redux/slices/authSlice'
❌ Cannot find module 'src/components/containers/DashboardPage'
```

### PROBLEMA 2: Imports de SCSS en Tests
**Severidad:** ALTA
**Causa:** Jest no transforma SCSS correctamente

```
❌ Cannot find module '@styles/components/_alert-item.scss'
❌ SyntaxError: Unexpected token '.'
```

### PROBLEMA 3: Tests sin await act()
**Severidad:** ALTA
**Causa:** act() async sin await en tests

```
❌ You called act(async () => ...) without await
❌ This could lead to unexpected testing behaviour
```

### PROBLEMA 4: useForm Hook Tests Fallando
**Severidad:** MEDIA
**Causa:** result.current es null, isSubmitting no actualiza

```
❌ Cannot read properties of null (reading 'handleSubmit')
❌ Expected: true, Received: false
```

### PROBLEMA 5: Componentes en rutas incorrectas
**Severidad:** MEDIA
**Causa:** Estructura de directorios inconsistente

```
❌ src/components/containers/DashboardPage no existe
❌ src/components/containers/LoginPage tiene alias incorrecto
```

---

## ✅ PLAN DE SOLUCIÓN (Pasos en Orden)

---

## PASO 1: Crear securityConfig Faltante

**Archivo:** `src/config/securityConfig.js`

```javascript
/**
 * Security Configuration
 * Configuración de seguridad para IACT
 */

export const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'secretKey',
  'authorization',
  'creditCard',
  'ssn',
  'pinCode',
];

export const SECURITY_CONFIG = {
  // Headers de seguridad
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  },

  // Configuración de CORS
  cors: {
    allowedOrigins: ['http://localhost:3000', 'http://localhost:5000'],
    allowCredentials: true,
  },

  // Configuración de sesión
  session: {
    timeout: 30 * 60 * 1000, // 30 minutos
    warningTime: 5 * 60 * 1000, // Alerta 5 min antes
  },

  // Encryption
  encryption: {
    algorithm: 'AES-256-GCM',
    keyLength: 32,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,
  },
};

export default SECURITY_CONFIG;
```

**Validación:**
```bash
# Verificar que el archivo se crea
ls -la src/config/securityConfig.js
```

---

## PASO 2: Configurar Jest para SCSS

**Archivo:** `jest.setup.js` (actualizar)

```javascript
// ... existing setup ...

// Configurar transformador para SCSS
import moduleNameMapper from 'jest-preset-default';

module.exports = {
  // ... existing config ...
  
  moduleNameMapper: {
    // Ignorar SCSS/CSS en tests
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    
    // Ignorar imágenes
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Mapear aliases de webpack
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@redux/(.*)$': '<rootDir>/src/redux/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@mocks/(.*)$': '<rootDir>/src/mocks/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@styles/(.*)$': '<rootDir>/src/styles/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@router/(.*)$': '<rootDir>/src/router/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@layouts/(.*)$': '<rootDir>/src/layouts/$1',
  },
};
```

**Crear mocks:**

`__mocks__/styleMock.js`:
```javascript
module.exports = {};
```

`__mocks__/fileMock.js`:
```javascript
module.exports = 'test-file-stub';
```

**Validación:**
```bash
mkdir -p __mocks__
touch __mocks__/styleMock.js __mocks__/fileMock.js
```

---

## PASO 3: Corregir useForm.test.js - Agregar await act()

**Archivo:** `__tests__/hooks/useForm.test.js`

**Buscar y reemplazar todos los casos de:**

```javascript
// ANTES ❌
act(() => {
  result.current.handleSubmit({ preventDefault: jest.fn() })
})

// DESPUÉS ✅
await act(async () => {
  await result.current.handleSubmit({ preventDefault: jest.fn() })
})
```

**Ejemplo completo (línea ~160):**

```javascript
test('should set isSubmitting to true during submit', async () => {
  const onSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)))
  const { result } = renderHook(() => useForm({ initialValues: { name: '' }, onSubmit }))

  let _promise
  await act(async () => {
    _promise = result.current.handleSubmit({ preventDefault: jest.fn() })
    // Immediately check if isSubmitting is true
    expect(result.current.isSubmitting).toBe(true)
  })

  // Wait for submit to complete
  await _promise
  
  // After submit completes, isSubmitting should be false
  expect(result.current.isSubmitting).toBe(false)
})
```

**Validación:**
```bash
npm test -- __tests__/hooks/useForm.test.js
# Debería pasar 18/18 tests
```

---

## PASO 4: Crear componentes faltantes

**Archivo:** `src/pages/Dashboard.jsx`

```javascript
/**
 * Dashboard Page
 * Página principal del dashboard
 */

export const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      <p>Bienvenido al dashboard de IACT</p>
    </div>
  );
};

export default Dashboard;
```

**Archivo:** `src/pages/Login.jsx`

```javascript
/**
 * Login Page
 * Página de login
 */

export const Login = () => {
  return (
    <div className="login-page">
      <h1>Login</h1>
      <p>Inicia sesión para continuar</p>
    </div>
  );
};

export default Login;
```

**Validación:**
```bash
ls -la src/pages/Dashboard.jsx
ls -la src/pages/Login.jsx
```

---

## PASO 5: Actualizar Tests de Integración con Alias Correctos

**Archivo:** `tests/integration/dashboard.integration.test.js`

```javascript
// ANTES ❌
import DashboardPage from '../../../src/components/containers/DashboardPage';

// DESPUÉS ✅
import Dashboard from '@pages/Dashboard';
```

**Aplicar a todos los tests de integración:**
- `login.integration.test.js` → Usar `@pages/Login`
- `dashboard.integration.test.js` → Usar `@pages/Dashboard`
- `websocket.integration.test.js` → Revisar imports de slices
- `persistIntegration.test.js` → Verificar @config/securityConfig

**Validación:**
```bash
npm test -- tests/integration/
# Debería pasar todos los tests de integración
```

---

## PASO 6: Revisar Jest Configuration

**Archivo:** `jest.config.js`

Asegurar que tenga:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  moduleNameMapper: {
    // ... (como en PASO 2)
  },
  
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/**/*.test.{js,jsx}',
  ],
  
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
    '**/tests/**/*.[jt]s?(x)',
  ],
};
```

**Validación:**
```bash
npm test -- --showConfig | grep -A 20 moduleNameMapper
```

---

## PASO 7: Ejecutar Tests Completos

```bash
# Limpiar cache de Jest
npm test -- --clearCache

# Ejecutar todos los tests
npm test

# Debería mostrar:
# Test Suites: 0 failed, 47 passed, 47 total ✅
# Tests:       0 failed, 222 passed, 222 total ✅
```

---

## PASO 8: Coverage Report

```bash
# Generar coverage report
npm test -- --coverage

# Esperar:
# Statements   : 85%+
# Branches     : 80%+
# Functions    : 85%+
# Lines        : 85%+
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

```
PASO 1: Crear securityConfig
[ ] Crear src/config/securityConfig.js
[ ] Exportar SENSITIVE_FIELDS
[ ] Exportar SECURITY_CONFIG
[ ] Verificar que no hay errores de import

PASO 2: Jest SCSS Configuration
[ ] Actualizar moduleNameMapper en jest.setup.js/jest.config.js
[ ] Crear __mocks__/styleMock.js
[ ] Crear __mocks__/fileMock.js
[ ] Agregar todos los aliases de webpack

PASO 3: Corregir useForm Tests
[ ] Agregar await a todos los act() calls
[ ] Revisar test de isSubmitting
[ ] Revisar test de submit errors
[ ] Ejecutar: npm test -- useForm.test.js

PASO 4: Crear componentes faltantes
[ ] Crear src/pages/Dashboard.jsx
[ ] Crear src/pages/Login.jsx
[ ] Verificar que exportan default

PASO 5: Actualizar Tests de Integración
[ ] Actualizar imports en dashboard.integration.test.js
[ ] Actualizar imports en login.integration.test.js
[ ] Actualizar imports en websocket.integration.test.js
[ ] Actualizar imports en persistIntegration.test.js

PASO 6: Jest Configuration Review
[ ] Verificar jest.config.js
[ ] Verificar setupFilesAfterEnv
[ ] Verificar moduleNameMapper
[ ] Verificar transform

PASO 7: Ejecutar Tests Completos
[ ] npm test -- --clearCache
[ ] npm test
[ ] Verificar: 0 failed, 222 passed

PASO 8: Coverage Report
[ ] npm test -- --coverage
[ ] Statements 85%+
[ ] Branches 80%+
[ ] Functions 85%+
```

---

## 🎯 TIMELINE ESTIMADO

| Paso | Tarea | Tiempo |
|------|-------|--------|
| 1 | Crear securityConfig | 10 min |
| 2 | Jest SCSS Config | 20 min |
| 3 | Corregir useForm tests | 30 min |
| 4 | Crear componentes | 15 min |
| 5 | Actualizar tests integración | 30 min |
| 6 | Jest config review | 15 min |
| 7 | Test completo | 15 min |
| 8 | Coverage report | 10 min |
| **TOTAL** | **Resolver TODOS los tests** | **2.5 horas** |

---

## 📈 RESULTADO ESPERADO

**ANTES:**
```
Test Suites: 26 failed, 21 passed
Tests:       34 failed, 188 passed (84.7%)
```

**DESPUÉS:**
```
Test Suites: 0 failed, 47 passed ✅
Tests:       0 failed, 222 passed ✅
Coverage:    85%+ en todos los aspectos
```

---

## 🚀 PRÓXIMOS PASOS (DESPUÉS de tests)

Una vez que TODOS los tests pasen (0 failed):

1. ✅ Refactor de componentes si es necesario
2. ✅ Mejoras en cobertura de tests
3. ✅ Optimizaciones de performance (Webpack)
4. ✅ Mejoras futuras:
   - Image optimization (image-webpack-loader)
   - Bundle analyzer reports
   - Performance monitoring (Lighthouse CI)
   - Testing de lazy loading
   - Service Worker offline
   - HTTP/2 Server Push
   - Resource hints (preload, prefetch)

---

**STATUS:** ✅ Plan listo para ejecución

**IMPORTANTE:** Ejecutar en este orden exacto para evitar conflictos de dependencias.

**SOLO TESTS Y FRONTEND CON MOCKS** - Sin PWA en ningún lado.


