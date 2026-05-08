/**
 * API Service
 * Maneja todas las llamadas a API REST con:
 * - Retry logic para errores transitorios
 * - Timeout management
 * - Request/Response logging
 * - Errores tipados
 * - Serialización de errores
 * - Mock support para development
 */

import {
  TimeoutError,
  ConnectionError,
  NetworkError,
  UnauthorizedError,
  ValidationError,
  RateLimitError,
  ParseError,
  isRetryableError,
  logError,
  createErrorFromResponse,
} from '@utils/apiErrors';

import mockInterceptor from '@mocks/mockInterceptor';

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const DEFAULT_RETRY_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY = 1000; // 1 second

/**
 * APIService class
 * Maneja todas las solicitudes HTTP REST
 */
class APIService {
  constructor(baseURL = '', options = {}) {
    this.baseURL = baseURL;
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
    this.retryAttempts = options.retryAttempts || DEFAULT_RETRY_ATTEMPTS;
    this.retryDelay = options.retryDelay || DEFAULT_RETRY_DELAY;
    this.headers = options.headers || {};
    this.interceptors = {
      request: [],
      response: [],
      error: [],
    };
  }

  /**
   * Set authorization token
   */
  setAuthToken(token) {
    if (token) {
      this.headers['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.headers['Authorization'];
    }
  }

  /**
   * Set session ID
   */
  setSessionId(sessionId) {
    if (sessionId) {
      this.headers['X-Session-ID'] = sessionId;
    } else {
      delete this.headers['X-Session-ID'];
    }
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(callback) {
    this.interceptors.request.push(callback);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(callback) {
    this.interceptors.response.push(callback);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(callback) {
    this.interceptors.error.push(callback);
  }

  /**
   * Make HTTP request with error handling
   */
  async request(method, url, options = {}) {
    const fullURL = this.baseURL ? `${this.baseURL}${url}` : url;
    const finalOptions = this._buildRequestOptions(method, options);

    let lastError = null;
    let attempt = 0;

    // Retry logic for transient errors
    while (attempt < this.retryAttempts) {
      try {
        const response = await this._makeRequest(fullURL, finalOptions);
        return response;
      } catch (error) {
        lastError = error;
        attempt++;

        // Check if error is retryable and we have attempts left
        if (isRetryableError(error) && attempt < this.retryAttempts) {
          // Exponential backoff
          const delay = this.retryDelay * Math.pow(2, attempt - 1);
          console.log(`[API] Retrying request (${attempt}/${this.retryAttempts}) after ${delay}ms`);
          await this._sleep(delay);
          continue;
        }

        // Error is not retryable or attempts exhausted
        throw error;
      }
    }

    throw lastError;
  }

  /**
   * GET request
   */
  async get(url, options = {}) {
    return this.request('GET', url, options);
  }

  /**
   * POST request
   */
  async post(url, data = {}, options = {}) {
    return this.request('POST', url, {
      ...options,
      body: data,
    });
  }

  /**
   * PUT request
   */
  async put(url, data = {}, options = {}) {
    return this.request('PUT', url, {
      ...options,
      body: data,
    });
  }

  /**
   * PATCH request
   */
  async patch(url, data = {}, options = {}) {
    return this.request('PATCH', url, {
      ...options,
      body: data,
    });
  }

  /**
   * DELETE request
   */
  async delete(url, options = {}) {
    return this.request('DELETE', url, options);
  }

  /**
   * Build complete request options
   */
  _buildRequestOptions(method, options) {
    const finalOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
        ...options.headers,
      },
      signal: this._createAbortSignal(options.timeout),
    };

    if (options.body && method !== 'GET' && method !== 'HEAD') {
      finalOptions.body = JSON.stringify(options.body);
    }

    if (options.params) {
      const queryString = new URLSearchParams(options.params).toString();
      // URL already has query string, append to it
      if (finalOptions.url && finalOptions.url.includes('?')) {
        finalOptions.url += '&' + queryString;
      } else if (queryString) {
        finalOptions.url = finalOptions.url + '?' + queryString;
      }
    }

    return finalOptions;
  }

  /**
   * Create abort signal with timeout
   */
  _createAbortSignal(customTimeout) {
    const controller = new AbortController();
    const timeout = customTimeout || this.timeout;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    // Store timeoutId to clear it if request completes
    controller._timeoutId = timeoutId;
    return controller.signal;
  }

  /**
   * Make actual HTTP request
   */
  async _makeRequest(url, options) {
    let response;

    // Run request interceptors
    let finalOptions = { ...options };
    for (const interceptor of this.interceptors.request) {
      finalOptions = await interceptor({ url, options: finalOptions });
    }

    // SECURITY: Agregar credentials para enviar cookies httpOnly
    if (!finalOptions.credentials) {
      finalOptions.credentials = 'include';
    }

    // SECURITY: Agregar CSRF token para POST/PUT/DELETE/PATCH
    const method = finalOptions.method || 'GET';
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = this._getCSRFToken();
      if (csrfToken) {
        finalOptions.headers = {
          ...finalOptions.headers,
          'X-CSRFToken': csrfToken,
        };
      }
    }

    // MOCK SUPPORT: Interceptar con mocks si están habilitados
    const mockResponse = await mockInterceptor.intercept(url, finalOptions);
    if (mockResponse) {
      // Convertir mock response a Response object
      return this._createMockResponse(mockResponse);
    }

    try {
      // Make fetch request
      response = await fetch(url, finalOptions);
    } catch (error) {
      // Clear timeout if still pending
      if (finalOptions.signal._timeoutId) {
        clearTimeout(finalOptions.signal._timeoutId);
      }

      // Map fetch error to appropriate HttpError
      return this._handleFetchError(error, url);
    }

    // Clear timeout on success
    if (finalOptions.signal._timeoutId) {
      clearTimeout(finalOptions.signal._timeoutId);
    }

    // Handle non-200 status codes
    if (!response.ok) {
      return this._handleErrorResponse(response);
    }

    // Parse response
    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (error) {
      logError(new ParseError(error), { url, status: response.status });
      throw new ParseError(error);
    }

    const result = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
    };

    // Run response interceptors
    for (const interceptor of this.interceptors.response) {
      await interceptor(result);
    }

    return result;
  }

  /**
   * Handle fetch-level errors (network, timeout, abort)
   */
  async _handleFetchError(error, url) {
    // Run error interceptors
    let finalError = error;
    for (const interceptor of this.interceptors.error) {
      finalError = await interceptor(finalError);
    }

    // Map fetch error to HttpError
    if (error.name === 'AbortError') {
      const timeoutError = new TimeoutError(this.timeout);
      logError(timeoutError, { url });
      throw timeoutError;
    }

    if (
      error.message === 'Failed to fetch' ||
      error.message.includes('NetworkError') ||
      error.message.includes('fetch failed')
    ) {
      const connError = new ConnectionError(error);
      logError(connError, { url });
      throw connError;
    }

    const netError = new NetworkError(error.message, error);
    logError(netError, { url });
    throw netError;
  }

  /**
   * Handle HTTP error responses
   */
  async _handleErrorResponse(response) {
    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: response.statusText };
    }

    // Special handling for specific status codes
    if (response.status === 401) {
      const error = new UnauthorizedError();
      logError(error, { url: response.url });
      
      // Dispatch logout event/action
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
      throw error;
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '60';
      const error = new RateLimitError(parseInt(retryAfter));
      logError(error, { url: response.url });
      throw error;
    }

    if (response.status === 422) {
      const error = new ValidationError(
        data.message || 'Validation failed',
        data.errors || {}
      );
      logError(error, { url: response.url });
      throw error;
    }

    // Generic error handling
    const error = createErrorFromResponse({ 
      status: response.status,
      statusText: response.statusText,
      data 
    });
    logError(error, { url: response.url });
    throw error;
  }

  /**
   * Sleep utility
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * SECURITY: Get CSRF token from cookies
   * Returns CSRF token from Django cookies
   */
  _getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }

    return cookieValue;
  }

  /**
   * Create mock Response object
   */
  _createMockResponse(mockResponse) {
    const { status, data, headers = {} } = mockResponse;

    const response = {
      status,
      ok: status >= 200 && status < 300,
      statusText: status === 200 ? 'OK' : 'Error',
      json: async () => data,
      headers: {
        get: (name) => headers[name],
      },
    };

    return response;
  }
}

/**
 * Create default API service instance
 */
const apiService = new APIService(
  process.env.REACT_APP_API_URL || 'http://localhost:5000',
  {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  }
);

export default apiService;
export { APIService };
