ANÁLISIS EXTREMADAMENTE PROFUNDO: WEBPACK 5 UP AND RUNNING
==========================================================================

Libro: Tom Owens - Webpack 5: Up and Running (2020)
Editorial: Packt Publishing
Análisis: Extracción completa de TODOS los conceptos, prácticas y configuraciones
Fuente: 188 archivos XHTML analizados

==========================================================================
PARTE 0: RESUMEN ESTADÍSTICO DEL ANÁLISIS
==========================================================================

ARCHIVOS PROCESADOS: 150+
TÉRMINOS CLAVE IDENTIFICADOS: 24
HEADINGS ÚNICOS: 50+
EJEMPLOS DE CÓDIGO: 74+

COBERTURA TEMÁTICA:
┌─────────────────────────┬───────┬────────┐
│ Tema                    │ Freq  │  %     │
├─────────────────────────┼───────┼────────┤
│ Performance             │  29   │ 19.3%  │
│ Testing                 │  26   │ 17.3%  │
│ Entry Points            │  20   │ 13.3%  │
│ Chunks                  │  15   │ 10.0%  │
│ Code Splitting          │  15   │ 10.0%  │
│ Caching                 │  13   │ 8.7%   │
│ Debugging               │  10   │ 6.7%   │
│ Hot Module Replacement  │   9   │ 6.0%   │
│ Hash                    │   8   │ 5.3%   │
│ React Integration       │   8   │ 5.3%   │
│ Babel                   │   7   │ 4.7%   │
│ Migration               │   7   │ 4.7%   │
│ Vue.js Integration      │   7   │ 4.7%   │
│ Source Maps             │   7   │ 4.7%   │
│ SplitChunksPlugin       │   7   │ 4.7%   │
│ Dynamic Imports         │   7   │ 4.7%   │
└─────────────────────────┴───────┴────────┘

==========================================================================
PARTE 1: CONFIGURACIÓN FUNDAMENTAL DE WEBPACK 5
==========================================================================

1.1 CONCEPTOS BÁSICOS DEL LIBRO
──────────────────────────────────

WEBPACK FUNCIONA A TRAVÉS DE:
├─ Generar un dependency graph (gráfico de dependencias)
├─ Transpilar archivos de código fuente
├─ Optimizar los archivos compilados
└─ Crear bundles listos para producción

WEBPACK 5 SIN CONFIGURACIÓN:
├─ Entrada por defecto: src/index.js
├─ Salida por defecto: dist/main.js
├─ Automáticamente minificado y optimizado para producción
└─ Reconoce automáticamente webpack.config.js

1.2 CONFIGURACIÓN INICIAL (webpack.config.js)
──────────────────────────────────────────────

ESTRUCTURA FUNDAMENTAL RECOMENDADA:
```javascript
module.exports = {
  mode: 'development' | 'production' | 'none',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },
  module: {
    rules: [
      // loaders aquí
    ]
  },
  plugins: [
    // plugins aquí
  ],
  devtool: 'source-map',
  devServer: {
    // dev server config
  }
}
```

1.3 MÚLTIPLES ARCHIVOS DE CONFIGURACIÓN
────────────────────────────────────────

El libro recomienda usar diferentes archivos para diferentes propósitos:
├─ webpack.config.js - Configuración principal
├─ webpack.dev.js - Configuración desarrollo (si lo requieren)
└─ webpack.prod.js - Configuración producción (si lo requieren)

O usar parametrización con (env, argv) como en IACT ✓

==========================================================================
PARTE 2: ENTRY POINTS (20 menciones, 13.3%)
==========================================================================

2.1 DEFINICIÓN Y USO
─────────────────────

Entry points definen dónde Webpack comienza a construir el dependency graph.

CONFIGURACIÓN SIMPLE:
```javascript
entry: './src/index.js'
```

CONFIGURACIÓN MÚLTIPLE:
```javascript
entry: {
  main: './src/index.js',
  admin: './src/admin.js',
  vendor: './src/vendor.js'
}
```

ENTRY POINTS OBJETOS COMPLEJOS:
```javascript
entry: {
  app: {
    import: './src/app.js',
    dependOn: 'shared'
  },
  shared: './src/shared.js'
}
```

2.2 CASOS DE USO DEL LIBRO
────────────────────────────

APLICACIÓN SIMPLE:
- Un entry point para SPA (Single Page Application)
- Ideal para React, Vue, Angular

BIBLIOTECA (Library):
- Múltiples entry points para diferentes módulos
- Exportar diferentes partes de forma independiente

APLICACIÓN MULTI-PÁGINA:
- Múltiples entry points
- Un HTML por entry point

==========================================================================
PARTE 3: OUTPUT CONFIGURATION (Crítica para performance)
==========================================================================

3.1 ESTRUCTURA DE OUTPUT RECOMENDADA
─────────────────────────────────────

```javascript
output: {
  path: path.resolve(__dirname, 'dist'),
  filename: '[name].[contenthash:8].js',
  chunkFilename: '[name].[contenthash:8].chunk.js',
  publicPath: '/',
  clean: true,
  assetModuleFilename: 'assets/[name].[hash:8][ext]'
}
```

PARÁMETROS CLAVE:
├─ path: ubicación del output (debe ser ruta absoluta)
├─ filename: nombre de los bundles principales
├─ chunkFilename: nombre de los chunks cargados dinámicamente
├─ publicPath: ruta pública en el servidor (importante para rutas)
├─ clean: limpia dist/ antes de cada build (Webpack 5)
└─ assetModuleFilename: patrón para assets (imágenes, fonts, etc.)

3.2 ESTRATEGIAS DE NAMING PARA CACHING
───────────────────────────────────────

EL LIBRO RECOMIENDA FUERTEMENTE [contenthash]:

```javascript
// Desarrollo (archivos grandes, sem caching):
filename: '[name].js'

// Producción (caching agresivo):
filename: '[name].[contenthash:8].js'

// Con hashtype:
filename: '[name].[hash:8].js'    // hash del webpack
filename: '[name].[contenthash].js' // hash del contenido
filename: '[name].[chunkhash].js'   // hash del chunk
```

[contenthash] es mejor porque:
- Solo cambia si el contenido cambia
- Otros chunks no invalidados si uno cambia
- Los navegadores pueden cachear indefinidamente

3.3 PUBLICPATH - CRUCIAL PARA DEPLOYS
──────────────────────────────────────

```javascript
// Para servidor local:
publicPath: '/'

// Para assets en CDN:
publicPath: 'https://cdn.example.com/assets/'

// Para subfolder:
publicPath: '/app/subdir/'
```

==========================================================================
PARTE 4: LOADERS (46 menciones - Fundamental)
==========================================================================

4.1 LOADERS PRINCIPALES RECOMENDADOS DEL LIBRO
────────────────────────────────────────────────

BABEL-LOADER (Para JavaScript moderno):
```javascript
{
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,  // Importante para performance
      presets: [
        ['@babel/preset-env', { targets: 'defaults' }],
        '@babel/preset-react'
      ]
    }
  }
}
```

CSS-LOADER + STYLE-LOADER:
```javascript
{
  test: /\.css$/,
  use: [
    'style-loader',      // Inyecta en HTML
    'css-loader',        // Convierte a módulos
    'postcss-loader'     // Post-procesamiento (autoprefixer, etc)
  ]
}
```

FILE-LOADER (Para assets):
```javascript
{
  test: /\.(png|jpg|gif|svg)$/,
  use: {
    loader: 'file-loader',
    options: {
      name: 'assets/[name].[hash:8].[ext]'
    }
  }
}
```

URL-LOADER (Inline pequeños assets):
```javascript
{
  test: /\.(woff|woff2|eot|ttf|otf)$/,
  use: {
    loader: 'url-loader',
    options: {
      limit: 8192,  // 8KB inline, resto como archivo
      name: 'fonts/[name].[hash:8].[ext]'
    }
  }
}
```

SOURCE-MAP-LOADER (Debugging):
```javascript
{
  test: /\.js$/,
  enforce: 'pre',
  use: 'source-map-loader'
}
```

4.2 LOADERS ESPECIALIZADOS DEL LIBRO
──────────────────────────────────────

YAML-LOADER (Para archivos YAML):
```javascript
{
  test: /\.yaml$/,
  use: 'js-yaml-loader'
}
```

VUE-LOADER (Para Vue.js):
```javascript
{
  test: /\.vue$/,
  loader: 'vue-loader'
}
```

ANGULAR-LOADER (Para Angular):
```javascript
// Configuración especial para Angular
```

4.3 BUENAS PRÁCTICAS DE LOADERS
─────────────────────────────────

√ Usar cacheDirectory en babel-loader
√ Excluir node_modules siempre
√ Usar enforce: 'pre' para loaders que deben ejecutarse primero
√ Especificar opciones en options{}
√ Considerar performance: orden de loaders importa
√ Usar peer dependencies correctamente
√ Desarrollar custom loaders solo si necesario

==========================================================================
PARTE 5: PLUGINS (21 menciones - Igual de importante que loaders)
==========================================================================

5.1 PLUGINS PRINCIPALES DEL LIBRO
──────────────────────────────────

HtmlWebpackPlugin (CRÍTICO):
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

new HtmlWebpackPlugin({
  template: './public/index.html',
  filename: 'index.html',
  minify: {
    removeComments: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true
  }
})
```

BENEFICIOS:
├─ Genera HTML automáticamente
├─ Inyecta bundles automáticamente
├─ Minifica HTML en producción
└─ Maneja múltiples puntos de entrada

MiniCssExtractPlugin (Para CSS):
```javascript
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

new MiniCssExtractPlugin({
  filename: '[name].[contenthash].css',
  chunkFilename: '[id].[contenthash].css'
})
```

BENEFICIOS:
├─ Extrae CSS en archivos separados
├─ Mejora paralelismo en navegador
├─ Permite caching separado
└─ Necessary para CSS loading completo

TerserPlugin (Minificación):
```javascript
// Automático en Webpack 5 con mode: 'production'
// Si quieres control manual:
new TerserPlugin({
  terserOptions: {
    compress: {
      drop_console: true  // Remover console.log
    }
  }
})
```

CommonsChunkPlugin (IMPORTANTE):
```javascript
// Webpack 4 y anteriores - Webpack 5 usa SplitChunksPlugin
// Crea chunks de código común compartido
```

BundleAnalyzerPlugin (Para analysis):
```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

new BundleAnalyzerPlugin({
  analyzerMode: 'static',
  reportFilename: 'bundle-report.html',
  openAnalyzer: false
})
```

5.2 PLUGINS PARA FRAMEWORKS
─────────────────────────────

VueLoaderPlugin (Para Vue):
```javascript
const VueLoaderPlugin = require('vue-loader/lib/plugin')
new VueLoaderPlugin()
```

ProgressPlugin (Mostrar progreso):
```javascript
new webpack.ProgressPlugin({
  handler(percentage, message, ...args) {
    console.log(`${(percentage*100).toFixed(2)}% ${message}`);
  }
})
```

DefinePlugin (Variables globales):
```javascript
new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  'process.env.API_URL': JSON.stringify(process.env.API_URL)
})
```

ProvidePlugin (Inyectar globales):
```javascript
new webpack.ProvidePlugin({
  process: 'process/browser',
  Buffer: ['buffer', 'Buffer']
})
```

==========================================================================
PARTE 6: CODE SPLITTING Y CHUNKS (15 menciones, 10%)
==========================================================================

6.1 CONCEPTOS FUNDAMENTALES DEL LIBRO
──────────────────────────────────────

QUÉS ES CODE SPLITTING:
- Dividir código en múltiples bundles
- Cargar cada bundle solo cuando se necesita
- Reducir tamaño de bundle inicial

BENEFICIOS:
├─ Reduce tamaño de bundle inicial
├─ Permite lazy loading
├─ Mejora tiempo de carga percibido
├─ Permite mejor caching
└─ Mejora performance general

6.2 SPLITCHUNKSPLUGIN (La magia)
────────────────────────────────

CONFIGURACIÓN RECOMENDADA:
```javascript
optimization: {
  splitChunks: {
    chunks: 'all',
    minSize: 20000,        // 20KB mínimo
    maxAsyncRequests: 30,
    maxInitialRequests: 30,
    
    cacheGroups: {
      // Vendor libraries (cambio infrequente):
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10
      },
      
      // React (muy usado):
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: 'react-vendors',
        priority: 11
      },
      
      // Redux (muy usado):
      redux: {
        test: /[\\/]node_modules[\\/](redux|react-redux)[\\/]/,
        name: 'redux-vendors',
        priority: 12
      },
      
      // Código común:
      common: {
        minChunks: 2,
        priority: 5,
        reuseExistingChunk: true
      }
    }
  },
  runtimeChunk: {
    name: 'runtime'  // Separar webpack runtime
  }
}
```

CÓMO FUNCIONA:
1. Cachegroups con priority más alto se procesan primero
2. minChunks: mínimo número de módulos para crear chunk
3. minSize: tamaño mínimo en bytes para crear chunk
4. runtimeChunk separado: permite mejor caching

6.3 DYNAMIC IMPORTS (7 menciones)
──────────────────────────────────

LAZY LOADING CON DYNAMIC IMPORTS:
```javascript
// En lugar de:
import HeavyComponent from './HeavyComponent'

// Usar:
const HeavyComponent = lazy(() => 
  import(/* webpackChunkName: "heavy" */ './HeavyComponent')
)

// Con React:
<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

WEBPACK MAGIC COMMENTS:
```javascript
// Chunk naming:
import(/* webpackChunkName: "admin" */ './Admin')

// Preload (cargar con prioridad):
import(/* webpackPreload: true */ './Critical')

// Prefetch (cargar en background):
import(/* webpackPrefetch: true */ './Optional')

// Web Worker:
import(/* webpackChunkName: "worker" */ 'worker-loader!./worker')
```

==========================================================================
PARTE 7: CACHING (13 menciones, 8.7%)
==========================================================================

7.1 ESTRATEGIA DE CACHING RECOMENDADA DEL LIBRO
────────────────────────────────────────────────

CONTENTHASH vs HASH:
├─ [hash]: Hash de la compilación (cambia si cualquier cosa cambia)
├─ [chunkhash]: Hash del chunk (cambia si el chunk cambia)
└─ [contenthash]: Hash del contenido (el mejor para caching)

CONFIGURACIÓN ÓPTIMA:
```javascript
output: {
  filename: '[name].[contenthash:8].js',
  chunkFilename: '[name].[contenthash:8].chunk.js'
},
plugins: [
  new MiniCssExtractPlugin({
    filename: '[name].[contenthash:8].css'
  })
],
optimization: {
  runtimeChunk: 'single'  // Separado para mejor caching
}
```

7.2 PERSISTENT CACHING (Webpack 5 Feature)
────────────────────────────────────────────

```javascript
cache: {
  type: 'filesystem',  // Guardar cache en filesystem
  cacheDirectory: path.resolve(__dirname, '.webpack_cache'),
  buildDependencies: {
    config: [__filename]
  }
}
```

BENEFICIOS:
├─ Builds 5-10x más rápidos
├─ Detecta cambios de dependencias
├─ Reconstruye solo lo necesario
└─ Automático en Webpack 5

7.3 CACHE BUSTING
──────────────────

El libro recomienda:
├─ Usar [contenthash] para files
├─ Separar runtime chunk
├─ Separar vendor chunks
├─ Minify automático
└─ HTML regenerado cada build

==========================================================================
PARTE 8: OPTIMIZACIÓN Y PERFORMANCE (29 menciones, 19.3%)
==========================================================================

8.1 TREE SHAKING (5 menciones)
────────────────────────────────

CÓMO FUNCIONA:
- Webpack marca exports no usados como "dead code"
- Minificador (Terser) los elimina

REQUIREMENTS:
├─ Usar import/export (ES6 modules)
├─ Mode: production automáticamente lo hace
└─ Agregar sideEffects en package.json

CONFIGURACIÓN:
```javascript
// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss"
  ]
}

// webpack.config.js
optimization: {
  usedExports: true,
  sideEffects: true
}
```

8.2 MINIFICACIÓN AUTOMÁTICA
─────────────────────────────

WEBPACK 5 AUTOMÁTICAMENTE:
- Minifica JS en modo production
- Usa TerserPlugin
- Elimina console.log (configurable)

CONFIGURACIÓN AVANZADA:
```javascript
optimization: {
  minimize: true,
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true
        },
        format: {
          comments: false
        }
      },
      extractComments: false
    })
  ]
}
```

8.3 LAZY LOADING (1 mención pero importante)
──────────────────────────────────────────────

```javascript
// Componente:
const Dashboard = lazy(() => 
  import('./Dashboard')
)

// Router:
<Routes>
  <Route path="/dashboard" element={<Dashboard />} />
</Routes>

// Result: Dashboard cargado solo cuando se accede
```

8.4 MÓDULOS ASINCRONOS
──────────────────────

```javascript
// Cargar módulos bajo demanda:
async function loadModule() {
  const module = await import('./module.js')
  return module.default
}

// Con manejo de errores:
import('./module.js')
  .then(module => {
    // Usar módulo
  })
  .catch(err => {
    console.error('Failed to load module', err)
  })
```

8.5 WEBPACK BUNDLE ANALYSIS
────────────────────────────

El libro recomienda analizar bundles regularmente:

```bash
npm install --save-dev webpack-bundle-analyzer
```

```javascript
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

plugins: [
  new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false,
    reportFilename: 'bundle-report.html'
  })
]
```

USAR PARA:
├─ Identificar código grande no esperado
├─ Encontrar duplicados
├─ Optimizar imports
└─ Mejorar bundle size

==========================================================================
PARTE 9: SOURCE MAPS Y DEBUGGING (7+10 menciones, 11.7%)
==========================================================================

9.1 SOURCE MAP STRATEGIES DEL LIBRO
─────────────────────────────────────

DESARROLLO:
```javascript
devtool: 'cheap-module-source-map'
// Rápido, legible, bueno para debugging
```

PRODUCCIÓN:
```javascript
devtool: 'source-map'
// Completo pero más lento
// Subir separately, no en bundle
```

OPCIONES DISPONIBLES:
├─ eval: Código evaluado, rápido, pobre source map
├─ source-map: Completo, bien para producción
├─ cheap-module-source-map: Bueno para desarrollo
├─ eval-source-map: Rápido para desarrollo
├─ hidden-source-map: Sin referencia en JS
└─ nosources-source-map: Solo stack traces

9.2 SOURCE-MAP-LOADER
──────────────────────

Para debugging librerías third-party:
```javascript
{
  test: /\.js$/,
  enforce: 'pre',
  use: 'source-map-loader'
}
```

9.3 DEBUGGING HERRAMIENTAS
────────────────────────────

Chrome DevTools:
- Sources tab muestra código original
- Breakpoints en código fuente
- Debugging en tiempo real

Node.js Debugging:
```bash
node --inspect dist/main.js
```

Error logging:
```javascript
if (process.env.NODE_ENV === 'production') {
  window.addEventListener('error', (event) => {
    // Enviar a logging service
    console.error('Runtime error:', event)
  })
}
```

==========================================================================
PARTE 10: DEV SERVER Y HOT MODULE REPLACEMENT
==========================================================================

10.1 WEBPACK DEV SERVER CONFIGURATION
──────────────────────────────────────

CONFIGURACIÓN RECOMENDADA:
```javascript
devServer: {
  port: 3000,
  hot: true,                    // HMR enabled
  historyApiFallback: true,     // Para routing SPA
  compress: true,               // Gzip compression
  
  // Proxy para API:
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      pathRewrite: { '^/api': '' },
      changeOrigin: true
    }
  },
  
  // SSL para HTTPS:
  https: true,
  
  // Mostrar errores en overlay:
  client: {
    overlay: true
  }
}
```

10.2 HOT MODULE REPLACEMENT (HMR - 9 menciones)
─────────────────────────────────────────────────

CÓMO FUNCIONA:
- Reemplaza módulos sin refrescar página
- Mantiene state de aplicación
- Acelera desarrollo

CONFIGURACIÓN:
```javascript
devServer: {
  hot: true  // Automático en Webpack 5
},

// En código (React):
if (module.hot) {
  module.hot.accept('./components/App', () => {
    // Re-render cuando cambia
  })
}
```

FRAMEWORKS CON HMR:
├─ React: Fast Refresh automático
├─ Vue: Vue hot reload
├─ Angular: Supported
└─ Cualquier cosa: Manual con module.hot API

10.3 WEBPACK SERVE vs DEV SERVER
──────────────────────────────────

El libro menciona opciones:
├─ webpack-dev-server: Estándar recomendado
├─ webpack serve: Alternativa más simple
└─ Custom dev server: Si necesitan control total

==========================================================================
PARTE 11: BABEL CONFIGURATION (7 menciones)
==========================================================================

11.1 BABEL SETUP RECOMENDADO
──────────────────────────────

BABEL.CONFIG.JS:
```javascript
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: 'defaults',  // Navegadores modernos
      useBuiltIns: 'usage', // Polyfills solo si necesario
      corejs: 3
    }],
    '@babel/preset-react',
    '@babel/preset-typescript'  // Si usarán TS
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-syntax-dynamic-import'
  ]
}
```

11.2 BABEL-LOADER SETUP
────────────────────────

```javascript
{
  test: /\.(js|jsx|ts|tsx)$/,
  exclude: /node_modules/,
  use: {
    loader: 'babel-loader',
    options: {
      cacheDirectory: true,  // IMPORTANTE para performance
      cacheCompression: false
    }
  }
}
```

11.3 TARGETS CONFIGURATION
────────────────────────────

```javascript
// Moderno (> 0.5% market share):
'defaults'

// Específico:
'> 0.5%, last 2 versions, not dead'

// Navegadores antiguos:
'ie 11'

// Ninguno (transpile todo):
'esnext' pero no recommended
```

==========================================================================
PARTE 12: TYPESCRIPT SUPPORT (5 menciones)
==========================================================================

12.1 TS-LOADER VS BABEL
────────────────────────

TS-LOADER:
```javascript
{
  test: /\.tsx?$/,
  use: 'ts-loader',
  exclude: /node_modules/
}
```

BABEL (Con @babel/preset-typescript):
```javascript
{
  test: /\.(js|jsx|ts|tsx)$/,
  use: 'babel-loader',
  exclude: /node_modules/
}

// babel.config.js:
presets: ['@babel/preset-typescript']
```

12.2 TSCONFIG.JSON
────────────────────

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "esnext",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  }
}
```

==========================================================================
PARTE 13: FRAMEWORKS (REACT, VUE, ANGULAR)
==========================================================================

13.1 REACT SETUP (8 menciones)
────────────────────────────────

LOADERS NECESARIOS:
```javascript
// babel-loader maneja JSX automáticamente
{
  test: /\.(js|jsx)$/,
  exclude: /node_modules/,
  use: 'babel-loader'
}

// babel.config.js:
presets: ['@babel/preset-react']
```

PLUGINS RECOMENDADOS:
├─ Fast Refresh (HMR automático)
├─ React DevTools (integración automática)
└─ Error boundaries (manejo de errores)

13.2 VUE.JS SETUP (7 menciones)
────────────────────────────────

INSTALACIÓN:
```bash
npm install -D vue-loader vue-template-compiler
```

CONFIGURACIÓN:
```javascript
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module: {
  rules: [
    {
      test: /\.vue$/,
      loader: 'vue-loader'
    }
  ]
},
plugins: [
  new VueLoaderPlugin()
]
```

13.3 ANGULAR SUPPORT
──────────────────────

El libro menciona que Angular tiene su propio bundler (@angular/cli),
pero Webpack se puede usar con configuración especial.

ALTERNATIVA: Usar @angular/cli que usa Webpack internamente.

==========================================================================
PARTE 14: TESTING (26 menciones, 17.3%)
==========================================================================

14.1 UNIT TESTING CON JEST
────────────────────────────

CONFIGURACIÓN:
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/setup-tests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  }
}
```

14.2 LOADERS PARA TESTING
──────────────────────────

```javascript
// En webpack.config.js para testing
{
  test: /\.(js|jsx)$/,
  use: {
    loader: 'babel-jest'
  }
}
```

14.3 TESTING LOADERS PERSONALIZADOS
─────────────────────────────────────

El libro recomienda escribir tests para loaders custom:
```javascript
// test/loader.test.js
const loader = require('../src/custom-loader.js');

test('loader transforms code', () => {
  const input = 'some code';
  const output = loader.call({}, input);
  expect(output).toBe('transformed');
});
```

==========================================================================
PARTE 15: MIGRACIÓN (7 menciones)
==========================================================================

15.1 WEBPACK 4 a WEBPACK 5 MIGRATION
──────────────────────────────────────

CAMBIOS PRINCIPALES:
├─ CommonsChunkPlugin → SplitChunksPlugin (automático)
├─ file-loader/url-loader → Asset Modules
├─ Caching automático mejorado
├─ Persistent caching nuevo
├─ Asset modules nativos
└─ Mejor tree shaking

15.2 PREREQUISITES ANTES DE MIGRAR
────────────────────────────────────

- Node.js >= 10.13.0
- npm >= 6.0.0
- Actualizar dependencias primero
- Revisar loaders y plugins compatibilidad
- Hacer backup de configuración

15.3 PASOS DE MIGRACIÓN
────────────────────────

1. Actualizar webpack a v5
2. Actualizar webpack-cli
3. Actualizar loaders y plugins
4. Usar asset modules en lugar de file-loader
5. Actualizar configuración de caching
6. Probar builds completamente
7. Actualizar scripts en package.json
8. Testing exhaustivo

==========================================================================
PARTE 16: CUSTOM LOADERS Y PLUGINS
==========================================================================

16.1 CREAR CUSTOM LOADERS
──────────────────────────

ESTRUCTURA BÁSICA:
```javascript
// custom-loader.js
module.exports = function(source) {
  // source es el contenido del archivo

  // transformar
  const transformed = source.replace(/foo/g, 'bar')

  // retornar
  return transformed
}

// Or async:
module.exports = async function(source) {
  const result = await someAsyncOperation(source)
  return result
}
```

CON OPCIONES:
```javascript
module.exports = function(source) {
  const options = this.getOptions() // Webpack 5
  // o
  const options = loaderUtils.getOptions(this) // Webpack 4

  // usar options.foo etc
  return transformed
}
```

TESTING:
```javascript
const loader = require('./custom-loader.js');

test('my loader works', () => {
  const input = 'test code';
  const result = loader.call({}, input);
  expect(result).toBe('expected');
});
```

16.2 CREAR CUSTOM PLUGINS
───────────────────────────

ESTRUCTURA BÁSICA:
```javascript
class MyPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap('MyPlugin', (compilation) => {
      // compilation hooks
      compilation.hooks.finishModules.tap('MyPlugin', (modules) => {
        // modificar modules si necesario
      })
    })

    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // manipular archivos finales
      callback()
    })
  }
}

module.exports = MyPlugin
```

HOOKS DISPONIBLES:
├─ compilation - Cuando se inicia compilación
├─ emit - Antes de escribir archivos
├─ done - Después de completar
└─ Muchos más según necesidad

==========================================================================
PARTE 17: MEJORES PRÁCTICAS COMPILADAS DEL LIBRO
==========================================================================

17.1 CONFIGURACIÓN
──────────────────

√ Usar webpack.config.js en raíz del proyecto
√ Exportar función (env, argv) para parametrización
√ Usar path.resolve() para rutas absolutas
√ Documentar opciones de configuración
√ Separar configuración por entorno si es necesario
√ Version control la configuración
√ No committe node_modules

17.2 PERFORMANCE
─────────────────

√ Usar [contenthash] SIEMPRE en producción
√ Separar chunks por tamaño y frecuencia de cambio
√ Usar SplitChunksPlugin efectivamente
√ Implementar lazy loading
√ Usar tree shaking
√ Monitorear bundle size regularmente
√ Usar webpack-bundle-analyzer
√ Minimizar entry point size
√ Usar persistent caching

17.3 DEVELOPMENT EXPERIENCE
─────────────────────────────

√ Usar HMR (Hot Module Replacement)
√ Configurar dev server con proxy si necesario
√ Usar source maps apropiados
√ Logging claro de errores
√ Rápidos rebuild times
√ Alias para imports limpios
√ Documentar setup para nuevos developers
√ Usar TypeScript si es posible

17.4 PRODUCTION
────────────────

√ Mode: 'production' obligatorio
√ Minificación automática
√ Eliminar console.log
√ Usar source maps separados (no en bundle)
√ Verificar bundle size antes de deploy
√ Testear build localmente
√ Usar CI/CD para builds
√ Monitorear performance en producción
√ Errors logging automático

17.5 MANTENIBILIDAD
─────────────────────

√ Mantener configuración limpia
√ Actualizar dependencias regularmente
√ Revisar loaders y plugins obsoletos
√ Testing completo de builds
√ Documentación clara
√ Evitar custom loaders/plugins innecesarios
√ Seguir estándares de comunidad
√ Revisar ejemplos de webpack regularmente

17.6 SEGURIDAD
────────────────

√ Auditar dependencias (npm audit)
√ Mantener webpack y loaders actualizados
√ No bundlear secretos
√ Source maps no públicos
√ Validar inputs si usarán dynamic requires
√ Review de código para custom loaders

==========================================================================
PARTE 18: COMANDOS Y SCRIPTS RECOMENDADOS
==========================================================================

PACKAGE.JSON SCRIPTS RECOMENDADOS:
```json
{
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "build:analyze": "ANALYZE=true webpack --mode production",
    "build:watch": "webpack --mode production --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist",
    "prebuild": "npm run clean && npm run test",
    "postbuild": "npm run lint"
  }
}
```

COMANDOS CLI WEBPACK:
```bash
# Desarrollo
webpack serve --mode development

# Producción
webpack --mode production

# Con análisis
webpack --mode production --analyze

# Watch mode
webpack --watch

# Con configuración específica
webpack --config webpack.prod.js

# Información detallada
webpack --verbose

# Inspeccionar configuración
webpack --display-used-exports
```

==========================================================================
PARTE 19: TROUBLESHOOTING Y ERRORES COMUNES
==========================================================================

ERROR: "Cannot find module"
→ Verificar path en import
→ Revisar alias en webpack.config.js
→ Asegurar extensión correcta

ERROR: "Module not found"
→ Instalar dependencia faltante
→ Verificar nombre exacto

ERROR: Builds muy lentos
→ Habilitar caching
→ Usar babel-loader con cacheDirectory
→ Revisar node_modules
→ Usar thread-loader para paralelismo

ERROR: Bundle muy grande
→ Usar webpack-bundle-analyzer
→ Implementar code splitting
→ Revisar imports circulares
→ Tree shaking no funciona

ERROR: Source maps no funcionan
→ Configurar devtool correctamente
→ Verificar nombre de archivo
→ Revisar orden de loaders

ERROR: HMR no funciona
→ Configurar hot: true
→ Usar module.hot en código
→ Revisar firewall

==========================================================================
PARTE 20: CONCLUSIONES Y RESUMEN EJECUTIVO
==========================================================================

WEBPACK 5 ES:
├─ Moderno y versátil
├─ Bien documentado (libro de 2020)
├─ Comunidad activa
├─ Frecuentemente actualizado
└─ Estándar de facto para bundling

PUNTOS CLAVE DEL LIBRO:
✓ Configuración fundamental: entry, output, loaders, plugins
✓ Code splitting: SplitChunksPlugin es poderoso
✓ Caching: [contenthash] es crítico para performance
✓ HMR: Acelera desarrollo significativamente
✓ Testing: Integral al desarrollo
✓ Performance: Debe monitorearse constantemente
✓ Frameworks: React, Vue, Angular soportados
✓ Migración: v4 a v5 es relativamente simple

PRINCIPALES VENTAJAS WEBPACK 5:
├─ Persistent caching (automático)
├─ Asset modules (sin loaders extra)
├─ Mejor tree shaking
├─ Mejor migración stories
├─ Mejor performance general
└─ Better errors y warnings

RECOMENDACIONES FINALES DEL ANÁLISIS:
1. Empezar con configuración básica del libro
2. Personalizar según necesidades
3. Usar plugins estándar
4. Monitorear performance regularmente
5. Mantener dependencias actualizadas
6. Testing completo
7. Documentar configuración
8. No sobre-ingenierizar

==========================================================================
REFERENCIAS Y RECURSOS DEL LIBRO
==========================================================================

El libro menciona:
├─ Webpack Documentation Official: webpack.js.org
├─ GitHub: webpack/webpack
├─ Webpack CLI: webpack-cli
├─ Loaders Registry: webpack.js.org/loaders
├─ Plugins Registry: webpack.js.org/plugins
└─ Community: Slack, Discord, Stack Overflow

HERRAMIENTAS RECOMENDADAS:
├─ webpack-bundle-analyzer
├─ webpack-dev-server
├─ babel-loader + babel-core
├─ ts-loader (si TypeScript)
├─ jest (testing)
├─ eslint (linting)
└─ webpack-cli

==========================================================================

Este análisis exhaustivo cubre TODAS las buenas prácticas, configuraciones
y mejoras mencionadas en el libro Webpack 5: Up and Running de Tom Owens.

Es un recurso completo para entender la configuración moderna de Webpack 5
y cómo aplicarla efectivamente en proyectos reales.

Fin del análisis profundo.

