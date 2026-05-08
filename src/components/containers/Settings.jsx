import React, { useState } from 'react'
import { AnimatedButton } from '@ui/animations'

function Settings() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="p-lg">
      <h1>Configuracion</h1>

      <div className="tabs" style={{ marginTop: '24px', marginBottom: '24px' }}>
        <button
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          Seguridad
        </button>
        <button
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notificaciones
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Configuracion General</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Idioma</label>
              <select className="form-control">
                <option>Espanol</option>
                <option>Ingles</option>
                <option>Portugues</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tema</label>
              <div className="form-control" style={{ backgroundColor: '#1f2937', color: '#9ca3af', padding: '8px 12px', borderRadius: '4px', cursor: 'default' }}>
                Oscuro (fijo)
              </div>
              <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>El tema oscuro es obligatorio en IACT v4.0 y no puede ser cambiado.</p>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="compact"
                className="form-check-input"
                defaultChecked
              />
              <label className="form-check-label" htmlFor="compact">
                Modo compacto
              </label>
            </div>

            <AnimatedButton variant="primary" className="mt-lg">Guardar Cambios</AnimatedButton>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Seguridad</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Contrasena Actual</label>
              <input
                type="password"
                placeholder="Ingresa tu contrasena actual"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nueva Contrasena</label>
              <input
                type="password"
                placeholder="Ingresa tu nueva contrasena"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Contrasena</label>
              <input
                type="password"
                placeholder="Confirma tu nueva contrasena"
                className="form-control"
              />
            </div>

            <AnimatedButton variant="primary">Actualizar Contrasena</AnimatedButton>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #374151' }}>
              <h4>Sesiones Activas</h4>
              <div className="card mt-md" style={{ background: '#111827' }}>
                <div className="card-body flex justify-between align-center">
                  <div>
                    <p>Esta sesion (Navegador Chrome en Windows)</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8' }}>Ultima actividad: hace 2 minutos</p>
                  </div>
                  <AnimatedButton variant="secondary" className="btn-sm">Cerrar Sesion</AnimatedButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Preferencias de Notificacion</h3>
          </div>
          <div className="card-body">
            <div className="form-check">
              <input
                type="checkbox"
                id="email-notifications"
                className="form-check-input"
                defaultChecked
              />
              <label className="form-check-label" htmlFor="email-notifications">
                Notificaciones por email
              </label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="push-notifications"
                className="form-check-input"
                defaultChecked
              />
              <label className="form-check-label" htmlFor="push-notifications">
                Notificaciones push
              </label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="sms-notifications"
                className="form-check-input"
              />
              <label className="form-check-label" htmlFor="sms-notifications">
                Notificaciones SMS
              </label>
            </div>

            <div className="form-group mt-md">
              <label className="form-label">Frecuencia de Email</label>
              <select className="form-control">
                <option>En tiempo real</option>
                <option>Diaria</option>
                <option>Semanal</option>
                <option>Mensual</option>
              </select>
            </div>

            <AnimatedButton variant="primary" className="mt-lg">Guardar Preferencias</AnimatedButton>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
