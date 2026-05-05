/**
 * FunctionSelector.jsx
 * IACT v4.0 - Access Module
 * UC_ACC_01: Componente para seleccionar funciones con validación SoD
 */

import React, { useState, useEffect } from 'react';

const FUNCTION_CATEGORIES = {
    PIPELINE: 'Pipeline',
    USUARIO: 'Usuarios',
    AUDITORIA: 'Auditoria',
    ACCESO: 'Control de Acceso',
    CONFIGURACION: 'Configuración',
    DASHBOARD: 'Dashboard',
};

const SOD_RULES = {
    'SOD-001': { setA: /^PIP-/, setB: /^AUD-/, desc: 'Pipeline vs Auditoria' },
    'SOD-002': { setA: /^USR-/, setB: /^AUD-/, desc: 'Usuario vs Auditoria' },
    'SOD-003': { setA: /^ACC-/, setB: /^AUD-/, desc: 'Acceso vs Auditoria' },
};

export default function FunctionSelector({
    allFunctions = [],
    selectedFunctionIds = [],
    currentUserFunctions = [],
    onSelectionChange,
    onConflictDetected,
    readOnly = false,
}) {
    const [selectedFunctions, setSelectedFunctions] = useState(selectedFunctionIds);
    const [searchTerm, setSearchTerm] = useState('');
    const [conflicts, setConflicts] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState(
        Object.keys(FUNCTION_CATEGORIES)
    );

    /**
     * Detectar conflictos SoD
     */
    const detectConflicts = (newSelection) => {
        const conflictList = [];

        const selectedCodes = newSelection.map(id => {
            const func = allFunctions.find(f => f.id === id);
            return func ? func.code : null;
        }).filter(Boolean);

        for (const [ruleCode, rule] of Object.entries(SOD_RULES)) {
            const inSetA = selectedCodes.filter(code => rule.setA.test(code));
            const inSetB = selectedCodes.filter(code => rule.setB.test(code));

            if (inSetA.length > 0 && inSetB.length > 0) {
                conflictList.push({
                    rule: ruleCode,
                    ruleDesc: rule.desc,
                    setA: inSetA,
                    setB: inSetB,
                    message: `Conflicto ${ruleCode}: ${inSetA.join(', ')} incompatible con ${inSetB.join(', ')}`,
                });
            }
        }

        setConflicts(conflictList);
        if (onConflictDetected) {
            onConflictDetected(conflictList);
        }

        return conflictList.length === 0;
    };

    /**
     * Manejar selección de función
     */
    const handleFunctionToggle = (functionId) => {
        if (readOnly) return;

        const newSelection = selectedFunctions.includes(functionId)
            ? selectedFunctions.filter(id => id !== functionId)
            : [...selectedFunctions, functionId];

        const isValid = detectConflicts(newSelection);

        setSelectedFunctions(newSelection);
        if (onSelectionChange) {
            onSelectionChange(newSelection, !isValid);
        }
    };

    /**
     * Toggle categoría
     */
    const toggleCategory = (category) => {
        setExpandedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    /**
     * Obtener funciones filtradas
     */
    const getFilteredFunctions = () => {
        const filtered = {};

        for (const [category, _] of Object.entries(FUNCTION_CATEGORIES)) {
            filtered[category] = allFunctions.filter(func => {
                const matchesSearch = !searchTerm ||
                    func.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    func.name.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesCategory = func.category === category;

                return matchesSearch && matchesCategory;
            });
        }

        return filtered;
    };

    /**
     * Verificar si función está en conflicto
     */
    const getConflictStatus = (functionCode) => {
        for (const conflict of conflicts) {
            if (conflict.setA.includes(functionCode) || conflict.setB.includes(functionCode)) {
                return {
                    inConflict: true,
                    conflictRule: conflict.rule,
                    with: conflict.setA.includes(functionCode)
                        ? conflict.setB.join(', ')
                        : conflict.setA.join(', '),
                };
            }
        }
        return { inConflict: false };
    };

    const filteredFunctions = getFilteredFunctions();
    const hasConflicts = conflicts.length > 0;

    return (
        <div style={{ padding: '16px', backgroundColor: '#0f172a', borderRadius: '8px' }}>
            {/* Header */}
            <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 12px 0', color: '#fff' }}>
                    Seleccionar Funciones
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>
                    {selectedFunctions.length} funciones seleccionadas
                </p>
            </div>

            {/* Búsqueda */}
            <div style={{ marginBottom: '16px' }}>
                <input
                    type="text"
                    placeholder="Buscar función..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={readOnly}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        backgroundColor: '#1f2937',
                        color: '#fff',
                        fontSize: '14px',
                    }}
                />
            </div>

            {/* Alertas de Conflicto */}
            {hasConflicts && (
                <div
                    style={{
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: '#7f1d1d',
                        border: '1px solid #dc2626',
                        borderRadius: '4px',
                        color: '#fca5a5',
                        fontSize: '14px',
                    }}
                >
                    <strong>Conflictos SoD detectados:</strong>
                    <ul style={{ margin: '8px 0 0 16px', paddingLeft: '16px' }}>
                        {conflicts.map((conflict, idx) => (
                            <li key={idx}>
                                {conflict.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Funciones por Categoría */}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {Object.entries(filteredFunctions).map(([category, functions]) => (
                    <div key={category} style={{ marginBottom: '12px' }}>
                        {/* Header Categoría */}
                        <div
                            onClick={() => toggleCategory(category)}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                userSelect: 'none',
                            }}
                        >
                            <span style={{ fontWeight: 600, color: '#fff' }}>
                                {FUNCTION_CATEGORIES[category]}
                                <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '8px' }}>
                                    ({functions.length})
                                </span>
                            </span>
                            <span style={{ color: '#9ca3af' }}>
                                {expandedCategories.includes(category) ? '-' : '+'}
                            </span>
                        </div>

                        {/* Funciones */}
                        {expandedCategories.includes(category) && (
                            <div style={{ marginTop: '8px', paddingLeft: '12px' }}>
                                {functions.map(func => {
                                    const isSelected = selectedFunctions.includes(func.id);
                                    const conflictInfo = getConflictStatus(func.code);
                                    const isCurrentUserFunc = currentUserFunctions.some(
                                        f => f.function_id === func.id
                                    );

                                    return (
                                        <div
                                            key={func.id}
                                            style={{
                                                marginBottom: '8px',
                                                padding: '8px 12px',
                                                backgroundColor: isSelected ? '#1e40af' : '#111827',
                                                border: conflictInfo.inConflict
                                                    ? '1px solid #dc2626'
                                                    : '1px solid #374151',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '8px',
                                                cursor: readOnly ? 'not-allowed' : 'pointer',
                                                opacity: readOnly ? 0.6 : 1,
                                            }}
                                            onClick={() => handleFunctionToggle(func.id)}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => { }}
                                                disabled={readOnly}
                                                style={{
                                                    marginTop: '4px',
                                                    cursor: readOnly ? 'not-allowed' : 'pointer',
                                                    accentColor: conflictInfo.inConflict ? '#dc2626' : '#0ea5e9',
                                                }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: '#fff', fontWeight: 500 }}>
                                                    {func.code} - {func.name}
                                                    {isCurrentUserFunc && (
                                                        <span
                                                            style={{
                                                                marginLeft: '8px',
                                                                fontSize: '12px',
                                                                color: '#10b981',
                                                                backgroundColor: '#064e3b',
                                                                padding: '2px 6px',
                                                                borderRadius: '3px',
                                                            }}
                                                        >
                                                            Actual
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                                    {func.description}
                                                </div>
                                                {conflictInfo.inConflict && (
                                                    <div
                                                        style={{
                                                            fontSize: '12px',
                                                            color: '#dc2626',
                                                            marginTop: '4px',
                                                        }}
                                                    >
                                                        Conflicto: {conflictInfo.conflictRule} con {conflictInfo.with}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Estadísticas */}
            <div
                style={{
                    marginTop: '16px',
                    padding: '12px',
                    backgroundColor: '#1f2937',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#9ca3af',
                }}
            >
                <div>Seleccionadas: {selectedFunctions.length} / {allFunctions.length}</div>
                <div style={{ marginTop: '4px' }}>
                    Estado: {hasConflicts ? (
                        <span style={{ color: '#dc2626' }}>ERROR - Conflictos detectados</span>
                    ) : (
                        <span style={{ color: '#10b981' }}>OK - Válido</span>
                    )}
                </div>
            </div>
        </div>
    );
}
