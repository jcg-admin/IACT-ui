/**
 * SettingsPage Component
 * Configuración de aplicación
 */

import React, { useState } from 'react';
import { useToast } from '../../../context/ToastContext';

function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });
  const [language, setLanguage] = useState('es');
  const { addToast } = useToast();

  const handleNotificationChange = (key) => {
    const newNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(newNotifications);
    addToast(`Notificaciones ${key} ${newNotifications[key] ? 'activadas' : 'desactivadas'}`, 'success');
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    addToast(`Idioma cambiado a ${newLang === 'es' ? 'Español' : 'English'}`, 'info');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    addToast('Contraseña actualizada exitosamente', 'success');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <h1>Configuración</h1>

      {/* Idioma */}
      <div style={{
        marginBottom: '32px',
        padding: '20px',
        backgroundColor: '#0f172a',
        border: '1px solid #1f2937',
        borderRadius: '8px',
      }}>
        <h3 style={{ marginTop: 0 }}>Idioma</h3>
        <p style={{ color: '#9ca3af', marginBottom: '16px' }}>
          Selecciona el idioma de la interfaz
        </p>

        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid #1f2937',
            backgroundColor: '#0f172a',
            color: '#f3f4f6',
            minWidth: '150px',
            cursor: 'pointer'
          }}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Notificaciones */}
      <div style={{
        marginBottom: '32px',
        padding: '20px',
        backgroundColor: '#0f172a',
        border: '1px solid #1f2937',
        borderRadius: '8px',
      }}>
        <h3 style={{ marginTop: 0 }}>Notificaciones</h3>
        <p style={{ color: '#9ca3af', marginBottom: '16px' }}>
          Configura cómo deseas recibir notificaciones
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={() => handleNotificationChange('email')}
              style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>Notificaciones por Email</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={() => handleNotificationChange('push')}
              style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>Notificaciones Push</span>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={() => handleNotificationChange('sms')}
              style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span>Notificaciones por SMS</span>
          </label>
        </div>
      </div>

      {/* Seguridad */}
      <div style={{
        marginBottom: '32px',
        padding: '20px',
        backgroundColor: '#0f172a',
        border: '1px solid #1f2937',
        borderRadius: '8px',
      }}>
        <h3 style={{ marginTop: 0 }}>Seguridad</h3>
        <p style={{ color: '#9ca3af', marginBottom: '16px' }}>
          Cambia tu contraseña regularmente
        </p>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
              Contraseña actual
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #1f2937',
                backgroundColor: '#0f172a',
                color: '#f3f4f6',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
              Nueva contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #1f2937',
                backgroundColor: '#0f172a',
                color: '#f3f4f6',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
              Confirmar contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #1f2937',
                backgroundColor: '#0f172a',
                color: '#f3f4f6',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '10px 16px',
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              alignSelf: 'flex-start'
            }}
          >
            Actualizar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}

export default SettingsPage;
