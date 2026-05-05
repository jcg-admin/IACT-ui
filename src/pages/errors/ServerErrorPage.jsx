import React from 'react'
import { reloadPage } from '@utils/navigation'

export default function ServerErrorPage() {
  return (
    <div className="error-page">
      <div className="error-page__code">500</div>
      <span className="material-icons error-page__icon">error_outline</span>
      <h1 className="error-page__title">Error interno del servidor</h1>
      <p className="error-page__description">
        Ocurrió un error inesperado. Nuestro equipo ha sido notificado.
      </p>
      <button className="btn btn-primary" onClick={reloadPage}>
        Recargar página
      </button>
    </div>
  )
}
