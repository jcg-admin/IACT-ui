import {
  APIError,
  TimeoutError,
  ConnectionError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  MethodNotAllowedError,
  RequestTimeoutError,
  GoneError,
  PreconditionFailedError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
  ValidationError,
  PreconditionRequiredError,
  RateLimitError,
  RequestHeaderFieldsTooLargeError,
  UnavailableForLegalReasonsError,
  ConflictError,
  InternalServerError,
  NotImplementedError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
  NetworkAuthRequiredError,
  ServerError,
  getErrorClassByStatusCode,
  isRetryableError,
  getErrorMessage,
} from '../apiErrors'

// ── Base class ────────────────────────────────────────────────────────────────

describe('APIError — base class', () => {
  it('extends Error and carries code + statusCode', () => {
    const err = new APIError('msg', 'CODE', 400)
    expect(err).toBeInstanceOf(Error)
    expect(err.message).toBe('msg')
    expect(err.code).toBe('CODE')
    expect(err.statusCode).toBe(400)
    expect(err.timestamp).toBeDefined()
  })

  it('toJSON returns serializable shape', () => {
    const err = new APIError('msg', 'CODE', 400)
    const json = err.toJSON()
    expect(json).toMatchObject({ name: 'APIError', message: 'msg', code: 'CODE', statusCode: 400 })
    expect(json.timestamp).toBeDefined()
  })
})

// ── 4xx client errors — existing ─────────────────────────────────────────────

describe('existing 4xx error classes', () => {
  it('BadRequestError has statusCode 400', () => {
    expect(new BadRequestError().statusCode).toBe(400)
    expect(new BadRequestError().code).toBe('BAD_REQUEST')
  })

  it('UnauthorizedError has statusCode 401', () => {
    expect(new UnauthorizedError().statusCode).toBe(401)
    expect(new UnauthorizedError().code).toBe('UNAUTHORIZED')
  })

  it('ForbiddenError has statusCode 403', () => {
    expect(new ForbiddenError().statusCode).toBe(403)
  })

  it('NotFoundError interpolates resource and id', () => {
    const err = new NotFoundError('Usuario', 42)
    expect(err.statusCode).toBe(404)
    expect(err.message).toContain('42')
    expect(err.resource).toBe('Usuario')
  })

  it('RateLimitError stores retryAfter', () => {
    const err = new RateLimitError(30)
    expect(err.statusCode).toBe(429)
    expect(err.retryAfter).toBe(30)
    expect(err.message).toContain('30')
  })

  it('ValidationError stores validationErrors map', () => {
    const errors = { email: ['required'] }
    const err = new ValidationError('Validation failed', errors)
    expect(err.statusCode).toBe(422)
    expect(err.validationErrors).toEqual(errors)
  })
})

// ── 4xx — new classes (T-004) ─────────────────────────────────────────────────

describe('MethodNotAllowedError (405)', () => {
  it('has correct code and statusCode', () => {
    const err = new MethodNotAllowedError()
    expect(err.statusCode).toBe(405)
    expect(err.code).toBe('METHOD_NOT_ALLOWED')
    expect(err.name).toBe('MethodNotAllowedError')
  })
})

describe('RequestTimeoutError (408)', () => {
  it('has correct code and statusCode', () => {
    const err = new RequestTimeoutError()
    expect(err.statusCode).toBe(408)
    expect(err.code).toBe('REQUEST_TIMEOUT')
    expect(err.name).toBe('RequestTimeoutError')
  })

  it('retryAfter defaults to 0', () => {
    expect(new RequestTimeoutError().retryAfter).toBe(0)
  })
})

describe('GoneError (410)', () => {
  it('has correct code and statusCode', () => {
    const err = new GoneError()
    expect(err.statusCode).toBe(410)
    expect(err.code).toBe('GONE')
    expect(err.name).toBe('GoneError')
  })
})

describe('PreconditionFailedError (412)', () => {
  it('has correct code and statusCode', () => {
    const err = new PreconditionFailedError()
    expect(err.statusCode).toBe(412)
    expect(err.code).toBe('PRECONDITION_FAILED')
  })
})

describe('PayloadTooLargeError (413)', () => {
  it('has correct code and statusCode', () => {
    const err = new PayloadTooLargeError()
    expect(err.statusCode).toBe(413)
    expect(err.code).toBe('PAYLOAD_TOO_LARGE')
    expect(err.retryAfter).toBe(0)
  })
})

describe('UnsupportedMediaTypeError (415)', () => {
  it('has correct code and statusCode', () => {
    const err = new UnsupportedMediaTypeError()
    expect(err.statusCode).toBe(415)
    expect(err.code).toBe('UNSUPPORTED_MEDIA_TYPE')
  })
})

describe('PreconditionRequiredError (428 — RFC 6585)', () => {
  it('has correct code and statusCode', () => {
    const err = new PreconditionRequiredError()
    expect(err.statusCode).toBe(428)
    expect(err.code).toBe('PRECONDITION_REQUIRED')
    expect(err.name).toBe('PreconditionRequiredError')
  })
})

describe('RequestHeaderFieldsTooLargeError (431 — RFC 6585)', () => {
  it('has correct code and statusCode', () => {
    const err = new RequestHeaderFieldsTooLargeError()
    expect(err.statusCode).toBe(431)
    expect(err.code).toBe('REQUEST_HEADER_FIELDS_TOO_LARGE')
  })
})

describe('UnavailableForLegalReasonsError (451)', () => {
  it('has correct code and statusCode', () => {
    const err = new UnavailableForLegalReasonsError()
    expect(err.statusCode).toBe(451)
    expect(err.code).toBe('UNAVAILABLE_FOR_LEGAL_REASONS')
  })
})

// ── 5xx — new classes ─────────────────────────────────────────────────────────

describe('NotImplementedError (501)', () => {
  it('has correct code and statusCode', () => {
    const err = new NotImplementedError()
    expect(err.statusCode).toBe(501)
    expect(err.code).toBe('NOT_IMPLEMENTED')
    expect(err.name).toBe('NotImplementedError')
  })
})

describe('NetworkAuthRequiredError (511 — RFC 6585)', () => {
  it('has correct code and statusCode', () => {
    const err = new NetworkAuthRequiredError()
    expect(err.statusCode).toBe(511)
    expect(err.code).toBe('NETWORK_AUTH_REQUIRED')
    expect(err.name).toBe('NetworkAuthRequiredError')
  })

  it('stores loginUrl', () => {
    const err = new NetworkAuthRequiredError('https://wifi.example.com/login')
    expect(err.loginUrl).toBe('https://wifi.example.com/login')
  })

  it('loginUrl defaults to null', () => {
    expect(new NetworkAuthRequiredError().loginUrl).toBeNull()
  })
})

// ── getErrorClassByStatusCode (T-005) ─────────────────────────────────────────

describe('getErrorClassByStatusCode', () => {
  const CASES = [
    [400, BadRequestError],
    [401, UnauthorizedError],
    [403, ForbiddenError],
    [404, NotFoundError],
    [405, MethodNotAllowedError],
    [408, RequestTimeoutError],
    [409, ConflictError],
    [410, GoneError],
    [412, PreconditionFailedError],
    [413, PayloadTooLargeError],
    [415, UnsupportedMediaTypeError],
    [422, ValidationError],
    [428, PreconditionRequiredError],
    [429, RateLimitError],
    [431, RequestHeaderFieldsTooLargeError],
    [451, UnavailableForLegalReasonsError],
    [500, InternalServerError],
    [501, NotImplementedError],
    [502, BadGatewayError],
    [503, ServiceUnavailableError],
    [504, GatewayTimeoutError],
    [511, NetworkAuthRequiredError],
  ]

  test.each(CASES)('status %i → %s', (code, ExpectedClass) => {
    expect(getErrorClassByStatusCode(code)).toBe(ExpectedClass)
  })

  it('falls back to ServerError for unknown codes', () => {
    expect(getErrorClassByStatusCode(418)).toBe(ServerError)
    expect(getErrorClassByStatusCode(999)).toBe(ServerError)
  })
})

// ── isRetryableError (T-006) ──────────────────────────────────────────────────

describe('isRetryableError', () => {
  it('returns true for TIMEOUT', () => {
    expect(isRetryableError(new TimeoutError())).toBe(true)
  })

  it('returns true for CONNECTION_ERROR', () => {
    expect(isRetryableError(new ConnectionError())).toBe(true)
  })

  it('returns true for REQUEST_TIMEOUT (408)', () => {
    expect(isRetryableError(new RequestTimeoutError())).toBe(true)
  })

  it('returns true for PAYLOAD_TOO_LARGE (413)', () => {
    expect(isRetryableError(new PayloadTooLargeError())).toBe(true)
  })

  it('returns true for RATE_LIMIT (429)', () => {
    expect(isRetryableError(new RateLimitError())).toBe(true)
  })

  it('returns true for BAD_GATEWAY (502)', () => {
    expect(isRetryableError(new BadGatewayError())).toBe(true)
  })

  it('returns true for SERVICE_UNAVAILABLE (503)', () => {
    expect(isRetryableError(new ServiceUnavailableError())).toBe(true)
  })

  it('returns true for GATEWAY_TIMEOUT (504)', () => {
    expect(isRetryableError(new GatewayTimeoutError())).toBe(true)
  })

  it('returns false for NOT_FOUND (404)', () => {
    expect(isRetryableError(new NotFoundError())).toBe(false)
  })

  it('returns false for UNAUTHORIZED (401)', () => {
    expect(isRetryableError(new UnauthorizedError())).toBe(false)
  })

  it('returns false for GONE (410)', () => {
    expect(isRetryableError(new GoneError())).toBe(false)
  })

  it('returns false for NETWORK_AUTH_REQUIRED (511)', () => {
    expect(isRetryableError(new NetworkAuthRequiredError())).toBe(false)
  })
})

// ── getErrorMessage ───────────────────────────────────────────────────────────

describe('getErrorMessage', () => {
  it('returns field-level errors for ValidationError', () => {
    const err = new ValidationError('fail', { email: ['required'], name: ['too short'] })
    const msg = getErrorMessage(err)
    expect(msg).toContain('email')
    expect(msg).toContain('required')
  })

  it('returns message for generic APIError', () => {
    const err = new InternalServerError('Custom message')
    expect(getErrorMessage(err)).toBe('Custom message')
  })

  it('returns fallback for non-APIError', () => {
    expect(getErrorMessage(new Error('plain'))).toBe(
      'An unexpected error occurred. Please try again.'
    )
  })
})
