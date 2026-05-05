/**
 * REDUX PERFORMANCE MONITOR MIDDLEWARE
 * Mide tiempo de ejecución de acciones
 * Detecta acciones que toman más de 100ms
 */

const SLOW_ACTION_THRESHOLD = 100; // milliseconds

const performanceMonitorMiddleware = (store) => (next) => (action) => {
  const start = performance.now();

  const result = next(action);

  const duration = performance.now() - start;

  if (duration > SLOW_ACTION_THRESHOLD) {
    console.warn(`⚠️ SLOW ACTION: ${action.type} took ${duration.toFixed(2)}ms`, {
      action,
      duration,
      state: store.getState(),
    });
  }

  return result;
};

export default performanceMonitorMiddleware;
