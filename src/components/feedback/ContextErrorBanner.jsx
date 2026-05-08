import React from 'react'
import PropTypes from 'prop-types'
import useContextError from '../../hooks/useContextError'
import ErrorBanner from './ErrorBanner'

function humanMessage(error) {
  if (!error) return null
  if (!error.statusCode || error.statusCode === 0) {
    return 'Sin conexión. Verifica tu conexión a internet.'
  }
  if (error.statusCode >= 500) {
    return 'Error del servidor. Por favor intenta nuevamente.'
  }
  return error.message || 'Error inesperado. Por favor intenta nuevamente.'
}

export default function ContextErrorBanner({ context }) {
  const { error, clearError } = useContextError(context)
  return <ErrorBanner message={humanMessage(error)} onClose={clearError} />
}

ContextErrorBanner.propTypes = {
  context: PropTypes.string.isRequired,
}
