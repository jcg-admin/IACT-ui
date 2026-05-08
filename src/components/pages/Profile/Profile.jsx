/**
 * ProfilePage — Perfil de Usuario
 *
 * Muestra información del usuario autenticado y acceso a gestión de sesiones.
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectUser } from '@redux/selectors'
import { selectIsSessionActive, selectSessionExpiresAt } from '@redux/slices/session'
import './ProfilePage.scss'

export default function Profile() {
  const user = useSelector(selectUser)
  const sessionActive = useSelector(selectIsSessionActive)
  const sessionExpiresAt = useSelector(selectSessionExpiresAt)

  const formatExpiry = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('es')
  }

  return (
    <div className="profile-page page-container">
      <header className="page-header">
        <h1>Perfil de Usuario</h1>
      </header>

      <section className="profile-card" aria-label="Datos del usuario">
        <div className="profile-avatar" aria-hidden="true">
          {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
        </div>
        <dl className="profile-details">
          <dt>Nombre</dt>
          <dd>{user?.name ?? '—'}</dd>

          <dt>Correo electrónico</dt>
          <dd>{user?.email ?? '—'}</dd>

          <dt>Rol</dt>
          <dd>{user?.role ?? user?.rol ?? '—'}</dd>
        </dl>
      </section>

      <section className="session-card" aria-label="Estado de sesión">
        <h2>Sesión actual</h2>
        <dl className="profile-details">
          <dt>Estado</dt>
          <dd>
            <span className={`status-badge status-${sessionActive ? 'active' : 'inactive'}`}>
              {sessionActive ? 'Activa' : 'Inactiva'}
            </span>
          </dd>
          <dt>Expira</dt>
          <dd>{formatExpiry(sessionExpiresAt)}</dd>
        </dl>
        <Link to="/profile/sessions" className="btn btn-secondary">
          Ver todas las sesiones
        </Link>
      </section>
    </div>
  )
}
