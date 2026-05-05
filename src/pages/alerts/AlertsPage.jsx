/**
 * AlertsPage.jsx
 * IACT v4.0 - Alerts Module
 * UC_ALR_01: Ver alertas disponibles y activas
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAlerts, selectAlerts, selectLoading, selectError } from '../../redux/slices/alertsSlice';

export default function AlertsPage() {
    const [categoryFilter, setCategoryFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const dispatch = useDispatch();
    const alerts = useSelector(selectAlerts);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    useEffect(() => {
        dispatch(fetchAlerts());
    }, [dispatch]);

    const getFilteredAlerts = () => {
        let filtered = alerts || [];

        if (categoryFilter) {
            filtered = filtered.filter(a => a.category === categoryFilter);
        }

        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.code.toLowerCase().includes(searchTerm.toLowerCase())
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

    const getStatusBadge = (isActive) => {
        if (isActive) {
            return { color: '#10b981', label: 'Activa' };
        }
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
                    gridTemplateColumns: '150px 200px 1fr 150px 150px 100px',
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
                        const statusBadge = getStatusBadge(alert.is_active);

                        return (
                            <div
                                key={idx}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '150px 200px 1fr 150px 150px 100px',
                                    gap: '12px',
                                    padding: '12px 14px',
                                    borderBottom: '1px solid #374151',
                                    alignItems: 'center',
                                    backgroundColor: '#1f2937',
                                }}
                            >
                                {/* Código */}
                                <span
                                    style={{
                                        color: '#fff',
                                        fontWeight: 600,
                                        fontSize: '11px',
                                    }}
                                >
                                    {alert.code}
                                </span>

                                {/* Nombre */}
                                <div style={{ color: '#fff', fontSize: '12px' }}>
                                    {alert.name}
                                </div>

                                {/* Descripción */}
                                <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                                    {alert.description}
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
                                    {alert.category}
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

                                {/* Acción */}
                                <button
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: '#0ea5e9',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                    }}
                                >
                                    Suscribir
                                </button>
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
                    Error: {error}
                </div>
            )}
        </div>
    );
}
