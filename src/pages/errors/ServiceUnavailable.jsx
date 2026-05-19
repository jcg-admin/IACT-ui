import React from 'react'
import { useSelector } from 'react-redux'
import { selectRetryAfter } from '@store/slices/error'

export default function ServiceUnavailable() {
  const retryAfter = useSelector(selectRetryAfter)

  return (
    <div className="error-page">
      <div className="error-page__code">503</div>
      <span className="material-icons error-page__icon">build</span>
      <h1 className="error-page__title">Servicio en mantenimiento</h1>
      <p className="error-page__description">
        El servicio no está disponible temporalmente.{' '}
        {retryAfter
          ? `Intenta de nuevo en ${retryAfter} segundos.`
          : 'Intenta de nuevo en unos minutos.'}
      </p>
      <button className="btn btn-primary" onClick={() => window.location.reload()}>
        Reintentar
      </button>
    </div>
  )
}
