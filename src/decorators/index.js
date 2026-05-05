/**
 * Decorators - Barrel Export
 * 
 * Centraliza todas las importaciones de decorators
 */

export { withCaching, withCachingAdvanced, CACHE_TTL } from './withCaching'
export { withLogging, withLoggingLevels, LOG_LEVELS } from './withLogging'
export {
  withValidation,
  withValidationMultiple,
  ValidationError,
  CommonValidators,
} from './withValidation'

// Para uso como: import { decorators } from '@decorators'
import { withCaching, withCachingAdvanced, CACHE_TTL } from './withCaching'
import { withLogging, withLoggingLevels, LOG_LEVELS } from './withLogging'
import {
  withValidation,
  withValidationMultiple,
  ValidationError,
  CommonValidators,
} from './withValidation'

/**
 * Decorators Collection
 * Útil para aplicar múltiples decorators
 */
export const decorators = {
  caching: { withCaching, withCachingAdvanced, presets: { CACHE_TTL } },
  logging: { withLogging, withLoggingLevels, presets: { LOG_LEVELS } },
  validation: {
    withValidation,
    withValidationMultiple,
    ValidationError,
    CommonValidators,
  },
}

export default decorators
