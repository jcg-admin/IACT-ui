# React Strict Mode y Performance

## Qué es Strict Mode

`<StrictMode>` es un componente auxiliar de React que activa verificaciones
adicionales **solo en desarrollo**. Está habilitado en el entry point del proyecto:

```jsx
// src/index.jsx
root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
)
```

No renderiza nada visible — su único efecto es activar flags internos del
reconciliador de React.

---

## El comportamiento que confunde: doble invocación de efectos

En desarrollo, Strict Mode ejecuta cada `useEffect` **dos veces** en el
montaje inicial. El objetivo es detectar efectos con side-effects no
idempotentes que serían bugs silenciosos en producción.

```jsx
useEffect(() => {
  console.log('ejecutado')  // aparece DOS veces en la consola
  fetchData()
}, [])
```

Esto es intencional. Si ver el log dos veces sorprende, el componente
probablemente tiene un efecto que no limpia correctamente sus recursos.

### Por qué no es un problema en este proyecto

React Query absorbe el doble dispatch. La segunda invocación del efecto
no genera una segunda request de red porque el cache ya tiene el dato
como fresh:

| Hook | `staleTime` configurado |
|------|------------------------|
| Global (`queryClient.js`) | 5 minutos |
| `useAuth` | 5 minutos |
| `useJobs` | 10 segundos |

El patrón de polling (`useAlertPolling`, `useJobPolling`) también es seguro:
cada efecto retorna un cleanup que cancela el intervalo anterior, por lo que
la segunda invocación de Strict Mode limpia la primera antes de iniciar la
siguiente — comportamiento correcto.

---

## Strict Mode en producción — no existe

Esta es la parte más importante y la más malentendida.

`<StrictMode>` en el source code **no genera ningún overhead en producción**.
Webpack resuelve `react-dom` al bundle de producción
(`react-dom-client.production.js`) que no contiene el flag `StrictEffectsMode`
— el mecanismo que activa la doble invocación. No es una condición en runtime:
el código directamente no está en el bundle.

```
Desarrollo  → react-dom-client.development.js → StrictEffectsMode presente
Producción  → react-dom-client.production.js  → StrictEffectsMode ausente
```

Verificado en React 19.2.5 (versión del proyecto).

**Conclusión:** dejar `<StrictMode>` en el source es correcto y no afecta
al bundle de producción de ninguna forma.

---

## Cómo medir performance en este proyecto

### Bundle y carga (producción)

```bash
npm run build:analyze   # webpack + BundleAnalyzerPlugin → informe visual
npm run performance     # build:analyze + Lighthouse
```

Strict Mode no interviene aquí — el build de producción lo elimina automáticamente.

### Renders (desarrollo)

Usar **React DevTools Profiler** (extensión de browser). Si los flamegraphs
muestran renders dobles y eso dificulta el análisis, se puede eliminar
`<StrictMode>` temporalmente del entry point para esa sesión de profiling.

```jsx
// src/index.jsx — temporal, solo para sesión de profiling
root.render(
  <Provider store={store}>
    <App />
  </Provider>
)
```

**Restaurar `<StrictMode>` antes de commitear.** Sin él, los efectos con
side-effects incorrectos pasan desapercibidos durante el desarrollo.

---

## Cuándo Strict Mode detecta un bug real

Un efecto que inicia una conexión sin cerrarla falla exactamente así:

```jsx
// ❌ Bug que Strict Mode detecta
useEffect(() => {
  const ws = new WebSocket(url)
  // sin cleanup → segunda invocación abre segunda conexión
}, [url])

// ✅ Correcto — Strict Mode lo valida
useEffect(() => {
  const ws = new WebSocket(url)
  return () => ws.close()  // cleanup ejecutado entre invocaciones
}, [url])
```

`useWebSocket` del proyecto (`src/hooks/domain/useWebSocket.js`) sigue el
patrón correcto: registra handlers y retorna cleanup que los desregistra.

---

## Referencia

- Código fuente verificado: `node_modules/react-dom/cjs/react-dom-client.production.js`
- Entry point del proyecto: `src/index.jsx`
- Query client: `src/lib/queryClient.js`
- Scripts de performance: `package.json` → `build:analyze`, `performance`
- React docs: [StrictMode](https://react.dev/reference/react/StrictMode)
