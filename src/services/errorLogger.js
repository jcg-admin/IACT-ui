/**
 * Error Logger Service
 * Loguea errores a backend + localStorage como respaldo
 * 
 * SECURITY: NO guarda datos sensibles (tokens, passwords, etc)
 */

class ErrorLogger {
  constructor() {
    this.queue = [];
    this.isLogging = false;
    this.maxQueueSize = 50;
    this.maxStorageSize = 100;
    
    // Campos sensibles a excluir de logs
    this.sensitiveFields = [
      'password',
      'token',
      'access_token',
      'refresh_token',
      'authorization',
      'credit_card',
      'ssn',
      'api_key',
      'secret',
    ];
  }

  /**
   * Sanitizar datos sensibles
   */
  _sanitize(data) {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const sanitized = { ...data };

    // Remover campos sensibles
    for (const field of this.sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Sanitizar recursivamente
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this._sanitize(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Loguear un error
   */
  async logError(error, context = null, metadata = {}) {
    const errorRecord = {
      code: error.code || error.name || 'UNKNOWN_ERROR',
      message: error.message || 'Unknown error',
      status_code: error.statusCode || null,
      level: this._determineLevel(error.statusCode),
      endpoint: metadata.endpoint || null,
      method: metadata.method || null,
      context: context || null,
      // SECURITY: Sanitizar datos
      request_body: this._sanitize(metadata.requestBody) || null,
      response_body: this._sanitize(metadata.responseBody) || null,
      stack_trace: error.stack || null,
      timestamp: new Date().toISOString(),
    };

    // Guardar en localStorage inmediatamente
    this._saveToLocalStorage(errorRecord);

    // Intentar loguear al backend (no-blocking)
    this._logToBackend(errorRecord).catch(err => {
      console.error('Failed to log error to backend', err);
    });
  }

  /**
   * Loguear multiples errores
   */
  async logErrors(errors) {
    for (const errorData of errors) {
      await this.logError(
        errorData.error,
        errorData.context,
        errorData.metadata
      );
    }
  }

  /**
   * Enviar error al backend
   */
  async _logToBackend(errorRecord) {
    // Evitar circular dependency - usar fetch directo
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${apiUrl}/api/error-logs/log_error/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorRecord),
        credentials: 'include', // SECURITY: Enviar cookies
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Si logra, remover de queue si estaba ahi
      this.queue = this.queue.filter(
        item => item.timestamp !== errorRecord.timestamp
      );
    } catch (err) {
      // Agregar a queue para reintentar despues
      if (this.queue.length < this.maxQueueSize) {
        this.queue.push(errorRecord);
      }
      throw err;
    }
  }

  /**
   * Guardar error en localStorage
   */
  _saveToLocalStorage(errorRecord) {
    try {
      const key = 'errorLogs';
      const stored = JSON.parse(localStorage.getItem(key) || '[]');

      stored.unshift(errorRecord);

      // Mantener solo los ultimos N errores
      if (stored.length > this.maxStorageSize) {
        stored.splice(this.maxStorageSize);
      }

      localStorage.setItem(key, JSON.stringify(stored));
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  }

  /**
   * Obtener errores almacenados en localStorage
   */
  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('errorLogs') || '[]');
    } catch (err) {
      return [];
    }
  }

  /**
   * Limpiar localStorage
   */
  clearStoredErrors() {
    try {
      localStorage.removeItem('errorLogs');
    } catch (err) {
      console.error('Failed to clear localStorage', err);
    }
  }

  /**
   * Obtener errores en queue (sin enviar)
   */
  getQueuedErrors() {
    return [...this.queue];
  }

  /**
   * Limpiar queue
   */
  clearQueue() {
    this.queue = [];
  }

  /**
   * Reintentar enviar errores en queue
   */
  async retryQueue() {
    if (this.queue.length === 0 || this.isLogging) {
      return;
    }

    this.isLogging = true;
    const failedItems = [];

    for (const errorRecord of this.queue) {
      try {
        await this._logToBackend(errorRecord);
      } catch (err) {
        failedItems.push(errorRecord);
      }
    }

    this.queue = failedItems;
    this.isLogging = false;

    return {
      sent: this.queue.length - failedItems.length,
      failed: failedItems.length,
    };
  }

  /**
   * Determinar nivel de error
   */
  _determineLevel(statusCode) {
    if (!statusCode) {
      return 'error';
    }
    if (statusCode >= 500) {
      return 'critical';
    } else if (statusCode >= 400) {
      return 'error';
    } else if (statusCode >= 300) {
      return 'warning';
    }
    return 'info';
  }

  /**
   * Obtener estadisticas
   */
  getStats() {
    const stored = this.getStoredErrors();
    const queued = this.getQueuedErrors();

    // Contar por nivel
    const levelCounts = {};
    stored.forEach(error => {
      const level = error.level || 'unknown';
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });

    // Contar por codigo
    const codeCounts = {};
    stored.forEach(error => {
      const code = error.code || 'unknown';
      codeCounts[code] = (codeCounts[code] || 0) + 1;
    });

    return {
      totalStored: stored.length,
      totalQueued: queued.length,
      maxStorageSize: this.maxStorageSize,
      maxQueueSize: this.maxQueueSize,
      levelCounts,
      codeCounts,
      lastErrors: stored.slice(0, 5),
    };
  }

  /**
   * Exportar errores como JSON (SANITIZADO)
   */
  exportErrors() {
    const stored = this.getStoredErrors();
    return JSON.stringify(stored, null, 2);
  }

  /**
   * Exportar como CSV (SANITIZADO)
   */
  exportAsCSV() {
    const stored = this.getStoredErrors();

    const headers = [
      'Timestamp',
      'Code',
      'Level',
      'Message',
      'Status Code',
      'Endpoint',
      'Method',
      'Context',
    ];

    const rows = stored.map(error => [
      error.timestamp || '',
      error.code || '',
      error.level || '',
      error.message || '',
      error.status_code || '',
      error.endpoint || '',
      error.method || '',
      error.context || '',
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  }
}

// Singleton instance
const errorLogger = new ErrorLogger();

export default errorLogger;
export { ErrorLogger };
