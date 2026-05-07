/**
 * SeparationRulesPage.jsx
 * IACT v4.0 - Access Module
 * UC_ACC_05: Gestionar reglas de separación de funciones
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSeparationRules, updateSeparationRule, deleteSeparationRule,
    selectSeparationRules, selectLoading, selectError,
} from '../../redux/slices/accessSlice';

export default function SeparationRulesPage() {
    const dispatch = useDispatch();
    const separationRules = useSelector(selectSeparationRules);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const [selectedRule, setSelectedRule] = useState(null);
    const [showViolations, setShowViolations] = useState(false);

    useEffect(() => {
        dispatch(fetchSeparationRules());
    }, [dispatch]);

    const handleToggleRule = (rule) => {
        dispatch(updateSeparationRule({ id: rule.id, isActive: !rule.isActive }));
    };

    const handleDeleteRule = (id) => {
        dispatch(deleteSeparationRule(id));
    };

    const getTotalViolations = () => separationRules.reduce((sum, rule) => sum + (rule.violations || 0), 0);
    const getActiveRules = () => separationRules.filter(rule => rule.isActive).length;

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Gestión de Reglas de Separación
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ACC_05 - Configurar y monitorear restricciones de separación de funciones
                </p>
            </div>

            {/* Estadísticas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '24px',
            }}>
                <div style={{
                    padding: '16px',
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                }}>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>Reglas Activas</div>
                    <div style={{ color: '#0ea5e9', fontSize: '28px', fontWeight: 600, marginTop: '4px' }}>
                        {getActiveRules()}/{separationRules.length}
                    </div>
                </div>

                <div style={{
                    padding: '16px',
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                }}>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>Total Funciones</div>
                    <div style={{ color: '#8b5cf6', fontSize: '28px', fontWeight: 600, marginTop: '4px' }}>
                        44
                    </div>
                </div>

                <div style={{
                    padding: '16px',
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                }}>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>Violaciones Detectadas</div>
                    <div style={{
                        color: getTotalViolations() > 0 ? '#dc2626' : '#10b981',
                        fontSize: '28px',
                        fontWeight: 600,
                        marginTop: '4px',
                    }}>
                        {getTotalViolations()}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Panel izquierdo - Lista de reglas */}
                <div>
                    <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Reglas de Separación Configuradas</h2>

                    <div style={{ display: 'grid', gap: '12px' }}>
                        {separationRules.map(rule => (
                            <div
                                key={rule.id}
                                onClick={() => setSelectedRule(rule)}
                                style={{
                                    padding: '16px',
                                    backgroundColor: selectedRule?.id === rule.id ? '#1e40af' : '#111827',
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
                                            {rule.code}: {rule.name}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                            {rule.description}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <button
                                            aria-label={rule.isActive ? 'Desactivar' : 'Activar'}
                                            onClick={(e) => { e.stopPropagation(); handleToggleRule(rule); }}
                                            disabled={loading}
                                            style={{ padding: '4px 10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: rule.isActive ? '#374151' : '#0ea5e9', color: '#fff' }}
                                        >
                                            {rule.isActive ? 'Desactivar' : 'Activar'}
                                        </button>
                                        <button
                                            aria-label="Eliminar"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteRule(rule.id); }}
                                            disabled={loading}
                                            style={{ padding: '4px 10px', fontSize: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#dc2626', color: '#fff' }}
                                        >
                                            Eliminar
                                        </button>
                                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                            {rule.isActive ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>
                                </div>

                                {rule.violations > 0 && (
                                    <div style={{
                                        marginTop: '8px',
                                        padding: '8px',
                                        backgroundColor: '#7f1d1d',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        color: '#fca5a5',
                                    }}>
                                        {rule.violations} violación(es) detectada(s)
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panel derecho - Detalles de regla */}
                <div>
                    {selectedRule ? (
                        <>
                            {/* Detalles */}
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#111827',
                                borderRadius: '8px',
                                border: '1px solid #374151',
                                marginBottom: '16px',
                            }}>
                                <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>
                                    {selectedRule.code}: {selectedRule.name}
                                </h3>

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                                        Descripción
                                    </div>
                                    <div style={{ color: '#fff' }}>
                                        {selectedRule.description}
                                    </div>
                                </div>

                                <div style={{
                                    marginBottom: '16px',
                                    padding: '12px',
                                    backgroundColor: '#1f2937',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#9ca3af',
                                }}>
                                    <strong style={{ color: '#fff' }}>Razón:</strong> {selectedRule.reason}
                                </div>

                                <div style={{
                                    padding: '12px',
                                    backgroundColor: selectedRule.isActive ? '#064e3b' : '#1f2937',
                                    border: `1px solid ${selectedRule.isActive ? '#10b981' : '#6b7280'}`,
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: selectedRule.isActive ? '#86efac' : '#9ca3af',
                                }}>
                                    Status: {selectedRule.isActive ? 'Activa' : 'Inactiva'}
                                </div>
                            </div>

                            {/* Set A */}
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#111827',
                                borderRadius: '8px',
                                border: '1px solid #374151',
                                marginBottom: '16px',
                            }}>
                                <h4 style={{ margin: '0 0 12px 0', color: '#fff' }}>
                                    {selectedRule.setA}
                                </h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '8px',
                                }}>
                                    {selectedRule.functionsA.map((func, idx) => (
                                        <span
                                            key={idx}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#8b5cf6',
                                                color: '#fff',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                textAlign: 'center',
                                            }}
                                        >
                                            {func}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Incompatible */}
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#7f1d1d',
                                border: '1px solid #dc2626',
                                borderRadius: '4px',
                                textAlign: 'center',
                                color: '#fca5a5',
                                fontWeight: 600,
                                marginBottom: '16px',
                            }}>
                                INCOMPATIBLE CON
                            </div>

                            {/* Set B */}
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#111827',
                                borderRadius: '8px',
                                border: '1px solid #374151',
                            }}>
                                <h4 style={{ margin: '0 0 12px 0', color: '#fff' }}>
                                    {selectedRule.setB}
                                </h4>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '8px',
                                }}>
                                    {selectedRule.functionsB.map((func, idx) => (
                                        <span
                                            key={idx}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#f59e0b',
                                                color: '#fff',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                                textAlign: 'center',
                                            }}
                                        >
                                            {func}
                                        </span>
                                    ))}
                                </div>
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
                            Selecciona una regla para ver detalles
                        </div>
                    )}
                </div>
            </div>

            {/* Botón ver violaciones */}
            <div style={{ marginTop: '24px' }}>
                <button
                    onClick={() => setShowViolations(!showViolations)}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: getTotalViolations() > 0 ? '#dc2626' : '#6b7280',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: getTotalViolations() > 0 ? 'pointer' : 'not-allowed',
                        fontSize: '14px',
                        fontWeight: 600,
                    }}
                    disabled={getTotalViolations() === 0}
                >
                    {showViolations ? 'Ocultar' : 'Ver'} Violaciones ({getTotalViolations()})
                </button>

                {showViolations && getTotalViolations() > 0 && (
                    <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        backgroundColor: '#7f1d1d',
                        border: '1px solid #dc2626',
                        borderRadius: '8px',
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', color: '#fca5a5' }}>
                            Violaciones de Separación de Funciones Detectadas
                        </h3>
                        <div style={{ color: '#dcfce7', fontSize: '13px' }}>
                            <p>Se han detectado usuarios con funciones incompatibles según las reglas de separación.</p>
                            <p>Estas violaciones deben resolverse para cumplir con las restricciones de separación de funciones.</p>
                            <p style={{ marginTop: '12px', color: '#fca5a5', fontWeight: 600 }}>
                                Acciones recomendadas: Revisar AccessAuditPage y PermissionsPage para resolver violaciones.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Información */}
            <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#064e3b',
                border: '1px solid #10b981',
                borderRadius: '8px',
                color: '#86efac',
                fontSize: '12px',
            }}>
                <strong>Nota:</strong> Las reglas de separación de funciones son críticas para la seguridad del sistema. Cada regla previene conflictos de intereses asignando roles incompatibles a diferentes usuarios.
            </div>
        </div>
    );
}
