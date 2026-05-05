import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="error-page">
      <div className="error-page__code">404</div>
      <span className="material-icons error-page__icon">search_off</span>
      <h1 className="error-page__title">Página no encontrada</h1>
      <p className="error-page__description">
        La página que buscas no existe o fue movida.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        Volver al inicio
      </button>
    </div>
  )
}
