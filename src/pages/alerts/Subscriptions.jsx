/**
 * SubscriptionsPage.jsx
 * IACT v4.0 - Alerts Module
 * UC_ALR_04: Gestionar suscripciones a alertas
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMySubscriptions, unsubscribeFromAlert, selectSubscriptions, selectLoading } from '../../redux/slices/alerts';

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [preferences, setPreferences] = useState({
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        silenceDuringMeetings: false,
        digests: 'REALTIME',
    });

    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);

    useEffect(() => {
        dispatch(fetchMySubscriptions());
        // Cargar suscripciones de ejemplo
        setSubscriptions([
            {
                id: 1,
                alert_id: 1,
                alert_name: 'CPU Alta',
                alert_code: 'ALR-SYS-001',
                category: 'SISTEMA',
                channels: ['EMAIL', 'IN_APP'],
                frequency: 'REALTIME',
                subscribed_at: '2026-04-20',
            },
            {
                id: 2,
                alert_id: 3,
                alert_name: 'Intentos de Login Fallidos',
                alert_code: 'ALR-SEC-001',
                category: 'SEGURIDAD',
                channels: ['EMAIL', 'SMS'],
                frequency: 'HOURLY',
                subscribed_at: '2026-04-15',
            },
            {
                id: 3,
                alert_id: 5,
                alert_name: 'Error en Pipeline',
                alert_code: 'ALR-BIZ-004',
                category: 'NEGOCIO',
                channels: ['IN_APP'],
                frequency: 'REALTIME',
                subscribed_at: '2026-04-10',
            },
        ]);
    }, [dispatch]);

    const handleUnsubscribe = async (subscriptionId, alertId) => {
        await dispatch(unsubscribeFromAlert(alertId));
        setSubscriptions(subscriptions.filter(s => s.id !== subscriptionId));
    };

    const getCategoryColor = (category) => {
        const colors = {
            SISTEMA: '#8b5cf6',
            NEGOCIO: '#0ea5e9',
            SEGURIDAD: '#dc2626',
            OPERACIONAL: '#f59e0b',
        };
        return colors[category] || '#6b7280';
    };

    const getChannelLabel = (channels) => {
        return channels.map(ch => {
            const labels = {
                EMAIL: 'Email',
                SMS: 'SMS',
                IN_APP: 'In-App',
                PUSH: 'Push',
            };
            return labels[ch] || ch;
        }).join(', ');
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Mis Suscripciones
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ALR_04 - Gestiona tus suscripciones a alertas
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Panel izquierdo - Mis suscripciones */}
                <div>
                    <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>
                        Alertas Suscritas ({subscriptions.length})
                    </h2>

                    <div style={{ display: 'grid', gap: '12px' }}>
                        {subscriptions.length > 0 ? (
                            subscriptions.map((sub) => (
                                <div
                                    key={sub.id}
                                    style={{
                                        padding: '16px',
                                        backgroundColor: '#111827',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}>
                                                {sub.alert_name}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                {sub.alert_code}
                                            </div>
                                        </div>
                                        <span
                                            style={{
                                                backgroundColor: getCategoryColor(sub.category),
                                                color: '#fff',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {sub.category}
                                        </span>
                                    </div>

                                    <div style={{
                                        padding: '8px',
                                        backgroundColor: '#1f2937',
                                        borderRadius: '4px',
                                        marginBottom: '12px',
                                        fontSize: '12px',
                                        color: '#9ca3af',
                                    }}>
                                        <div style={{ marginBottom: '4px' }}>
                                            <strong style={{ color: '#fff' }}>Canales:</strong> {getChannelLabel(sub.channels)}
                                        </div>
                                        <div>
                                            <strong style={{ color: '#fff' }}>Frecuencia:</strong> {sub.frequency}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleUnsubscribe(sub.id, sub.alert_id)}
                                        disabled={loading}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            backgroundColor: '#dc2626',
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            fontSize: '12px',
                                            opacity: loading ? 0.6 : 1,
                                        }}
                                    >
                                        Desuscribirse
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={{
                                padding: '24px',
                                backgroundColor: '#111827',
                                borderRadius: '8px',
                                border: '1px solid #374151',
                                color: '#9ca3af',
                                textAlign: 'center',
                            }}>
                                No estás suscrito a ninguna alerta
                            </div>
                        )}
                    </div>
                </div>

                {/* Panel derecho - Preferencias */}
                <div>
                    <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Preferencias Generales</h2>

                    <div style={{
                        padding: '16px',
                        backgroundColor: '#111827',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                    }}>
                        {/* Horas de silencio */}
                        <div style={{ marginBottom: '16px' }}>
                            <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '14px' }}>
                                Horas de Silencio
                            </h3>
                            <p style={{ margin: '0 0 8px 0', color: '#9ca3af', fontSize: '12px' }}>
                                No recibirás notificaciones durante estas horas
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                                        Desde
                                    </label>
                                    <input
                                        type="time"
                                        value={preferences.quietHoursStart}
                                        onChange={(e) => setPreferences({ ...preferences, quietHoursStart: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #374151',
                                            borderRadius: '4px',
                                            backgroundColor: '#1f2937',
                                            color: '#fff',
                                            fontSize: '12px',
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                                        Hasta
                                    </label>
                                    <input
                                        type="time"
                                        value={preferences.quietHoursEnd}
                                        onChange={(e) => setPreferences({ ...preferences, quietHoursEnd: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #374151',
                                            borderRadius: '4px',
                                            backgroundColor: '#1f2937',
                                            color: '#fff',
                                            fontSize: '12px',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Opciones adicionales */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px',
                                backgroundColor: '#1f2937',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: '#fff',
                            }}>
                                <input
                                    type="checkbox"
                                    checked={preferences.silenceDuringMeetings}
                                    onChange={(e) => setPreferences({ ...preferences, silenceDuringMeetings: e.target.checked })}
                                    style={{ cursor: 'pointer' }}
                                />
                                Silenciar durante reuniones
                            </label>
                        </div>

                        {/* Modo digesto */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                                Modo Digest
                            </label>
                            <select
                                value={preferences.digests}
                                onChange={(e) => setPreferences({ ...preferences, digests: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #374151',
                                    borderRadius: '4px',
                                    backgroundColor: '#1f2937',
                                    color: '#fff',
                                    fontSize: '12px',
                                }}
                            >
                                <option value="REALTIME">Tiempo Real</option>
                                <option value="HOURLY">Cada Hora</option>
                                <option value="DAILY">Diariamente</option>
                                <option value="WEEKLY">Semanalmente</option>
                            </select>
                            <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                                Recibe un resumen en lugar de notificaciones individuales
                            </small>
                        </div>

                        {/* Botón guardar */}
                        <button
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: '#0ea5e9',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 600,
                            }}
                        >
                            Guardar Preferencias
                        </button>
                    </div>

                    {/* Información adicional */}
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#064e3b',
                        border: '1px solid #10b981',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#86efac',
                    }}>
                        <strong>Tip:</strong> Las alertas críticas de seguridad siempre se entregarán en tiempo real, independientemente de tus preferencias
                    </div>
                </div>
            </div>
        </div>
    );
}
