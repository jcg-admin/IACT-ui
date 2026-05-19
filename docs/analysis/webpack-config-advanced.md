# webpack.config.js — Configuración Avanzada (referencia)

> Extraído de `webpack.config.js` (del merge con develop) antes de su eliminación.
> El archivo principal activo es `webpack.config.cjs`.
> Este documento recoge las configuraciones avanzadas que pueden integrarse
> en `webpack.config.cjs` cuando se necesiten.

---

## Diferencias clave respecto a webpack.config.cjs

| Característica | webpack.config.cjs (activo) | webpack.config.js (eliminado) |
|---------------|----------------------------|-------------------------------|
| Filesystem cache | No | Sí — `.webpack_cache/` |
| BundleAnalyzerPlugin | No | Sí — `ANALYZE=true` env var |
| TerserPlugin | No (usa default) | Sí — `drop_console` en prod |
| SplitChunks | `chunks: 'all'` básico | Granular por vendor: react, redux, charts |
| DefinePlugin | No | Sí — API_URL, WS_URL, APP_VERSION |
| DevServer proxy | No | Sí — `/api` → localhost:5000, `/ws` → ws:8080 |
| Devtool | No | Sí — `cheap-module-source-map` dev, `source-map` prod |
| Performance hints | No | Sí — warnings en prod |
| postcss-loader | No | Sí — en cadena CSS |

---

## Configuraciones para integrar en webpack.config.cjs

### 1. Filesystem cache (mejora velocidad de builds incrementales)

```js
cache: {
  type: 'filesystem',
  cacheDirectory: path.resolve(__dirname, '.webpack_cache'),
  buildDependencies: {
    config: [__filename],
  },
},
```

> Añadir `.webpack_cache/` a `.gitignore`.

### 2. DefinePlugin — Variables de entorno en el bundle

```js
new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  'process.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:5000'),
  'process.env.WS_URL': JSON.stringify(process.env.WS_URL || 'ws://localhost:8080'),
  'process.env.APP_VERSION': JSON.stringify(require('./package.json').version),
}),
```

### 3. TerserPlugin — Eliminar console.log en producción

```js
const TerserPlugin = require('terser-webpack-plugin')

// En optimization.minimizer:
new TerserPlugin({
  parallel: true,
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info'],
    },
    format: { comments: false },
  },
  extractComments: false,
}),
```

### 4. SplitChunks granulares — Mejor control de vendor chunks

```js
splitChunks: {
  chunks: 'all',
  cacheGroups: {
    react: {
      test: /[\\/]node_modules[\\/](react|react-dom|react-router)[\\/]/,
      name: 'react-vendors',
      priority: 11,
      reuseExistingChunk: true,
    },
    redux: {
      test: /[\\/]node_modules[\\/](redux|react-redux)[\\/]/,
      name: 'redux-vendors',
      priority: 12,
      reuseExistingChunk: true,
    },
    charts: {
      test: /[\\/]node_modules[\\/](recharts|d3)[\\/]/,
      name: 'charts-vendors',
      priority: 13,
      reuseExistingChunk: true,
    },
    vendor: {
      test: /[\\/]node_modules[\\/]/,
      name: 'vendors',
      priority: 10,
      reuseExistingChunk: true,
    },
    common: {
      minChunks: 2,
      priority: 5,
      reuseExistingChunk: true,
      name: 'common',
    },
  },
  minSize: 20000,
  maxAsyncRequests: 30,
  maxInitialRequests: 30,
},
```

### 5. BundleAnalyzerPlugin — Análisis visual de bundles

```js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

// En plugins:
process.env.ANALYZE === 'true' && new BundleAnalyzerPlugin({
  analyzerMode: 'static',
  reportFilename: path.resolve(__dirname, 'dist/bundle-report.html'),
  openAnalyzer: false,
  generateStatsFile: true,
  statsFilename: path.resolve(__dirname, 'dist/bundle-stats.json'),
}),
```

```bash
# Uso:
ANALYZE=true npm run build
```

### 6. DevServer proxy — Para desarrollo con backend local

```js
devServer: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      pathRewrite: { '^/api': '' },
      changeOrigin: true,
      secure: false,
    },
    '/ws': {
      target: 'ws://localhost:8080',
      ws: true,
      changeOrigin: true,
    },
  },
},
```

### 7. Devtool — Source maps por entorno

```js
devtool: isDev ? 'cheap-module-source-map' : 'source-map',
```

### 8. Performance hints

```js
performance: {
  hints: isDev ? false : 'warning',
  maxEntrypointSize: 300000,  // 300KB
  maxAssetSize: 250000,        // 250KB
  assetFilter: (name) =>
    !name.endsWith('.map') && !name.endsWith('.LICENSE.txt'),
},
```

### 9. Aliases adicionales (presentes en develop pero no en main)

```js
// Aliases en webpack.config.js que no están en webpack.config.cjs:
'@redux':      path.resolve(__dirname, 'src/redux'),
'@utils':      path.resolve(__dirname, 'src/utils'),
'@types':      path.resolve(__dirname, 'src/types'),
'@constants':  path.resolve(__dirname, 'src/constants'),
'@pages':      path.resolve(__dirname, 'src/pages'),
'@router':     path.resolve(__dirname, 'src/router'),
'@config':     path.resolve(__dirname, 'src/config'),
'@layouts':    path.resolve(__dirname, 'src/layouts'),
'@decorators': path.resolve(__dirname, 'src/decorators'),
```

> **Nota:** Añadir solo los aliases que tengan directorios reales en `src/`.
> Si se añaden aquí, también deben añadirse en `jest.config.cjs` bajo `moduleNameMapper`.
