/**
 * TemplatesPage.jsx
 * IACT v4.0 - Alerts Module
 * UC_ALR_05: Gestionar plantillas de alertas
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTemplates, selectTemplates, selectLoading } from '../../redux/slices/alertsSlice';

export default function Templates() {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('');

    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);

    useEffect(() => {
        dispatch(fetchTemplates());
        // Cargar plantillas de ejemplo
        setTemplates([
            {
                id: 1,
                code: 'TPL-CPU-HIGH',
                name: 'CPU Alta',
                category: 'SISTEMA',
                description: 'Alerta cuando CPU supera 80%',
                condition: 'CPU > 80',
                channels: ['EMAIL', 'IN_APP'],
                frequency: 'REALTIME',
                isDefault: true,
            },
            {
                id: 2,
                code: 'TPL-MEMORY-LOW',
                name: 'Memoria Baja',
                category: 'SISTEMA',
                description: 'Alerta cuando memoria disponible es menor a 20%',
                condition: 'AVAILABLE_MEMORY < 20%',
                channels: ['EMAIL', 'IN_APP'],
                frequency: 'DAILY',
                isDefault: true,
            },
            {
                id: 3,
                code: 'TPL-FAILED-LOGINS',
                name: 'Intentos de Login Fallidos',
                category: 'SEGURIDAD',
                description: 'Alerta por múltiples intentos fallidos de inicio de sesión',
                condition: 'FAILED_LOGINS > 5 IN 5 MINUTES',
                channels: ['EMAIL', 'SMS', 'IN_APP'],
                frequency: 'REALTIME',
                isDefault: true,
            },
            {
                id: 4,
                code: 'TPL-PIPELINE-ERROR',
                name: 'Error en Pipeline',
                category: 'NEGOCIO',
                description: 'Alerta cuando un pipeline falla en ejecución',
                condition: 'PIPELINE_STATUS = ERROR',
                channels: ['EMAIL', 'IN_APP'],
                frequency: 'REALTIME',
                isDefault: true,
            },
            {
                id: 5,
                code: 'TPL-SALES-THRESHOLD',
                name: 'Umbral de Ventas',
                category: 'NEGOCIO',
                description: 'Alerta cuando ventas diarias están por debajo del target',
                condition: 'DAILY_SALES < TARGET * 0.8',
                channels: ['EMAIL'],
                frequency: 'DAILY',
                isDefault: false,
            },
            {
                id: 6,
                code: 'TPL-DISK-SPACE',
                name: 'Espacio en Disco',
                category: 'SISTEMA',
                description: 'Alerta cuando espacio disponible es menor al 10%',
                condition: 'DISK_USAGE > 90%',
                channels: ['EMAIL', 'SMS'],
                frequency: 'DAILY',
                isDefault: true,
            },
        ]);
    }, [dispatch]);

    const getFilteredTemplates = () => {
        let filtered = templates;
        if (categoryFilter) {
            filtered = filtered.filter(t => t.category === categoryFilter);
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

    const filteredTemplates = getFilteredTemplates();

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Plantillas de Alertas
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ALR_05 - Plantillas predefinidas para crear alertas rápidamente
                </p>
            </div>

            {/* Filtro */}
            <div style={{
                marginBottom: '24px',
                padding: '12px',
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: '1px solid #374151',
            }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                    Filtrar por Categoría
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Panel izquierdo - Lista de plantillas */}
                <div>
                    <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>
                        Plantillas Disponibles ({filteredTemplates.length})
                    </h2>

                    <div style={{ display: 'grid', gap: '12px' }}>
                        {filteredTemplates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => setSelectedTemplate(template)}
                                style={{
                                    padding: '12px',
                                    backgroundColor: selectedTemplate?.id === template.id ? '#1e40af' : '#111827',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px',
                                }}>
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: 600 }}>
                                            {template.name}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                            {template.code}
                                        </div>
                                    </div>
                                    {template.isDefault && (
                                        <span
                                            style={{
                                                backgroundColor: '#10b981',
                                                color: '#fff',
                                                padding: '2px 6px',
                                                borderRadius: '3px',
                                                fontSize: '10px',
                                                fontWeight: 600,
                                            }}
                                        >
                                            Default
                                        </span>
                                    )}
                                </div>

                                <span
                                    style={{
                                        backgroundColor: getCategoryColor(template.category),
                                        color: '#fff',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                    }}
                                >
                                    {template.category}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panel derecho - Detalles */}
                <div>
                    {selectedTemplate ? (
                        <>
                            {/* Detalles de plantilla */}
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#111827',
                                borderRadius: '8px',
                                border: '1px solid #374151',
                                marginBottom: '16px',
                            }}>
                                <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>
                                    {selectedTemplate.name}
                                </h3>

                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                                        Código
                                    </div>
                                    <div style={{ color: '#fff', fontSize: '12px', fontFamily: 'monospace' }}>
                                        {selectedTemplate.code}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                                        Descripción
                                    </div>
                                    <div style={{ color: '#fff', fontSize: '12px' }}>
                                        {selectedTemplate.description}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                                        Condición
                                    </div>
                                    <div style={{
                                        color: '#fff',
                                        fontSize: '12px',
                                        fontFamily: 'monospace',
                                        padding: '8px',
                                        backgroundColor: '#1f2937',
                                        borderRadius: '4px',
                                    }}>
                                        {selectedTemplate.condition}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                                        Canales
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {selectedTemplate.channels.map(channel => (
                                            <span
                                                key={channel}
                                                style={{
                                                    backgroundColor: '#0ea5e9',
                                                    color: '#fff',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                }}
                                            >
                                                {channel}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                                        Frecuencia
                                    </div>
                                    <div style={{
                                        color: '#fff',
                                        backgroundColor: '#f59e0b',
                                        padding: '6px 12px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        textAlign: 'center',
                                    }}>
                                        {selectedTemplate.frequency}
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div style={{ display: 'grid', gap: '8px' }}>
                                <button
                                    style={{
                                        padding: '12px',
                                        backgroundColor: '#10b981',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Usar Esta Plantilla
                                </button>

                                <button
                                    style={{
                                        padding: '12px',
                                        backgroundColor: '#0ea5e9',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Personalizar
                                </button>

                                <button
                                    style={{
                                        padding: '12px',
                                        backgroundColor: '#374151',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                    }}
                                >
                                    Ver Documentación
                                </button>
                            </div>

                            {/* Info adicional */}
                            <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: '#064e3b',
                                border: '1px solid #10b981',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#86efac',
                            }}>
                                <strong>Nota:</strong> Las plantillas predefinidas están optimizadas para casos comunes. Puedes personalizarlas según tus necesidades específicas.
                            </div>
                        </>
                    ) : (
                        <div style={{
                            padding: '24px',
                            backgroundColor: '#111827',
                            borderRadius: '8px',
                            border: '1px solid #374151',
                            color: '#9ca3af',
                            textAlign: 'center',
                        }}>
                            Selecciona una plantilla para ver detalles
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
