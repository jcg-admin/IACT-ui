/**
 * SeparationRulesValidator.jsx
 * IACT v4.0 - Access Module
 * Componente para visualizar conflictos de separación de funciones con severidad HARD/SOFT
 */

import React from 'react';
import PropTypes from 'prop-types'

const SEPARATION_RULES_INFO = {
    'SR-001': {
        name: 'Pipeline vs Auditoria',
        description: 'Quien ejecuta pipelines no puede auditarlos',
        setA: 'Funciones Pipeline (PIP-*)',
        setB: 'Funciones Auditoria (AUD-*)',
        reason: 'Separación de deberes: Ejecutor vs Auditor',
    },
    'SR-002': {
        name: 'Usuario vs Auditoria',
        description: 'Quien gestiona usuarios no puede auditarlos',
        setA: 'Funciones Usuario (USR-*)',
        setB: 'Funciones Auditoria (AUD-*)',
        reason: 'Separación de deberes: Gestor vs Auditor',
    },
    'SR-003': {
        name: 'Acceso vs Auditoria',
        description: 'Quien asigna funciones no puede auditarlas',
        setA: 'Funciones Acceso (ACC-*)',
        setB: 'Funciones Auditoria (AUD-*)',
        reason: 'Separación de deberes: Administrador vs Auditor',
    },
};

function getSeverity(conflict) {
    return conflict.severity === 'SOFT' ? 'SOFT' : 'HARD';
}

export default function SeparationRulesValidator({ conflicts = [], selectedFunctions = [], onProceedAnyway }) {
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
                    No hay conflictos de separación de funciones. La combinación es válida.
                </div>
            </div>
        );
    }

    const hasHard = conflicts.some((c) => getSeverity(c) === 'HARD');
    const allSoft = !hasHard;

    const containerStyle = hasHard
        ? { padding: '16px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '8px' }
        : { padding: '16px', backgroundColor: '#78350f', border: '1px solid #d97706', borderRadius: '8px' };

    const titleColor = hasHard ? '#dc2626' : '#d97706';

    return (
        <div style={containerStyle}>
            <div style={{ color: titleColor, fontWeight: 600, marginBottom: '12px', fontSize: '16px' }}>
                Conflictos de Separación Detectados ({conflicts.length})
            </div>

            {conflicts.map((conflict, idx) => {
                const ruleInfo = SEPARATION_RULES_INFO[conflict.rule] || {};
                const severity = getSeverity(conflict);
                const isHard = severity === 'HARD';

                const badgeStyle = isHard
                    ? { backgroundColor: '#dc2626', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }
                    : { backgroundColor: '#d97706', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 };

                const headerBg = isHard ? '#991b1b' : '#92400e';
                const borderColor = isHard ? '#dc2626' : '#d97706';

                return (
                    <div key={idx} style={{ marginBottom: '16px' }}>
                        <div style={{
                            backgroundColor: headerBg,
                            padding: '12px',
                            borderRadius: '4px',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: '8px',
                        }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#fca5a5', fontWeight: 600 }}>
                                    {conflict.rule}{ruleInfo.name ? `: ${ruleInfo.name}` : ''}
                                </div>
                                <div style={{ color: '#dcfce7', fontSize: '13px', marginTop: '4px' }}>
                                    {conflict.message}
                                </div>
                            </div>
                            <span style={badgeStyle}>{severity}</span>
                        </div>

                        {(ruleInfo.setA || ruleInfo.setB) && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px',
                                marginBottom: '8px',
                            }}>
                                <div style={{
                                    backgroundColor: '#1f2937',
                                    padding: '12px',
                                    borderRadius: '4px',
                                    border: `1px solid ${borderColor}`,
                                }}>
                                    <div style={{ color: '#fca5a5', fontWeight: 600, fontSize: '12px' }}>
                                        {ruleInfo.setA}
                                    </div>
                                    {conflict.setA && (
                                        <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                                            {conflict.setA.join(', ')}
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    backgroundColor: '#1f2937',
                                    padding: '12px',
                                    borderRadius: '4px',
                                    border: `1px solid ${borderColor}`,
                                }}>
                                    <div style={{ color: '#fca5a5', fontWeight: 600, fontSize: '12px' }}>
                                        {ruleInfo.setB}
                                    </div>
                                    {conflict.setB && (
                                        <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                                            {conflict.setB.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {ruleInfo.reason && (
                            <div style={{
                                padding: '8px',
                                backgroundColor: '#1f2937',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#9ca3af',
                                marginBottom: '4px',
                            }}>
                                <strong style={{ color: '#fff' }}>Razón:</strong> {ruleInfo.reason}
                            </div>
                        )}

                        {ruleInfo.description && (
                            <div style={{
                                padding: '8px',
                                backgroundColor: '#1f2937',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#9ca3af',
                            }}>
                                {ruleInfo.description}
                            </div>
                        )}
                    </div>
                );
            })}

            {hasHard && (
                <div style={{
                    marginTop: '12px',
                    padding: '10px',
                    backgroundColor: '#1f2937',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#fca5a5',
                    textAlign: 'center',
                }}>
                    No se puede proceder con conflictos HARD de separación activos.
                </div>
            )}

            {allSoft && (
                <div style={{
                    marginTop: '12px',
                    padding: '10px',
                    backgroundColor: '#1f2937',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#fde68a',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <span>Advertencia: hay conflictos de nivel SOFT. Puede proceder bajo su responsabilidad.</span>
                    {typeof onProceedAnyway === 'function' && (
                        <button
                            onClick={onProceedAnyway}
                            style={{
                                padding: '6px 14px',
                                backgroundColor: '#d97706',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#fff',
                                fontWeight: 600,
                                cursor: 'pointer',
                                fontSize: '12px',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Entendido, proceder
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
SeparationRulesValidator.propTypes = {
  conflicts:         PropTypes.array,
  selectedFunctions: PropTypes.array,
  onProceedAnyway:   PropTypes.func,
}
