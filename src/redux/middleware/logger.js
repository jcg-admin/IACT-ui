/* eslint-disable no-console -- Middleware de logging: el propósito del archivo es loggear */
/**
 * REDUX LOGGER MIDDLEWARE
 * Loguea todas las actions y state changes
 * Útil para debugging y auditoría en desarrollo
 */

const loggerMiddleware = (store) => (next) => (action) => {
  const result = next(action)

  if (process.env.NODE_ENV === 'development') {
    console.group(`ACTION: ${action.type}`)
    console.info('dispatching', action)
    console.log('next state', store.getState())
    console.groupEnd()
  }

  return result
}

export default loggerMiddleware;
