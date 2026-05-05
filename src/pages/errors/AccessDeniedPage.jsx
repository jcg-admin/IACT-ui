import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function AccessDeniedPage() {
  const navigate = useNavigate()

  return (
    <div className="error-page">
      <div className="error-page__code">403</div>
      <span className="material-icons error-page__icon">lock</span>
      <h1 className="error-page__title">Acceso denegado</h1>
      <p className="error-page__description">
        No tienes permisos para acceder a este recurso. Contacta al administrador
        si crees que esto es un error.
      </p>
      <div className="error-page__actions">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Volver
        </button>
        <a className="btn btn-outline-primary" href="mailto:soporte@iact.com">
          Contactar soporte
        </a>
      </div>
    </div>
  )
}
