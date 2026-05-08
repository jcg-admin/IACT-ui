/**
 * AlertConfigPage.jsx
 * IACT v4.0 - Alerts Module
 * UC_ALR_02: Configurar alertas - crear y editar condiciones
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAlert, fetchTemplates, selectLoading, selectError, selectSuccess } from '../../redux/slices/alerts';

const OPERATORS = ['>', '<', '=', '>=', '<=', '!=', 'CONTAINS', 'NOT_CONTAINS'];
const FREQUENCIES = ['REALTIME', 'HOURLY', 'DAILY', 'WEEKLY'];
const CHANNELS = ['EMAIL', 'SMS', 'IN_APP', 'PUSH'];

export default function AlertConfig() {
    const [config, setConfig] = useState({
        name: '',
        description: '',
        category: 'SISTEMA',
        metric: '',
        operator: '>',
        threshold: '',
        channels: ['IN_APP'],
        frequency: 'REALTIME',
        isActive: true,
    });

    const [conditions, setConditions] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [showTemplate, setShowTemplate] = useState(false);

    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const success = useSelector(selectSuccess);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        // Datos de ejemplo
        setTemplates([
            {
                id: 1,
                code: 'TPL-CPU-HIGH',
                name: 'CPU Alta',
                category: 'SISTEMA',
                description: 'Alerta cuando CPU supera 80%',
            },
            {
                id: 2,
                code: 'TPL-MEMORY-LOW',
                name: 'Memoria Baja',
                category: 'SISTEMA',
                description: 'Alerta cuando memoria disponible es menor a 20%',
            },
            {
                id: 3,
                code: 'TPL-FAILED-LOGINS',
                name: 'Intentos Fallidos',
                category: 'SEGURIDAD',
                description: 'Alerta por múltiples intentos de login fallidos',
            },
        ]);
    };

    const handleAddCondition = () => {
        if (!config.metric || !config.threshold) {
            alert('Completa métrica y umbral');
            return;
        }

        const newCondition = {
            id: Date.now(),
            metric: config.metric,
            operator: config.operator,
            threshold: config.threshold,
        };

        setConditions([...conditions, newCondition]);
        setConfig({ ...config, metric: '', threshold: '' });
    };

    const handleRemoveCondition = (id) => {
        setConditions(conditions.filter(c => c.id !== id));
    };

    const handleCreateAlert = async () => {
        if (!config.name || conditions.length === 0) {
            alert('Completa nombre y al menos una condición');
            return;
        }

        const alertConfig = {
            ...config,
            conditions,
        };

        await dispatch(createAlert(alertConfig));

        if (success) {
            // Reset form
            setConfig({
                name: '',
                description: '',
                category: 'SISTEMA',
                metric: '',
                operator: '>',
                threshold: '',
                channels: ['IN_APP'],
                frequency: 'REALTIME',
                isActive: true,
            });
            setConditions([]);
            alert('Alerta creada exitosamente');
        }
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

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Configurar Alerta
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ALR_02 - Crear y configurar nuevas alertas
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Panel izquierdo - Configuración básica */}
                <div style={{
                    padding: '16px',
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                }}>
                    <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Información Básica</h2>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                            Nombre
                        </label>
                        <input
                            type="text"
                            value={config.name}
                            onChange={(e) => setConfig({ ...config, name: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                backgroundColor: '#1f2937',
                                color: '#fff',
                                fontSize: '12px',
                            }}
                            placeholder="Ej: CPU Alta"
                        />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                            Descripción
                        </label>
                        <textarea
                            value={config.description}
                            onChange={(e) => setConfig({ ...config, description: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                backgroundColor: '#1f2937',
                                color: '#fff',
                                fontSize: '12px',
                                minHeight: '60px',
                                resize: 'vertical',
                            }}
                            placeholder="Describe la alerta..."
                        />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                            Categoría
                        </label>
                        <select
                            value={config.category}
                            onChange={(e) => setConfig({ ...config, category: e.target.value })}
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
                            <option value="SISTEMA">Sistema</option>
                            <option value="NEGOCIO">Negocio</option>
                            <option value="SEGURIDAD">Seguridad</option>
                            <option value="OPERACIONAL">Operacional</option>
                        </select>
                    </div>

                    {/* Canales */}
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#9ca3af' }}>
                            Canales de Notificación
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {CHANNELS.map(channel => (
                                <label key={channel} style={{
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
                                        checked={config.channels.includes(channel)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setConfig({ ...config, channels: [...config.channels, channel] });
                                            } else {
                                                setConfig({ ...config, channels: config.channels.filter(c => c !== channel) });
                                            }
                                        }}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    {channel}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Frecuencia */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                            Frecuencia
                        </label>
                        <select
                            value={config.frequency}
                            onChange={(e) => setConfig({ ...config, frequency: e.target.value })}
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
                            {FREQUENCIES.map(freq => (
                                <option key={freq} value={freq}>{freq}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Panel derecho - Condiciones */}
                <div>
                    {/* Constructor de condiciones */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#111827',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                        marginBottom: '16px',
                    }}>
                        <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Condiciones</h2>

                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                                Métrica
                            </label>
                            <input
                                type="text"
                                value={config.metric}
                                onChange={(e) => setConfig({ ...config, metric: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #374151',
                                    borderRadius: '4px',
                                    backgroundColor: '#1f2937',
                                    color: '#fff',
                                    fontSize: '12px',
                                }}
                                placeholder="Ej: CPU, MEMORY, ERROR_RATE"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                                    Operador
                                </label>
                                <select
                                    value={config.operator}
                                    onChange={(e) => setConfig({ ...config, operator: e.target.value })}
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
                                    {OPERATORS.map(op => (
                                        <option key={op} value={op}>{op}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                                    Umbral
                                </label>
                                <input
                                    type="text"
                                    value={config.threshold}
                                    onChange={(e) => setConfig({ ...config, threshold: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #374151',
                                        borderRadius: '4px',
                                        backgroundColor: '#1f2937',
                                        color: '#fff',
                                        fontSize: '12px',
                                    }}
                                    placeholder="Ej: 80, 20%"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAddCondition}
                            style={{
                                width: '100%',
                                padding: '8px',
                                backgroundColor: '#0ea5e9',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '12px',
                            }}
                        >
                            Agregar Condición
                        </button>
                    </div>

                    {/* Lista de condiciones */}
                    {conditions.length > 0 && (
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#111827',
                            borderRadius: '8px',
                            border: '1px solid #374151',
                        }}>
                            <h3 style={{ margin: '0 0 12px 0', color: '#fff' }}>
                                Condiciones ({conditions.length})
                            </h3>
                            {conditions.map((cond, idx) => (
                                <div
                                    key={cond.id}
                                    style={{
                                        padding: '8px',
                                        backgroundColor: '#1f2937',
                                        borderRadius: '4px',
                                        marginBottom: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <span style={{ color: '#fff', fontSize: '12px' }}>
                                        {cond.metric} {cond.operator} {cond.threshold}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveCondition(cond.id)}
                                        style={{
                                            padding: '4px 8px',
                                            backgroundColor: '#dc2626',
                                            border: 'none',
                                            borderRadius: '3px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                        }}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Botones de acción */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => {
                        setConfig({
                            name: '',
                            description: '',
                            category: 'SISTEMA',
                            metric: '',
                            operator: '>',
                            threshold: '',
                            channels: ['IN_APP'],
                            frequency: 'REALTIME',
                            isActive: true,
                        });
                        setConditions([]);
                    }}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#374151',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                    }}
                >
                    Limpiar
                </button>

                <button
                    onClick={handleCreateAlert}
                    disabled={!config.name || conditions.length === 0 || loading}
                    style={{
                        padding: '10px 24px',
                        backgroundColor: !config.name || conditions.length === 0 ? '#6b7280' : '#10b981',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: !config.name || conditions.length === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                    }}
                >
                    {loading ? 'Creando...' : 'Crear Alerta'}
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
