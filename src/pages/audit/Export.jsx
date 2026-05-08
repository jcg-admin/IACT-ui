/**
 * ExportPage.jsx
 * IACT v4.0 - Audit Module
 * UC_AUD_03: Exportar logs de auditoria
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuditLogs, selectLoading, selectError } from '../../redux/slices/audit';
import auditService from '../../services/auditService';

export default function Export() {
    const [exportConfig, setExportConfig] = useState({
        format: 'csv',
        dateStart: '',
        dateEnd: '',
        includeDetails: true,
        includeSignature: false,
        compression: false,
    });
    const [exportProgress, setExportProgress] = useState(null);

    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    const handleExport = async () => {
        if (!exportConfig.dateStart || !exportConfig.dateEnd) {
            alert('Especifica rango de fechas');
            return;
        }

        setExportProgress('Preparando exportación...');

        try {
            const filters = {
                dateStart: exportConfig.dateStart,
                dateEnd: exportConfig.dateEnd,
                includeDetails: exportConfig.includeDetails,
                includeSignature: exportConfig.includeSignature,
            };

            setExportProgress('Generando archivo...');
            const blob = await auditService.exportLogs(exportConfig.format, filters);

            setExportProgress('Descargando...');

            // Crear descarga
            const url = window.URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            const timestamp = new Date().toISOString().split('T')[0];
            const extension = exportConfig.format === 'csv' ? 'csv' : 'json';
            downloadLink.download = `audit-logs-${timestamp}.${extension}`;
            downloadLink.click();
            window.URL.revokeObjectURL(url);

            setExportProgress('Exportación completada');
            setTimeout(() => setExportProgress(null), 3000);
        } catch (err) {
            setExportProgress(null);
            alert('Error en exportación: ' + err.message);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Exportar Logs
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_AUD_03 - Exportar registros de auditoria
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Panel izquierdo - Configuración */}
                <div style={{
                    padding: '16px',
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                }}>
                    <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Configuración</h2>

                    {/* Formato */}
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                            Formato
                        </label>
                        <select
                            value={exportConfig.format}
                            onChange={(e) => setExportConfig({ ...exportConfig, format: e.target.value })}
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
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                            <option value="pdf">PDF</option>
                        </select>
                        <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                            {exportConfig.format === 'csv' && 'Formato de texto separado por comas'}
                            {exportConfig.format === 'json' && 'Formato JSON para procesamiento'}
                            {exportConfig.format === 'pdf' && 'Informe PDF con formato profesional'}
                        </small>
                    </div>

                    {/* Rango de fechas */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                                Desde
                            </label>
                            <input
                                type="date"
                                value={exportConfig.dateStart}
                                onChange={(e) => setExportConfig({ ...exportConfig, dateStart: e.target.value })}
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
                                value={exportConfig.dateEnd}
                                onChange={(e) => setExportConfig({ ...exportConfig, dateEnd: e.target.value })}
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
                    </div>

                    {/* Opciones */}
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px',
                            backgroundColor: '#1f2937',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#fff',
                            marginBottom: '8px',
                        }}>
                            <input
                                type="checkbox"
                                checked={exportConfig.includeDetails}
                                onChange={(e) => setExportConfig({ ...exportConfig, includeDetails: e.target.checked })}
                                style={{ cursor: 'pointer' }}
                            />
                            Incluir detalles completos
                        </label>

                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px',
                            backgroundColor: '#1f2937',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#fff',
                            marginBottom: '8px',
                        }}>
                            <input
                                type="checkbox"
                                checked={exportConfig.includeSignature}
                                onChange={(e) => setExportConfig({ ...exportConfig, includeSignature: e.target.checked })}
                                style={{ cursor: 'pointer' }}
                            />
                            Incluir firma digital (CNST-009)
                        </label>

                        <label style={{
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
                                checked={exportConfig.compression}
                                onChange={(e) => setExportConfig({ ...exportConfig, compression: e.target.checked })}
                                style={{ cursor: 'pointer' }}
                            />
                            Comprimir archivo
                        </label>
                    </div>

                    {/* Botón exportar */}
                    <button
                        onClick={handleExport}
                        disabled={!exportConfig.dateStart || !exportConfig.dateEnd || loading || exportProgress}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: !exportConfig.dateStart || !exportConfig.dateEnd ? '#6b7280' : '#10b981',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            cursor: !exportConfig.dateStart || !exportConfig.dateEnd ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                        }}
                    >
                        {exportProgress ? exportProgress : 'Exportar'}
                    </button>
                </div>

                {/* Panel derecho - Preview */}
                <div style={{
                    padding: '16px',
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                }}>
                    <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Información de Exportación</h2>

                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div style={{
                            padding: '12px',
                            backgroundColor: '#1f2937',
                            borderRadius: '4px',
                        }}>
                            <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                                Formato de salida
                            </div>
                            <div style={{ color: '#fff', fontWeight: 600 }}>
                                {exportConfig.format.toUpperCase()}
                            </div>
                        </div>

                        <div style={{
                            padding: '12px',
                            backgroundColor: '#1f2937',
                            borderRadius: '4px',
                        }}>
                            <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                                Rango de fechas
                            </div>
                            <div style={{ color: '#fff', fontWeight: 600 }}>
                                {exportConfig.dateStart && exportConfig.dateEnd
                                    ? `${exportConfig.dateStart} a ${exportConfig.dateEnd}`
                                    : 'No especificado'}
                            </div>
                        </div>

                        <div style={{
                            padding: '12px',
                            backgroundColor: '#1f2937',
                            borderRadius: '4px',
                        }}>
                            <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                                Opciones de exportación
                            </div>
                            <ul style={{
                                margin: 0,
                                paddingLeft: '16px',
                                color: '#fff',
                                fontSize: '12px',
                            }}>
                                <li>{exportConfig.includeDetails ? '✓' : '✗'} Detalles completos</li>
                                <li>{exportConfig.includeSignature ? '✓' : '✗'} Firma digital</li>
                                <li>{exportConfig.compression ? '✓' : '✗'} Compresión</li>
                            </ul>
                        </div>

                        <div style={{
                            padding: '12px',
                            backgroundColor: '#064e3b',
                            border: '1px solid #10b981',
                            borderRadius: '4px',
                            color: '#86efac',
                            fontSize: '12px',
                        }}>
                            <strong>Nota:</strong> Los logs incluyen metadatos como timestamp, usuario, acción y descripción. La firma digital garantiza la integridad del documento.
                        </div>
                    </div>
                </div>
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
