// UC_USR_07: editar perfil propio — scope: nombre, apellido, correo, preferencias de notificación
import React, { useState, useEffect } from 'react'
import userGateway from '../services/userGateway'

const EMPTY_PREFS = { email_notifications: true, push_notifications: false }

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    userGateway.getMyProfile()
      .then(data => {
        setProfile(data)
        setForm({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          email: data.email ?? '',
          notification_preferences: data.notification_preferences ?? EMPTY_PREFS,
        })
      })
      .catch(() => setErrorMsg('No se pudo cargar el perfil.'))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith('notif_')) {
      const key = name.replace('notif_', '')
      setForm(f => ({ ...f, notification_preferences: { ...f.notification_preferences, [key]: checked } }))
    } else {
      setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccessMsg('')
    setErrorMsg('')
    setSaving(true)
    try {
      const updated = await userGateway.updateMyProfile(form)
      setProfile(updated)
      setSuccessMsg('Perfil actualizado correctamente.')
    } catch (err) {
      setErrorMsg(err.message ?? 'Error al guardar el perfil.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="profile-page"><p>Cargando perfil...</p></div>

  return (
    <div className="profile-page">
      <h1>Mi perfil</h1>

      {successMsg && <p className="alert alert-success" role="status">{successMsg}</p>}
      {errorMsg && <p className="alert alert-error" role="alert">{errorMsg}</p>}

      {form && (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="profile-username">Usuario</label>
            <input id="profile-username" type="text" value={profile?.username ?? ''} disabled />
          </div>

          <div className="form-group">
            <label htmlFor="profile-first-name">Nombre</label>
            <input
              id="profile-first-name"
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-last-name">Apellido</label>
            <input
              id="profile-last-name"
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile-email">Correo de contacto</label>
            <input
              id="profile-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <fieldset className="form-group">
            <legend>Preferencias de notificación</legend>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="notif_email_notifications"
                checked={form.notification_preferences.email_notifications}
                onChange={handleChange}
              />
              Notificaciones por email
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="notif_push_notifications"
                checked={form.notification_preferences.push_notifications}
                onChange={handleChange}
              />
              Notificaciones push
            </label>
          </fieldset>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      )}
    </div>
  )
}
