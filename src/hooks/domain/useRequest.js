import { useState, useCallback, useEffect } from 'react';
import apiService from '@services/apiService';

export function useRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    initialData = null,
    autoFetch = true,
    dependencies = [],
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (bodyData = null) => {
      setLoading(true);
      setError(null);

      try {
        let response;

        if (method === 'GET') {
          response = await apiService.get(endpoint);
        } else if (method === 'POST') {
          response = await apiService.post(endpoint, bodyData);
        } else if (method === 'PUT') {
          response = await apiService.put(endpoint, bodyData);
        } else if (method === 'PATCH') {
          response = await apiService.patch(endpoint, bodyData);
        } else if (method === 'DELETE') {
          response = await apiService.delete(endpoint);
        }

        setData(response.data);

        if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      } catch (err) {
        setError(err);

        if (onError) {
          onError(err);
        }

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, onSuccess, onError]
  );

  useEffect(() => {
    if (autoFetch && method === 'GET') {
      execute();
    }
  }, [autoFetch, method, execute, ...dependencies]);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

export default useRequest;
