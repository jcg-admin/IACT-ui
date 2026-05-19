/**
 * AuditSearchPage.jsx
 * IACT v4.0 - Audit Module
 * UC_AUD_02: Búsqueda avanzada en logs de auditoria
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchAuditLogs, selectSearchResults, selectLoading, selectError } from '../../redux/slices/audit';

export default function AuditSearch() {
    const [searchQuery, setSearchQuery] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState({
        userId: '',
        action: '',
        resourceType: '',
        resourceId: '',
        severity: '',
        minDate: '',
        maxDate: '',
    });

    const dispatch = useDispatch();
    const results = useSelector(selectSearchResults);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    const handleSimpleSearch = () => {
        if (!searchQuery.trim()) {
            return;
        }
        dispatch(searchAuditLogs({ query: searchQuery }));
    };

    const handleAdvancedSearch = () => {
        const params = {
            ...advancedFilters,
        };
        // Remover campos vacíos
        Object.keys(params).forEach(key => !params[key] && delete params[key]);
        dispatch(searchAuditLogs(params));
    };

    const getActionColor = (action) => {
        const colors = {
            CREATE: '#10b981',
            UPDATE: '#0ea5e9',
            DELETE: '#dc2626',
            READ: '#6b7280',
        };
        return colors[action] || '#6b7280';
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Búsqueda de Auditoria
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_AUD_02 - Búsqueda avanzada en logs de sistema
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Panel izquierdo - Búsqueda */}
                <div>
                    {/* Búsqueda simple */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#111827',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                        marginBottom: '16px',
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', color: '#fff' }}>Búsqueda Rápida</h3>

                        <input
                            type="text"
                            placeholder="Buscar en logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSimpleSearch()}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                marginBottom: '12px',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                backgroundColor: '#1f2937',
                                color: '#fff',
                                fontSize: '12px',
                            }}
                        />

                        <button
                            onClick={handleSimpleSearch}
                            disabled={!searchQuery.trim() || loading}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: searchQuery.trim() ? '#0ea5e9' : '#6b7280',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#fff',
                                cursor: searchQuery.trim() ? 'pointer' : 'not-allowed',
                                fontSize: '12px',
                                fontWeight: 600,
                            }}
                        >
                            {loading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>

                    {/* Búsqueda avanzada */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#111827',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', color: '#fff' }}>Búsqueda Avanzada</h3>

                        <input
                            type="text"
                            placeholder="ID de Usuario"
                            value={advancedFilters.userId}
                            onChange={(e) => setAdvancedFilters({ ...advancedFilters, userId: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                marginBottom: '8px',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                backgroundColor: '#1f2937',
                                color: '#fff',
                                fontSize: '12px',
                            }}
                        />

                        <select
                            value={advancedFilters.action}
                            onChange={(e) => setAdvancedFilters({ ...advancedFilters, action: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                marginBottom: '8px',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                backgroundColor: '#1f2937',
                                color: '#fff',
                                fontSize: '12px',
                            }}
                        >
                            <option value="">Todas las acciones</option>
                            <option value="CREATE">Crear</option>
                            <option value="UPDATE">Actualizar</option>
                            <option value="DELETE">Eliminar</option>
                            <option value="ASSIGN">Asignar</option>
                        </select>

                        <input
                            type="text"
                            placeholder="Tipo de Recurso"
                            value={advancedFilters.resourceType}
                            onChange={(e) => setAdvancedFilters({ ...advancedFilters, resourceType: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                marginBottom: '8px',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                backgroundColor: '#1f2937',
                                color: '#fff',
                                fontSize: '12px',
                            }}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                            <input
                                type="date"
                                value={advancedFilters.minDate}
                                onChange={(e) => setAdvancedFilters({ ...advancedFilters, minDate: e.target.value })}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #374151',
                                    borderRadius: '4px',
                                    backgroundColor: '#1f2937',
                                    color: '#fff',
                                    fontSize: '12px',
                                }}
                            />
                            <input
                                type="date"
                                value={advancedFilters.maxDate}
                                onChange={(e) => setAdvancedFilters({ ...advancedFilters, maxDate: e.target.value })}
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #374151',
                                    borderRadius: '4px',
                                    backgroundColor: '#1f2937',
                                    color: '#fff',
                                    fontSize: '12px',
                                }}
                            />
                        </div>

                        <button
                            onClick={handleAdvancedSearch}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: '#10b981',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 600,
                            }}
                        >
                            Búsqueda Avanzada
                        </button>
                    </div>
                </div>

                {/* Panel derecho - Resultados */}
                <div>
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#111827',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                    }}>
                        <h3 style={{ margin: '0 0 12px 0', color: '#fff' }}>
                            Resultados ({results.length})
                        </h3>

                        {results.length > 0 ? (
                            <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'grid', gap: '8px' }}>
                                {results.map((log, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            padding: '10px',
                                            backgroundColor: '#1f2937',
                                            borderRadius: '4px',
                                            borderLeft: `4px solid ${getActionColor(log.action)}`,
                                        }}
                                    >
                                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '12px', marginBottom: '4px' }}>
                                            {log.description}
                                        </div>
                                        <div style={{ color: '#9ca3af', fontSize: '11px', display: 'grid', gap: '2px' }}>
                                            <div>Usuario: {log.user_id}</div>
                                            <div>Hora: {new Date(log.timestamp).toLocaleString()}</div>
                                            <div>Tipo: {log.resource_type}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{
                                padding: '24px',
                                textAlign: 'center',
                                color: '#9ca3af',
                                fontSize: '12px',
                            }}>
                                Realiza una búsqueda para ver resultados
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div role="alert" className="error-banner">
                    Error: {error}
                </div>
            )}
        </div>
    );
}
