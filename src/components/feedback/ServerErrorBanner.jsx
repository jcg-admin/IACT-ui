import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { selectGlobalError, selectIsPersistentError } from '@redux/slices/error'

export default function ServerErrorBanner() {
  const error = useSelector(selectGlobalError)
  const isPersistent = useSelector(selectIsPersistentError)
  const [dismissed, setDismissed] = useState(false)

  if (!error || !isPersistent || dismissed) return null

  const is503 = error.statusCode === 503

  return (
    <div className="server-error-banner" role="alert" aria-live="polite">
      <span className="server-error-banner__icon material-icons" aria-hidden="true">
        {is503 ? 'build' : 'warning'}
      </span>
      <div className="server-error-banner__body">
        <strong className="server-error-banner__label">
          {is503 ? 'Servicio en mantenimiento:' : 'Servicio no disponible:'}
        </strong>{' '}
        <span className="server-error-banner__message">{error.message}</span>
      </div>
      <button
        className="server-error-banner__close"
        aria-label="Cerrar"
        onClick={() => setDismissed(true)}
      >
        <span className="material-icons">close</span>
      </button>
    </div>
  )
}
