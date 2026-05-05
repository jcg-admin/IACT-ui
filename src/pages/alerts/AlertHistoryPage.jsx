/**
 * AlertHistoryPage.jsx
 * IACT v4.0 - Alerts Module
 * UC_ALR_03: Ver historial de alertas disparadas
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAlertHistory, selectHistory, selectLoading, selectError } from '../../redux/slices/alertsSlice';

export default function AlertHistoryPage() {
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const dispatch = useDispatch();
    const history = useSelector(selectHistory);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    useEffect(() => {
        dispatch(fetchAlertHistory({ limit: 50 }));
    }, [dispatch]);

    const handleFilter = () => {
        const filters = {
            dateStart,
            dateEnd,
            status: statusFilter,
            category: categoryFilter,
            limit: 50,
        };
        dispatch(fetchAlertHistory(filters));
    };

    const getFilteredHistory = () => {
        let filtered = history || [];

        if (statusFilter) {
            filtered = filtered.filter(h => h.status === statusFilter);
        }

        if (categoryFilter) {
            filtered = filtered.filter(h => h.category === categoryFilter);
        }

        return filtered;
    };

    const getStatusColor = (status) => {
        const colors = {
            SENT: '#10b981',
            PENDING: '#f59e0b',
            FAILED: '#dc2626',
        };
        return colors[status] || '#6b7280';
    };

    const handleExport = (format = 'csv') => {
        const data = getFilteredHistory();
        if (format === 'csv') {
            const csv = [
                ['Fecha/Hora', 'Alerta', 'Categoría', 'Valor', 'Estado'],
                ...data.map(h => [
                    new Date(h.triggered_at).toLocaleString(),
                    h.alert_name,
                    h.category,
                    h.triggered_value,
                    h.status,
                ]),
            ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `alert-history-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
        }
    };

    const filteredHistory = getFilteredHistory();

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Historial de Alertas
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ALR_03 - Histórico de alertas disparadas
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
                        Estado
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
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
                        <option value="">Todos</option>
                        <option value="SENT">Enviado</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="FAILED">Fallo</option>
                    </select>
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
                        <option value="">Todas</option>
                        <option value="SISTEMA">Sistema</option>
                        <option value="NEGOCIO">Negocio</option>
                        <option value="SEGURIDAD">Seguridad</option>
                        <option value="OPERACIONAL">Operacional</option>
                    </select>
                </div>
            </div>

            {/* Tabla de historial */}
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
                        {filteredHistory.length} registros
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={handleFilter}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#0ea5e9',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '12px',
                            }}
                        >
                            Filtrar
                        </button>
                        <button
                            onClick={() => handleExport('csv')}
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#10b981',
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
                </div>

                {/* Header de tabla */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '180px 150px 120px 150px 150px 1fr',
                    gap: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#1f2937',
                    borderBottom: '1px solid #374151',
                    fontWeight: 600,
                    color: '#fff',
                    fontSize: '12px',
                }}>
                    <div>Fecha/Hora</div>
                    <div>Alerta</div>
                    <div>Categoría</div>
                    <div>Valor</div>
                    <div>Estado</div>
                    <div>Detalles</div>
                </div>

                {/* Filas */}
                {loading ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                        Cargando historial...
                    </div>
                ) : filteredHistory.length > 0 ? (
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {filteredHistory.map((record, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '180px 150px 120px 150px 150px 1fr',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderBottom: '1px solid #374151',
                                    alignItems: 'center',
                                    fontSize: '12px',
                                }}
                            >
                                <div style={{ color: '#9ca3af' }}>
                                    {new Date(record.triggered_at).toLocaleString()}
                                </div>
                                <div style={{ color: '#fff' }}>{record.alert_name}</div>
                                <div style={{
                                    color: '#fff',
                                    backgroundColor: '#8b5cf6',
                                    padding: '4px 8px',
                                    borderRadius: '3px',
                                    textAlign: 'center',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                }}>
                                    {record.category}
                                </div>
                                <div style={{ color: '#9ca3af' }}>{record.triggered_value}</div>
                                <div>
                                    <span
                                        style={{
                                            backgroundColor: getStatusColor(record.status),
                                            color: '#fff',
                                            padding: '4px 8px',
                                            borderRadius: '3px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {record.status}
                                    </span>
                                </div>
                                <div style={{ color: '#6b7280', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                    {record.message}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                        No hay registros en el historial
                    </div>
                )}
            </div>

            {error && (
                <div style={{
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
