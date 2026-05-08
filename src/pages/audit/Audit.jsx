/**
 * AuditPage.jsx
 * IACT v4.0 - Audit Module
 * UC_AUD_01: Ver logs de auditoria - READ ONLY (CNST-009)
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs, selectLogs, selectLoading, selectError, setFilters } from '../../redux/slices/audit';

export default function Audit() {
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [userFilter, setUserFilter] = useState('');
    const [severityFilter, setSeverityFilter] = useState('');

    const dispatch = useDispatch();
    const logs = useSelector(selectLogs);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    useEffect(() => {
        dispatch(fetchAuditLogs({ limit: 100 }));
    }, [dispatch]);

    const handleFilter = () => {
        const filters = {
            dateStart,
            dateEnd,
            action: actionFilter,
            user_id: userFilter,
            severity: severityFilter,
            limit: 100,
        };
        dispatch(setFilters(filters));
        dispatch(fetchAuditLogs(filters));
    };

    const getActionColor = (action) => {
        const colors = {
            CREATE: '#10b981',
            UPDATE: '#0ea5e9',
            DELETE: '#dc2626',
            READ: '#6b7280',
            ASSIGN: '#8b5cf6',
            REVOKE: '#f59e0b',
        };
        return colors[action] || '#6b7280';
    };

    const getSeverityColor = (severity) => {
        const colors = {
            CRITICAL: '#dc2626',
            HIGH: '#f97316',
            MEDIUM: '#f59e0b',
            LOW: '#10b981',
            INFO: '#0ea5e9',
        };
        return colors[severity] || '#6b7280';
    };

    const getFilteredLogs = () => {
        let filtered = logs || [];

        if (actionFilter) {
            filtered = filtered.filter(log => log.action === actionFilter);
        }

        if (severityFilter) {
            filtered = filtered.filter(log => log.severity === severityFilter);
        }

        return filtered;
    };

    const filteredLogs = getFilteredLogs();

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Auditoria del Sistema
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_AUD_01 - Logs inmutables de todas las operaciones (CNST-009)
                </p>
            </div>

            {/* Filtros */}
            <div style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: '1px solid #374151',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                        Desde
                    </label>
                    <input
                        type="date"
                        value={dateStart}
                        onChange={(e) => setDateStart(e.target.value)}
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
                        type="date"
                        value={dateEnd}
                        onChange={(e) => setDateEnd(e.target.value)}
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
                        Acción
                    </label>
                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
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
                        <option value="">Todas</option>
                        <option value="CREATE">Crear</option>
                        <option value="UPDATE">Actualizar</option>
                        <option value="DELETE">Eliminar</option>
                        <option value="ASSIGN">Asignar</option>
                        <option value="REVOKE">Revocar</option>
                        <option value="READ">Leer</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                        Severidad
                    </label>
                    <select
                        value={severityFilter}
                        onChange={(e) => setSeverityFilter(e.target.value)}
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
                        <option value="">Todas</option>
                        <option value="CRITICAL">Crítica</option>
                        <option value="HIGH">Alta</option>
                        <option value="MEDIUM">Media</option>
                        <option value="LOW">Baja</option>
                        <option value="INFO">Información</option>
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                        onClick={handleFilter}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: '#0ea5e9',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                        }}
                    >
                        Filtrar
                    </button>
                </div>
            </div>

            {/* Tabla de logs */}
            <div style={{
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: '1px solid #374151',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '150px 100px 150px 120px 150px 1fr',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#0f172a',
                    borderBottom: '1px solid #374151',
                    fontWeight: 600,
                    color: '#fff',
                    fontSize: '12px',
                }}>
                    <div>Fecha/Hora</div>
                    <div>Acción</div>
                    <div>Usuario</div>
                    <div>Recurso</div>
                    <div>Severidad</div>
                    <div>Detalles</div>
                </div>

                {/* Rows */}
                {loading ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                        Cargando logs...
                    </div>
                ) : filteredLogs.length > 0 ? (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {filteredLogs.map((log, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '150px 100px 150px 120px 150px 1fr',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #374151',
                                    alignItems: 'center',
                                    fontSize: '12px',
                                }}
                            >
                                <div style={{ color: '#9ca3af' }}>
                                    {new Date(log.timestamp).toLocaleString()}
                                </div>

                                <div>
                                    <span
                                        style={{
                                            backgroundColor: getActionColor(log.action),
                                            color: '#fff',
                                            padding: '4px 8px',
                                            borderRadius: '3px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {log.action}
                                    </span>
                                </div>

                                <div style={{ color: '#fff' }}>{log.user_id}</div>

                                <div style={{ color: '#9ca3af' }}>
                                    {log.resource_type}
                                </div>

                                <div>
                                    <span
                                        style={{
                                            backgroundColor: getSeverityColor(log.severity),
                                            color: '#fff',
                                            padding: '4px 8px',
                                            borderRadius: '3px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {log.severity}
                                    </span>
                                </div>

                                <div style={{ color: '#6b7280', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    {log.description}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                        No hay logs en los filtros especificados
                    </div>
                )}
            </div>

            {/* Nota CNST-009 */}
            <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#064e3b',
                border: '1px solid #10b981',
                borderRadius: '4px',
                color: '#86efac',
                fontSize: '12px',
            }}>
                <strong>CNST-009 - Auditoria Inmutable:</strong> Todos los registros son insert-only. No se pueden editar, eliminar ni modificar. Esto garantiza la integridad y no-repudiación de las operaciones del sistema.
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
