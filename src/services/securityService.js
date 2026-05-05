/**
 * Security Service
 * Proporciona utilidades de seguridad:
 * - Sanitizacion HTML (DOMPurify)
 * - Rate limiting
 * - Validacion de input
 */

import DOMPurify from 'dompurify';

/**
 * HTML Sanitizer
 * Sanitiza HTML potencialmente peligroso
 */
class HTMLSanitizer {
  constructor() {
    // Configuracion de DOMPurify
    this.config = {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'title'],
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_DOM_IMPORT: false,
    };
  }

  /**
   * Sanitizar HTML
   */
  sanitize(dirty) {
    if (!dirty) return '';
    return DOMPurify.sanitize(dirty, this.config);
  }

  /**
   * Sanitizar sin tags HTML
   */
  sanitizeText(dirty) {
    if (!dirty) return '';
    // Remover todo HTML
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
  }

  /**
   * Sanitizar para atributos HTML
   */
  sanitizeAttribute(dirty) {
    if (!dirty) return '';
    // Solo permitir texto seguro
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    }).replace(/"/g, '&quot;');
  }
}

/**
 * Input Validator
 * Valida input del usuario
 */
class InputValidator {
  /**
   * Validar email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  /**
   * Validar URL
   */
  static isValidURL(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Validar password strength
   */
  static isValidPassword(password) {
    // Minimo 8 caracteres
    // Al menos 1 mayuscula
    // Al menos 1 numero
    // Al menos 1 caracter especial
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Validar username
   */
  static isValidUsername(username) {
    // Alphanumeric + underscore, 3-20 caracteres
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  }

  /**
   * Sanitizar username
   */
  static sanitizeUsername(username) {
    return username.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 20);
  }
}

/**
 * Rate Limiter
 * Limita la frecuencia de ejecucion
 */
class RateLimiter {
  constructor(maxRequests = 10, timeWindow = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindow;
    this.requests = [];
  }

  /**
   * Verificar si puede hacer request
   */
  canMakeRequest() {
    const now = Date.now();

    // Remover requests viejos
    this.requests = this.requests.filter(time => now - time < this.timeWindow);

    // Si no alcanza limite, permitir
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }

    return false;
  }

  /**
   * Obtener tiempo de espera hasta siguiente request
   */
  getRetryAfter() {
    if (this.requests.length === 0) return 0;

    const oldestRequest = this.requests[0];
    const retryAfter = oldestRequest + this.timeWindow - Date.now();
    return Math.max(0, retryAfter);
  }

  /**
   * Reset
   */
  reset() {
    this.requests = [];
  }
}

/**
 * CSRF Token Manager
 * Gestiona CSRF tokens
 */
class CSRFManager {
  /**
   * Obtener CSRF token del cookie
   */
  static getToken() {
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
   * Agregar CSRF token a headers
   */
  static addToHeaders(headers = {}) {
    const token = this.getToken();
    if (token) {
      return {
        ...headers,
        'X-CSRFToken': token,
      };
    }
    return headers;
  }
}

/**
 * Content Security Policy Helper
 */
class CSPHelper {
  /**
   * Obtener nonce para scripts inline
   */
  static getNonce() {
    // En production, el nonce debe venir del server
    // Este es un fallback
    return document
      .querySelector('script[nonce]')
      ?.getAttribute('nonce') || null;
  }
}

// Singleton instances
const htmlSanitizer = new HTMLSanitizer();
const inputValidator = InputValidator;
const csrfManager = CSRFManager;
const cspHelper = CSPHelper;

export {
  htmlSanitizer,
  inputValidator,
  RateLimiter,
  csrfManager,
  cspHelper,
};
