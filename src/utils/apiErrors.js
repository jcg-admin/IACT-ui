/**
 * API Error Types
 * Define todos los tipos de errores que pueden ocurrir en llamadas a API REST
 * 
 * Categorías:
 * - Network Errors: Problemas de conexión
 * - HTTP Errors: Respuestas de error del servidor
 * - Validation Errors: Errores de validación
 * - Business Logic Errors: Errores de lógica de negocio
 * - Parsing Errors: Errores al parsear respuestas
 */

/**
 * Base API Error Class
 */
export class APIError extends Error {
  constructor(message, code, statusCode = null, originalError = null) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
    
    // Mantener el stack trace en V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
    };
  }
}

// ============================================================================
// NETWORK ERRORS (Problemas de conexión)
// ============================================================================

/**
 * Error de timeout en la solicitud
 * Ocurre cuando: La solicitud tarda más de lo permitido
 */
export class TimeoutError extends APIError {
  constructor(duration = 30000) {
    super(
      `Request timeout after ${duration}ms`,
      'TIMEOUT',
      null
    );
    this.name = 'TimeoutError';
    this.duration = duration;
  }
}

/**
 * Error de conexión
 * Ocurre cuando: No hay conexión a internet, servidor no responde
 */
export class ConnectionError extends APIError {
  constructor(originalError = null) {
    super(
      'No connection to server. Please check your internet connection.',
      'CONNECTION_ERROR',
      null,
      originalError
    );
    this.name = 'ConnectionError';
  }
}

/**
 * Error de red genérico
 * Ocurre cuando: Falla en la transmisión de datos
 */
export class NetworkError extends APIError {
  constructor(message = 'Network error occurred', originalError = null) {
    super(message, 'NETWORK_ERROR', null, originalError);
    this.name = 'NetworkError';
  }
}

/**
 * Aborto de solicitud
 * Ocurre cuando: El usuario cancela la solicitud
 */
export class AbortError extends APIError {
  constructor() {
    super(
      'Request was aborted',
      'REQUEST_ABORTED',
      null
    );
    this.name = 'AbortError';
  }
}

// ============================================================================
// HTTP 4xx ERRORS (Client Errors)
// ============================================================================

/**
 * 400 Bad Request
 * Ocurre cuando: Datos inválidos enviados al servidor
 */
export class BadRequestError extends APIError {
  constructor(message = 'Invalid request', errors = {}) {
    super(message, 'BAD_REQUEST', 400);
    this.name = 'BadRequestError';
    this.validationErrors = errors;
  }
}

/**
 * 401 Unauthorized
 * Ocurre cuando: Usuario no autenticado o token expirado
 */
export class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized. Please login.') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 Forbidden
 * Ocurre cuando: Usuario no tiene permisos para acceder al recurso
 */
export class ForbiddenError extends APIError {
  constructor(message = 'You do not have permission to access this resource.') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 Not Found
 * Ocurre cuando: El recurso solicitado no existe
 */
export class NotFoundError extends APIError {
  constructor(resource = 'Resource', id = null) {
    const message = id 
      ? `${resource} with ID ${id} not found.`
      : `${resource} not found.`;
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.resourceId = id;
  }
}

/**
 * 409 Conflict
 * Ocurre cuando: La solicitud entra en conflicto con el estado del servidor
 */
export class ConflictError extends APIError {
  constructor(message = 'Request conflicts with current state.') {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}

/**
 * 422 Unprocessable Entity
 * Ocurre cuando: La validación falla (errores de formulario)
 */
export class ValidationError extends APIError {
  constructor(message = 'Validation failed', errors = {}) {
    super(message, 'VALIDATION_ERROR', 422);
    this.name = 'ValidationError';
    this.validationErrors = errors; // { field: [error messages] }
  }
}

/**
 * 405 Method Not Allowed
 * Ocurre cuando: Se usa un método HTTP no permitido para el endpoint
 */
export class MethodNotAllowedError extends APIError {
  constructor(message = 'Method not allowed for this endpoint.') {
    super(message, 'METHOD_NOT_ALLOWED', 405);
    this.name = 'MethodNotAllowedError';
  }
}

/**
 * 408 Request Timeout (server-side)
 * Ocurre cuando: El servidor no recibió la solicitud completa a tiempo
 * Distinto a TimeoutError (client-side)
 */
export class RequestTimeoutError extends APIError {
  constructor(message = 'The server timed out waiting for the request.') {
    super(message, 'REQUEST_TIMEOUT', 408);
    this.name = 'RequestTimeoutError';
    this.retryAfter = 0;
  }
}

/**
 * 410 Gone
 * Ocurre cuando: El recurso fue eliminado permanentemente (vs 404 no encontrado)
 */
export class GoneError extends APIError {
  constructor(message = 'This resource has been permanently removed.') {
    super(message, 'GONE', 410);
    this.name = 'GoneError';
  }
}

/**
 * 412 Precondition Failed
 * Ocurre cuando: Una condición de actualización condicional (If-Match) falla
 */
export class PreconditionFailedError extends APIError {
  constructor(message = 'Precondition failed. The resource may have been modified.') {
    super(message, 'PRECONDITION_FAILED', 412);
    this.name = 'PreconditionFailedError';
  }
}

/**
 * 413 Payload Too Large
 * Ocurre cuando: El cuerpo de la solicitud excede el límite del servidor
 * Común en exportaciones y uploads de archivos grandes
 */
export class PayloadTooLargeError extends APIError {
  constructor(message = 'Request payload is too large.') {
    super(message, 'PAYLOAD_TOO_LARGE', 413);
    this.name = 'PayloadTooLargeError';
    this.retryAfter = 0;
  }
}

/**
 * 415 Unsupported Media Type
 * Ocurre cuando: El Content-Type de la solicitud no es aceptado
 */
export class UnsupportedMediaTypeError extends APIError {
  constructor(message = 'Unsupported media type. Check the Content-Type header.') {
    super(message, 'UNSUPPORTED_MEDIA_TYPE', 415);
    this.name = 'UnsupportedMediaTypeError';
  }
}

/**
 * 429 Too Many Requests
 * Ocurre cuando: Rate limiting (demasiadas solicitudes)
 */
export class RateLimitError extends APIError {
  constructor(retryAfter = 60) {
    super(
      `Too many requests. Please try again in ${retryAfter} seconds.`,
      'RATE_LIMIT',
      429
    );
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * 428 Precondition Required (RFC 6585 §3)
 * Ocurre cuando: El servidor requiere que la solicitud sea condicional (If-Match)
 */
export class PreconditionRequiredError extends APIError {
  constructor(message = 'This request must be conditional. Include an If-Match header.') {
    super(message, 'PRECONDITION_REQUIRED', 428);
    this.name = 'PreconditionRequiredError';
  }
}

/**
 * 431 Request Header Fields Too Large (RFC 6585 §5)
 * Ocurre cuando: Los headers de la solicitud son demasiado grandes (e.g. JWT muy largo)
 */
export class RequestHeaderFieldsTooLargeError extends APIError {
  constructor(message = 'Request headers are too large.') {
    super(message, 'REQUEST_HEADER_FIELDS_TOO_LARGE', 431);
    this.name = 'RequestHeaderFieldsTooLargeError';
  }
}

/**
 * 451 Unavailable For Legal Reasons (RFC 7725)
 * Ocurre cuando: El contenido está bloqueado por razones legales
 */
export class UnavailableForLegalReasonsError extends APIError {
  constructor(message = 'This resource is unavailable for legal reasons.') {
    super(message, 'UNAVAILABLE_FOR_LEGAL_REASONS', 451);
    this.name = 'UnavailableForLegalReasonsError';
  }
}

// ============================================================================
// HTTP 5xx ERRORS (Server Errors)
// ============================================================================

/**
 * 500 Internal Server Error
 * Ocurre cuando: Error no manejado en el servidor
 */
export class InternalServerError extends APIError {
  constructor(message = 'Internal server error. Please try again later.') {
    super(message, 'INTERNAL_SERVER_ERROR', 500);
    this.name = 'InternalServerError';
  }
}

/**
 * 502 Bad Gateway
 * Ocurre cuando: Gateway inválido (proxy/balancer issue)
 */
export class BadGatewayError extends APIError {
  constructor() {
    super(
      'Bad gateway. The server is temporarily unavailable.',
      'BAD_GATEWAY',
      502
    );
    this.name = 'BadGatewayError';
  }
}

/**
 * 503 Service Unavailable
 * Ocurre cuando: Servidor no disponible (mantenimiento, sobrecargado)
 */
export class ServiceUnavailableError extends APIError {
  constructor(message = 'Service temporarily unavailable. Please try again later.') {
    super(message, 'SERVICE_UNAVAILABLE', 503);
    this.name = 'ServiceUnavailableError';
  }
}

/**
 * 504 Gateway Timeout
 * Ocurre cuando: Gateway timeout (servidor tardío)
 */
export class GatewayTimeoutError extends APIError {
  constructor() {
    super(
      'Gateway timeout. The server took too long to respond.',
      'GATEWAY_TIMEOUT',
      504
    );
    this.name = 'GatewayTimeoutError';
  }
}

/**
 * 501 Not Implemented
 * Ocurre cuando: El endpoint existe pero la funcionalidad no está implementada
 */
export class NotImplementedError extends APIError {
  constructor(message = 'This feature is not yet implemented.') {
    super(message, 'NOT_IMPLEMENTED', 501);
    this.name = 'NotImplementedError';
  }
}

/**
 * 511 Network Authentication Required (RFC 6585 §6)
 * Ocurre cuando: Un proxy intermediario (captive portal) requiere autenticación de red
 * DISTINTO a 401 (autenticación de aplicación). Generado por el proxy, no el origin server.
 * El cliente MUST redirect al usuario a la URL de login indicada en el body.
 */
export class NetworkAuthRequiredError extends APIError {
  constructor(loginUrl = null, message = 'Network authentication required.') {
    super(message, 'NETWORK_AUTH_REQUIRED', 511);
    this.name = 'NetworkAuthRequiredError';
    this.loginUrl = loginUrl;
  }
}

/**
 * 5xx Server Error genérico
 * Ocurre cuando: Error del servidor sin status específico
 */
export class ServerError extends APIError {
  constructor(statusCode, message = 'Server error occurred.') {
    super(message, 'SERVER_ERROR', statusCode);
    this.name = 'ServerError';
  }
}

// ============================================================================
// PARSING ERRORS
// ============================================================================

/**
 * Error al parsear JSON
 * Ocurre cuando: Respuesta del servidor no es JSON válido
 */
export class ParseError extends APIError {
  constructor(originalError = null) {
    super(
      'Failed to parse server response',
      'PARSE_ERROR',
      null,
      originalError
    );
    this.name = 'ParseError';
  }
}

/**
 * Error de tipo de contenido
 * Ocurre cuando: Content-Type no es application/json
 */
export class ContentTypeError extends APIError {
  constructor(expectedType, receivedType) {
    super(
      `Expected ${expectedType} but received ${receivedType}`,
      'CONTENT_TYPE_ERROR',
      null
    );
    this.name = 'ContentTypeError';
    this.expectedType = expectedType;
    this.receivedType = receivedType;
  }
}

// ============================================================================
// BUSINESS LOGIC ERRORS
// ============================================================================

/**
 * Error de lógica de negocio
 * Ocurre cuando: La operación viola reglas de negocio
 */
export class BusinessLogicError extends APIError {
  constructor(message, code = 'BUSINESS_LOGIC_ERROR') {
    super(message, code, 400);
    this.name = 'BusinessLogicError';
  }
}

/**
 * Error: Recurso ya existe
 */
export class ResourceAlreadyExistsError extends BusinessLogicError {
  constructor(resource, identifier) {
    super(
      `${resource} with identifier '${identifier}' already exists.`,
      'RESOURCE_ALREADY_EXISTS'
    );
    this.name = 'ResourceAlreadyExistsError';
    this.resource = resource;
    this.identifier = identifier;
  }
}

/**
 * Error: Recurso en uso
 */
export class ResourceInUseError extends BusinessLogicError {
  constructor(resource) {
    super(
      `Cannot delete ${resource} because it is in use.`,
      'RESOURCE_IN_USE'
    );
    this.name = 'ResourceInUseError';
    this.resource = resource;
  }
}

/**
 * Error: Operación no permitida en estado actual
 */
export class InvalidStateError extends BusinessLogicError {
  constructor(message = 'Operation not allowed in current state.') {
    super(message, 'INVALID_STATE');
    this.name = 'InvalidStateError';
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Map HTTP status code a error class
 */
export function getErrorClassByStatusCode(statusCode) {
  const statusMap = {
    400: BadRequestError,
    401: UnauthorizedError,
    403: ForbiddenError,
    404: NotFoundError,
    405: MethodNotAllowedError,
    408: RequestTimeoutError,
    409: ConflictError,
    410: GoneError,
    412: PreconditionFailedError,
    413: PayloadTooLargeError,
    415: UnsupportedMediaTypeError,
    422: ValidationError,
    428: PreconditionRequiredError,
    429: RateLimitError,
    431: RequestHeaderFieldsTooLargeError,
    451: UnavailableForLegalReasonsError,
    500: InternalServerError,
    501: NotImplementedError,
    502: BadGatewayError,
    503: ServiceUnavailableError,
    504: GatewayTimeoutError,
    511: NetworkAuthRequiredError,
  };

  const ErrorClass = statusMap[statusCode] || ServerError;
  return ErrorClass;
}

/**
 * Create error from HTTP response
 */
export function createErrorFromResponse(response, originalError = null) {
  const statusCode = response?.status;
  const ErrorClass = getErrorClassByStatusCode(statusCode);

  if (statusCode === 422 || statusCode === 400) {
    // Validation error with field details
    try {
      const data = response?.data || {};
      return new ErrorClass(
        data.message || 'Validation failed',
        data.errors || {}
      );
    } catch {
      return new ErrorClass();
    }
  }

  try {
    const message = response?.data?.message || response?.statusText;
    if (statusCode >= 500) {
      return new ErrorClass(message);
    } else if (statusCode >= 400) {
      return new ErrorClass(message);
    }
  } catch {
    return new ErrorClass();
  }

  return new ServerError(statusCode);
}

/**
 * Determine if error is retryable
 */
export function isRetryableError(error) {
  const retryableErrors = [
    'TIMEOUT',
    'CONNECTION_ERROR',
    'NETWORK_ERROR',
    'RATE_LIMIT',
    'REQUEST_TIMEOUT',
    'PAYLOAD_TOO_LARGE',
    'SERVICE_UNAVAILABLE',
    'BAD_GATEWAY',
    'GATEWAY_TIMEOUT',
  ];

  return retryableErrors.includes(error.code);
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error) {
  if (error instanceof ValidationError) {
    const fieldErrors = Object.entries(error.validationErrors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');
    return fieldErrors || error.message;
  }

  if (error instanceof APIError) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error for debugging
 */
export function logError(error, context = {}) {
  const errorData = {
    timestamp: new Date().toISOString(),
    name: error.name,
    message: error.message,
    code: error.code,
    statusCode: error.statusCode,
    context,
    stack: error.stack,
  };

  console.error('[API Error]', errorData);

  // Send to error tracking service (Sentry, etc)
  if (typeof window !== 'undefined' && window.errorTracker) {
    window.errorTracker.captureException(error, { extra: context });
  }

  return errorData;
}

export default {
  APIError,
  TimeoutError,
  ConnectionError,
  NetworkError,
  AbortError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  MethodNotAllowedError,
  RequestTimeoutError,
  ConflictError,
  GoneError,
  PreconditionFailedError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
  ValidationError,
  PreconditionRequiredError,
  RateLimitError,
  RequestHeaderFieldsTooLargeError,
  UnavailableForLegalReasonsError,
  InternalServerError,
  NotImplementedError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
  NetworkAuthRequiredError,
  ServerError,
  ParseError,
  ContentTypeError,
  BusinessLogicError,
  ResourceAlreadyExistsError,
  ResourceInUseError,
  InvalidStateError,
  getErrorClassByStatusCode,
  createErrorFromResponse,
  isRetryableError,
  getErrorMessage,
  logError,
};
