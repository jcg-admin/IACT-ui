/**
 * SoDValidator.jsx
 * IACT v4.0 - Access Module
 * Componente para visualizar conflictos SoD
 */

import React from 'react';

const SOD_RULES_INFO = {
    'SOD-001': {
        name: 'Pipeline vs Auditoria',
        description: 'Quien ejecuta pipelines no puede auditarlos',
        setA: 'Funciones Pipeline (PIP-*)',
        setB: 'Funciones Auditoria (AUD-*)',
        reason: 'Separación de deberes: Ejecutor vs Auditor',
    },
    'SOD-002': {
        name: 'Usuario vs Auditoria',
        description: 'Quien gestiona usuarios no puede auditarlos',
        setA: 'Funciones Usuario (USR-*)',
        setB: 'Funciones Auditoria (AUD-*)',
        reason: 'Separación de deberes: Gestor vs Auditor',
    },
    'SOD-003': {
        name: 'Acceso vs Auditoria',
        description: 'Quien asigna funciones no puede auditarlas',
        setA: 'Funciones Acceso (ACC-*)',
        setB: 'Funciones Auditoria (AUD-*)',
        reason: 'Separación de deberes: Administrador vs Auditor',
    },
};

export default function SoDValidator({ conflicts = [], selectedFunctions = [] }) {
    if (conflicts.length === 0) {
        return (
            <div style={{
                padding: '16px',
                backgroundColor: '#064e3b',
                border: '1px solid #10b981',
                borderRadius: '8px',
            }}>
                <div style={{ color: '#10b981', fontWeight: 600, marginBottom: '8px' }}>
                    Estado: Válido
                </div>
                <div style={{ color: '#86efac', fontSize: '14px' }}>
                    No hay conflictos SoD. La combinación de funciones es válida.
                </div>
            </div>
        );
    }

    return (
        <div style={{
            padding: '16px',
            backgroundColor: '#7f1d1d',
            border: '1px solid #dc2626',
            borderRadius: '8px',
        }}>
            <div style={{ color: '#dc2626', fontWeight: 600, marginBottom: '12px', fontSize: '16px' }}>
                Conflictos SoD Detectados ({conflicts.length})
            </div>

            {conflicts.map((conflict, idx) => {
                const ruleInfo = SOD_RULES_INFO[conflict.rule] || {};

                return (
                    <div key={idx} style={{ marginBottom: '16px' }}>
                        {/* Encabezado del conflicto */}
                        <div style={{
                            backgroundColor: '#991b1b',
                            padding: '12px',
                            borderRadius: '4px',
                            marginBottom: '8px',
                        }}>
                            <div style={{ color: '#fca5a5', fontWeight: 600 }}>
                                {conflict.rule}: {ruleInfo.name}
                            </div>
                            <div style={{ color: '#dcfce7', fontSize: '13px', marginTop: '4px' }}>
                                {conflict.message}
                            </div>
                        </div>

                        {/* Detalles del conflicto */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px',
                            marginBottom: '8px',
                        }}>
                            {/* Set A */}
                            <div style={{
                                backgroundColor: '#1f2937',
                                padding: '12px',
                                borderRadius: '4px',
                                border: '1px solid #dc2626',
                            }}>
                                <div style={{ color: '#fca5a5', fontWeight: 600, fontSize: '12px' }}>
                                    {ruleInfo.setA}
                                </div>
                                <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                                    {conflict.setA.join(', ')}
                                </div>
                            </div>

                            {/* Incompatible */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '12px',
                                borderRadius: '4px',
                                backgroundColor: '#991b1b',
                            }}>
                                <div style={{ color: '#fca5a5', fontWeight: 600, textAlign: 'center' }}>
                                    INCOMPATIBLE
                                </div>
                            </div>

                            {/* Set B */}
                            <div style={{
                                backgroundColor: '#1f2937',
                                padding: '12px',
                                borderRadius: '4px',
                                border: '1px solid #dc2626',
                            }}>
                                <div style={{ color: '#fca5a5', fontWeight: 600, fontSize: '12px' }}>
                                    {ruleInfo.setB}
                                </div>
                                <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                                    {conflict.setB.join(', ')}
                                </div>
                            </div>
                        </div>

                        {/* Razón */}
                        <div style={{
                            padding: '8px',
                            backgroundColor: '#1f2937',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#9ca3af',
                        }}>
                            <strong style={{ color: '#fff' }}>Razón:</strong> {ruleInfo.reason}
                        </div>

                        {/* Descripción */}
                        <div style={{
                            padding: '8px',
                            backgroundColor: '#1f2937',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#9ca3af',
                            marginTop: '4px',
                        }}>
                            {ruleInfo.description}
                        </div>
                    </div>
                );
            })}

            <div style={{
                marginTop: '12px',
                padding: '10px',
                backgroundColor: '#1f2937',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#fca5a5',
                textAlign: 'center',
            }}>
                No se puede proceder con conflictos SoD activos.
            </div>
        </div>
    );
}
