/**
 * REDUX LOGGER MIDDLEWARE
 * Loguea todas las actions y state changes
 * Útil para debugging y auditoría en desarrollo
 */

const loggerMiddleware = (store) => (next) => (action) => {
  console.group(`ACTION: ${action.type}`);
  console.info('dispatching', action);

  const result = next(action);

  console.log('next state', store.getState());
  console.groupEnd();

  return result;
};

export default loggerMiddleware;
