/**
 * Security Services Index
 * Exportar todos los servicios de seguridad desde un lugar centralizado
 */

// Error Logger
export { default as errorLogger, ErrorLogger } from './errorLogger';

// Security Service (sanitizacion, validacion, CSRF)
export {
  htmlSanitizer,
  inputValidator,
  RateLimiter,
  csrfManager,
  cspHelper,
} from './security';

// Secure Storage
export { SecureStorage, secureStorage } from './secureStorage';

// API Service (con CSRF y credentials)
export { default as apiService, APIService } from './apiClient';

// Configuration
export { default as securityConfig } from '@config/securityConfig';

// WebSocket Service
export { default as websocketService } from './websocketGateway';
