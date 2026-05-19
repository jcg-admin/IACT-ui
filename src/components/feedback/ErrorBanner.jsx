import React from 'react'
import PropTypes from 'prop-types'

export default function ErrorBanner({ message, onClose }) {
  if (!message) return null

  return (
    <div className="error-banner error-banner--context" role="alert" aria-live="polite">
      <span>{message}</span>
      <button
        className="error-banner__close"
        aria-label="Cerrar error"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  )
}

ErrorBanner.propTypes = {
  message: PropTypes.string,
  onClose: PropTypes.func.isRequired,
}

ErrorBanner.defaultProps = {
  message: null,
}
