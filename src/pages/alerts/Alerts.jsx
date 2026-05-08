/**
 * AlertsPage.jsx
 * IACT v4.0 - Alerts Module
 * UC_ALR_01: Ver alertas disponibles y activas
 * UC_ALR_03: Reconocer Alerta (acknowledge)
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAlerts,
    acknowledgeAlert,
    selectAlerts,
    selectLoading,
    selectError,
} from '../../redux/slices/alerts';

const NOTE_MAX = 500;

export default function Alerts() {
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [ackModal, setAckModal] = useState({ isOpen: false, alertId: null, note: '', error: null });

    const dispatch = useDispatch();
    const alerts = useSelector(selectAlerts);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    useEffect(() => {
        dispatch(fetchAlerts());
    }, [dispatch]);

    const openAckModal = (alertId) => setAckModal({ isOpen: true, alertId, note: '', error: null });
    const closeAckModal = () => setAckModal({ isOpen: false, alertId: null, note: '', error: null });

    const handleConfirmAck = async () => {
        const { alertId, note } = ackModal;
        try {
            await dispatch(acknowledgeAlert({ alertId, note })).unwrap();
            closeAckModal();
        } catch (err) {
            const msg = err?.statusCode === 409
                ? 'Esta alerta ya fue reconocida.'
                : err?.message ?? 'Error al reconocer la alerta.';
            setAckModal(m => ({ ...m, error: msg }));
        }
    };

    const getFilteredAlerts = () => {
        let filtered = alerts || [];

        if (categoryFilter) {
            filtered = filtered.filter(a => a.category === categoryFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(a =>
                (a.name ?? a.title ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (a.code ?? '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
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

    const getStatusBadge = (alert) => {
        if (alert.state === 'acknowledged') return { color: '#6b7280', label: 'Reconocida' };
        if (alert.state === 'firing' || alert.is_active) return { color: '#10b981', label: 'Activa' };
        return { color: '#6b7280', label: 'Inactiva' };
    };

    const filteredAlerts = getFilteredAlerts();

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Centro de Alertas
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ALR_01 - Gestiona alertas y notificaciones del sistema
                </p>
            </div>

            {/* Filtros y búsqueda */}
            <div style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: '1px solid #374151',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                        Buscar
                    </label>
                    <input
                        type="text"
                        placeholder="Buscar por nombre o código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        Categoría
                    </label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
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
                        <option value="">Todas las categorías</option>
                        <option value="SISTEMA">Sistema</option>
                        <option value="NEGOCIO">Negocio</option>
                        <option value="SEGURIDAD">Seguridad</option>
                        <option value="OPERACIONAL">Operacional</option>
                    </select>
                </div>
            </div>

            {/* Tabla de alertas */}
            <div style={{
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: '1px solid #374151',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '150px 200px 1fr 150px 150px 120px',
                    gap: '12px',
                    padding: '14px',
                    backgroundColor: '#0f172a',
                    borderBottom: '1px solid #374151',
                    fontWeight: 600,
                    color: '#fff',
                    fontSize: '12px',
                }}>
                    <div>Código</div>
                    <div>Nombre</div>
                    <div>Descripción</div>
                    <div>Categoría</div>
                    <div>Estado</div>
                    <div>Acción</div>
                </div>

                {/* Rows */}
                {loading ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                        Cargando alertas...
                    </div>
                ) : filteredAlerts.length > 0 ? (
                    filteredAlerts.map((alert, idx) => {
                        const statusBadge = getStatusBadge(alert);
                        const isFiring = alert.state === 'firing';

                        return (
                            <div
                                key={alert.id ?? idx}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '150px 200px 1fr 150px 150px 120px',
                                    gap: '12px',
                                    padding: '12px 14px',
                                    borderBottom: '1px solid #374151',
                                    alignItems: 'center',
                                    backgroundColor: '#1f2937',
                                }}
                            >
                                {/* Código */}
                                <span style={{ color: '#fff', fontWeight: 600, fontSize: '11px' }}>
                                    {alert.code ?? alert.id}
                                </span>

                                {/* Nombre */}
                                <div style={{ color: '#fff', fontSize: '12px' }}>
                                    {alert.name ?? alert.title}
                                </div>

                                {/* Descripción */}
                                <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                                    {alert.description ?? alert.message}
                                </div>

                                {/* Categoría */}
                                <span
                                    style={{
                                        backgroundColor: getCategoryColor(alert.category),
                                        color: '#fff',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        textAlign: 'center',
                                        fontWeight: 600,
                                    }}
                                >
                                    {alert.category ?? alert.severity}
                                </span>

                                {/* Estado */}
                                <span
                                    style={{
                                        backgroundColor: statusBadge.color,
                                        color: '#fff',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        textAlign: 'center',
                                        fontWeight: 600,
                                    }}
                                >
                                    {statusBadge.label}
                                </span>

                                {/* Acción — reconocer solo si firing */}
                                {isFiring && (
                                    <button
                                        onClick={() => openAckModal(alert.id)}
                                        style={{
                                            padding: '6px 10px',
                                            backgroundColor: '#f59e0b',
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        Reconocer
                                    </button>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                        No hay alertas disponibles
                    </div>
                )}
            </div>

            {/* Botón crear alerta */}
            <div style={{ marginTop: '24px' }}>
                <button
                    style={{
                        padding: '10px 24px',
                        backgroundColor: '#10b981',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                    }}
                >
                    Crear Nueva Alerta
                </button>
            </div>

            {error && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#7f1d1d',
                    border: '1px solid #dc2626',
                    borderRadius: '4px',
                    color: '#fca5a5',
                    fontSize: '14px',
                }}>
                    Error: {typeof error === 'string' ? error : error?.message ?? 'Error desconocido'}
                </div>
            )}

            {/* Modal reconocer alerta (uc-alr-03) */}
            {ackModal.isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ack-modal-title"
                    style={{
                        position: 'fixed', inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div style={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        padding: '24px',
                        width: '480px',
                        maxWidth: '90vw',
                    }}>
                        <h2
                            id="ack-modal-title"
                            style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '18px' }}
                        >
                            Reconocer Alerta
                        </h2>

                        <div style={{ marginBottom: '16px' }}>
                            <label
                                htmlFor="ack-note"
                                style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: '#9ca3af' }}
                            >
                                Nota de reconocimiento (opcional)
                            </label>
                            <textarea
                                id="ack-note"
                                aria-label="Nota de reconocimiento"
                                value={ackModal.note}
                                onChange={(e) => setAckModal(m => ({ ...m, note: e.target.value, error: null }))}
                                maxLength={NOTE_MAX}
                                rows={3}
                                placeholder="Añade una nota opcional sobre el reconocimiento..."
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #4b5563',
                                    borderRadius: '4px',
                                    backgroundColor: '#111827',
                                    color: '#fff',
                                    fontSize: '13px',
                                    resize: 'vertical',
                                    boxSizing: 'border-box',
                                }}
                            />
                            <div style={{ textAlign: 'right', fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                                {ackModal.note.length}/{NOTE_MAX}
                            </div>
                        </div>

                        {ackModal.error && (
                            <div
                                role="alert"
                                style={{
                                    marginBottom: '16px',
                                    padding: '10px 12px',
                                    backgroundColor: '#7f1d1d',
                                    border: '1px solid #dc2626',
                                    borderRadius: '4px',
                                    color: '#fca5a5',
                                    fontSize: '13px',
                                }}
                            >
                                {ackModal.error}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={closeAckModal}
                                style={{
                                    padding: '8px 20px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #4b5563',
                                    borderRadius: '4px',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmAck}
                                style={{
                                    padding: '8px 20px',
                                    backgroundColor: '#f59e0b',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                }}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
