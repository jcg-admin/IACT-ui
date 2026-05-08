/**
 * AccessAuditPage.jsx
 * IACT v4.0 - Access Module
 * UC_ACC_09: Auditar cambios en control de acceso (CNST-009)
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAccessAudit, selectLoading, selectError } from '../../redux/slices/accessSlice';

export default function AccessAudit() {
    const [selectedUser, setSelectedUser] = useState('');
    const [users, setUsers] = useState([]);
    const [actionFilter, setActionFilter] = useState('');
    const [dateRangeStart, setDateRangeStart] = useState('');
    const [dateRangeEnd, setDateRangeEnd] = useState('');

    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const auditLog = useSelector(state => state.access.auditLog);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            dispatch(fetchAccessAudit(parseInt(selectedUser)));
        }
    }, [selectedUser, dispatch]);

    const loadUsers = async () => {
        try {
            setUsers([
                { id: 1, username: 'user1' },
                { id: 2, username: 'user2' },
                { id: 3, username: 'admin_test' },
            ]);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const getFilteredAudit = () => {
        let filtered = auditLog || [];

        if (actionFilter) {
            filtered = filtered.filter(log => log.action === actionFilter);
        }

        if (dateRangeStart) {
            filtered = filtered.filter(log => new Date(log.timestamp) >= new Date(dateRangeStart));
        }

        if (dateRangeEnd) {
            filtered = filtered.filter(log => new Date(log.timestamp) <= new Date(dateRangeEnd));
        }

        return filtered;
    };

    const getActionColor = (action) => {
        const colors = {
            'ASSIGN_FUNCTION': '#10b981',
            'REVOKE_FUNCTION': '#dc2626',
            'ASSIGN_GROUPER': '#0ea5e9',
            'REVOKE_GROUPER': '#f59e0b',
            'ASSIGN_SEGMENT': '#8b5cf6',
            'REVOKE_SEGMENT': '#f97316',
            'GRANT_TEMPORARY': '#06b6d4',
            'REVOKE_TEMPORARY': '#ef4444',
        };
        return colors[action] || '#6b7280';
    };

    const getActionLabel = (action) => {
        const labels = {
            'ASSIGN_FUNCTION': 'Asignar Función',
            'REVOKE_FUNCTION': 'Revocar Función',
            'ASSIGN_GROUPER': 'Asignar Agrupador',
            'REVOKE_GROUPER': 'Revocar Agrupador',
            'ASSIGN_SEGMENT': 'Asignar Segmento',
            'REVOKE_SEGMENT': 'Revocar Segmento',
            'GRANT_TEMPORARY': 'Permiso Temporal',
            'REVOKE_TEMPORARY': 'Revoke Temporal',
        };
        return labels[action] || action;
    };

    const handleExport = (format = 'csv') => {
        const data = getFilteredAudit();
        if (format === 'csv') {
            const csv = [
                ['Fecha', 'Usuario', 'Acción', 'Recurso', 'Por', 'Razón'],
                ...data.map(log => [
                    new Date(log.timestamp).toLocaleString(),
                    log.user_id,
                    log.action,
                    log.function_id || log.grouper_id || log.segment_id || 'N/A',
                    log.changed_by_user_id,
                    log.reason,
                ]),
            ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `access-audit-${new Date().toISOString().split('T')[0]}.csv`;
            downloadLink.click();
        }
    };

    const filteredLog = getFilteredAudit();

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Auditoria de Acceso
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ACC_09 - Historial de cambios de permisos (CNST-009 - Inmutable)
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
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                        Usuario
                    </label>
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: '1px solid #374151',
                            borderRadius: '4px',
                            backgroundColor: '#1f2937',
                            color: '#fff',
                            fontSize: '12px',
                        }}
                    >
                        <option value="">Todos</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
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
                            padding: '6px 8px',
                            border: '1px solid #374151',
                            borderRadius: '4px',
                            backgroundColor: '#1f2937',
                            color: '#fff',
                            fontSize: '12px',
                        }}
                    >
                        <option value="">Todas</option>
                        <option value="ASSIGN_FUNCTION">Asignar Función</option>
                        <option value="REVOKE_FUNCTION">Revocar Función</option>
                        <option value="ASSIGN_GROUPER">Asignar Agrupador</option>
                        <option value="REVOKE_GROUPER">Revocar Agrupador</option>
                        <option value="GRANT_TEMPORARY">Permiso Temporal</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                        Desde
                    </label>
                    <input
                        type="date"
                        value={dateRangeStart}
                        onChange={(e) => setDateRangeStart(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '6px 8px',
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
                        value={dateRangeEnd}
                        onChange={(e) => setDateRangeEnd(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: '1px solid #374151',
                            borderRadius: '4px',
                            backgroundColor: '#1f2937',
                            color: '#fff',
                            fontSize: '12px',
                        }}
                    />
                </div>
            </div>

            {/* Tabla de auditoria */}
            <div style={{
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: '1px solid #374151',
                overflow: 'hidden',
                marginBottom: '16px',
            }}>
                {/* Toolbar */}
                <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#0f172a',
                    borderBottom: '1px solid #374151',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div style={{ color: '#fff', fontSize: '14px' }}>
                        {filteredLog.length} registros encontrados
                    </div>
                    <button
                        onClick={() => handleExport('csv')}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: '#374151',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '12px',
                        }}
                    >
                        Exportar CSV
                    </button>
                </div>

                {/* Header de tabla */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '150px 120px 150px 180px 150px 1fr',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#1f2937',
                    borderBottom: '1px solid #374151',
                    fontWeight: 600,
                    color: '#fff',
                    fontSize: '12px',
                }}>
                    <div>Fecha</div>
                    <div>Acción</div>
                    <div>Usuario</div>
                    <div>Recurso</div>
                    <div>Realizado por</div>
                    <div>Razón</div>
                </div>

                {/* Filas */}
                {loading ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                        Cargando auditoria...
                    </div>
                ) : filteredLog.length > 0 ? (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {filteredLog.map((log, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '150px 120px 150px 180px 150px 1fr',
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
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {getActionLabel(log.action)}
                                    </span>
                                </div>
                                <div style={{ color: '#fff' }}>{log.user_id}</div>
                                <div style={{ color: '#9ca3af' }}>
                                    {log.function_id || log.grouper_id || log.segment_id || 'N/A'}
                                </div>
                                <div style={{ color: '#9ca3af' }}>{log.changed_by_user_id}</div>
                                <div style={{ color: '#6b7280', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    {log.reason}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                        No hay registros de auditoria
                    </div>
                )}
            </div>

            {/* Nota sobre CNST-009 */}
            <div style={{
                padding: '12px',
                backgroundColor: '#064e3b',
                border: '1px solid #10b981',
                borderRadius: '4px',
                color: '#86efac',
                fontSize: '12px',
            }}>
                <strong>Restricción CNST-009 - Auditoria Inmutable:</strong> Estos registros son insert-only y no pueden ser modificados ni eliminados. Todos los cambios de permisos se registran automáticamente.
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
