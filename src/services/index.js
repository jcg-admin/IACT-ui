/**
 * Security Services Index — IACT v2 (post-T5.5)
 *
 * Exporta servicios de infraestructura desde un lugar centralizado.
 *
 * GATEWAYS ELIMINADOS EN FASE 5 (sin endpoint en IACT-api):
 *   jobGateway.js         → T5.1: funcionalidad en reportsGateway
 *   transactionGateway.js → T5.2: sistema de transacciones no existe en API
 *   alertGateway.js       → T5.3: duplicado de alertsGateway
 *   exportGateway.js      → T5.4: utilidad cliente movida a utils/exportUtils.js
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
