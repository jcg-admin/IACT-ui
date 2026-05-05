import apiService from '@services/apiService';

const API_CALL = 'API_CALL';

export const apiCallAction = (endpoint, method = 'GET', data = null) => ({
  type: API_CALL,
  payload: {
    endpoint,
    method,
    data,
  },
});

export const apiMiddleware = (store) => (next) => async (action) => {
  if (action.type !== API_CALL) {
    return next(action);
  }

  const { endpoint, method, data } = action.payload;
  const actionName = `API_${method}_${endpoint.replace(/\//g, '_').toUpperCase()}`;

  next({
    type: `${actionName}_PENDING`,
  });

  try {
    let response;

    switch (method) {
      case 'GET':
        response = await apiService.get(endpoint);
        break;
      case 'POST':
        response = await apiService.post(endpoint, data);
        break;
      case 'PUT':
        response = await apiService.put(endpoint, data);
        break;
      case 'PATCH':
        response = await apiService.patch(endpoint, data);
        break;
      case 'DELETE':
        response = await apiService.delete(endpoint);
        break;
      default:
        throw new Error(`Unknown method: ${method}`);
    }

    next({
      type: `${actionName}_SUCCESS`,
      payload: response.data,
    });

    return response.data;
  } catch (error) {
    next({
      type: `${actionName}_FAILURE`,
      payload: {
        error: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      },
    });

    throw error;
  }
};

export default apiMiddleware;
