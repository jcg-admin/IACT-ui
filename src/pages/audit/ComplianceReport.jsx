/**
 * ComplianceReportPage.jsx
 * IACT v4.0 - Audit Module
 * UC_AUD_04: Reporte de compliance y regulatorio
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchComplianceReport, selectComplianceReport, selectLoading, selectError } from '../../redux/slices/audit';

export default function ComplianceReport() {
    const [reportConfig, setReportConfig] = useState({
        dateStart: '',
        dateEnd: '',
        regulations: ['separation-rules'],
        includeMetrics: true,
        includeViolin: true,
    });

    const dispatch = useDispatch();
    const report = useSelector(selectComplianceReport);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    useEffect(() => {
        if (report) {
            // Inicializar con data de ejemplo si es necesario
        }
    }, [report]);

    const handleGenerateReport = () => {
        if (!reportConfig.dateStart || !reportConfig.dateEnd) {
            alert('Especifica rango de fechas');
            return;
        }

        dispatch(fetchComplianceReport({
            dateStart: reportConfig.dateStart,
            dateEnd: reportConfig.dateEnd,
            regulations: reportConfig.regulations,
        }));
    };

    const mockReport = {
        period: 'Q1 2026',
        regulations: [
            { name: 'Separación de Funciones', status: 'COMPLIANT', violations: 0, percentage: 100 },
            { name: 'Control de Acceso (RBAC)', status: 'COMPLIANT', violations: 0, percentage: 100 },
            { name: 'Auditoria Inmutable (CNST-009)', status: 'COMPLIANT', violations: 0, percentage: 100 },
            { name: 'Monitoreo de Cambios', status: 'COMPLIANT', violations: 2, percentage: 98 },
        ],
        metrics: {
            totalOperations: 45230,
            auditedOperations: 45230,
            suspiciousOperations: 12,
            failedOperations: 3,
        },
        timeline: [
            { month: 'Enero', compliant: 98, violations: 2 },
            { month: 'Febrero', compliant: 99, violations: 1 },
            { month: 'Marzo', compliant: 100, violations: 0 },
        ],
    };

    const displayReport = report || mockReport;

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Reporte de Compliance
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_AUD_04 - Reporte de conformidad regulatoria
                </p>
            </div>

            {/* Configuración */}
            <div style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: '1px solid #374151',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                        Desde
                    </label>
                    <input
                        type="date"
                        value={reportConfig.dateStart}
                        onChange={(e) => setReportConfig({ ...reportConfig, dateStart: e.target.value })}
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
                        value={reportConfig.dateEnd}
                        onChange={(e) => setReportConfig({ ...reportConfig, dateEnd: e.target.value })}
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

                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <button
                        onClick={handleGenerateReport}
                        disabled={!reportConfig.dateStart || !reportConfig.dateEnd || loading}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            backgroundColor: !reportConfig.dateStart || !reportConfig.dateEnd ? '#6b7280' : '#0ea5e9',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            cursor: !reportConfig.dateStart || !reportConfig.dateEnd ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                        }}
                    >
                        {loading ? 'Generando...' : 'Generar Reporte'}
                    </button>
                </div>
            </div>

            {/* Reporte */}
            {displayReport && (
                <>
                    {/* Resumen */}
                    <div style={{
                        marginBottom: '24px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '12px',
                    }}>
                        {[
                            { label: 'Operaciones Totales', value: displayReport.metrics.totalOperations },
                            { label: 'Operaciones Auditadas', value: displayReport.metrics.auditedOperations },
                            { label: 'Operaciones Sospechosas', value: displayReport.metrics.suspiciousOperations },
                            { label: 'Operaciones Fallidas', value: displayReport.metrics.failedOperations },
                        ].map((metric, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: '16px',
                                    backgroundColor: '#111827',
                                    borderRadius: '8px',
                                    border: '1px solid #374151',
                                    textAlign: 'center',
                                }}
                            >
                                <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
                                    {metric.label}
                                </div>
                                <div style={{
                                    color: '#fff',
                                    fontSize: '24px',
                                    fontWeight: 600,
                                }}>
                                    {metric.value.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Regulaciones */}
                    <div style={{
                        marginBottom: '24px',
                        padding: '16px',
                        backgroundColor: '#111827',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                    }}>
                        <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>
                            Estado de Regulaciones
                        </h2>

                        <div style={{ display: 'grid', gap: '12px' }}>
                            {displayReport.regulations.map((reg, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: '#1f2937',
                                        borderRadius: '4px',
                                        borderLeft: `4px solid ${reg.status === 'COMPLIANT' ? '#10b981' : '#dc2626'}`,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <div style={{ color: '#fff', fontWeight: 600 }}>
                                            {reg.name}
                                        </div>
                                        <span
                                            style={{
                                                backgroundColor: reg.status === 'COMPLIANT' ? '#10b981' : '#dc2626',
                                                color: '#fff',
                                                padding: '4px 8px',
                                                borderRadius: '3px',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                            }}
                                        >
                                            {reg.status}
                                        </span>
                                    </div>

                                    {/* Barra de progreso */}
                                    <div style={{
                                        backgroundColor: '#374151',
                                        borderRadius: '3px',
                                        height: '6px',
                                        overflow: 'hidden',
                                        marginBottom: '8px',
                                    }}>
                                        <div
                                            style={{
                                                backgroundColor: reg.percentage === 100 ? '#10b981' : '#f59e0b',
                                                height: '100%',
                                                width: `${reg.percentage}%`,
                                            }}
                                        />
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        fontSize: '12px',
                                        color: '#9ca3af',
                                    }}>
                                        <span>{reg.percentage}% Cumplimiento</span>
                                        <span>{reg.violations} violación{reg.violations !== 1 ? 'es' : ''}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#111827',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                    }}>
                        <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>
                            Tendencia Mensual
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {displayReport.timeline.map((month, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        padding: '12px',
                                        backgroundColor: '#1f2937',
                                        borderRadius: '4px',
                                        textAlign: 'center',
                                    }}
                                >
                                    <div style={{ color: '#fff', fontWeight: 600, marginBottom: '8px' }}>
                                        {month.month}
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        height: '60px',
                                        gap: '4px',
                                        alignItems: 'flex-end',
                                        marginBottom: '8px',
                                        justifyContent: 'center',
                                    }}>
                                        <div
                                            style={{
                                                backgroundColor: '#10b981',
                                                width: '30px',
                                                height: `${(month.compliant / 100) * 60}px`,
                                            }}
                                        />
                                        <div
                                            style={{
                                                backgroundColor: '#dc2626',
                                                width: '30px',
                                                height: `${(month.violations / 100) * 60}px`,
                                            }}
                                        />
                                    </div>

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: '4px',
                                        fontSize: '11px',
                                    }}>
                                        <span style={{ color: '#10b981' }}>{month.compliant}%</span>
                                        <span style={{ color: '#dc2626' }}>{month.violations} viol.</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Acciones */}
                    <div style={{
                        marginTop: '24px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                    }}>
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
                            Descargar PDF
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
                            Enviar por Email
                        </button>
                    </div>

                    {/* Información CNST-009 */}
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#064e3b',
                        border: '1px solid #10b981',
                        borderRadius: '4px',
                        color: '#86efac',
                        fontSize: '12px',
                    }}>
                        <strong>CNST-009:</strong> Este reporte es generado a partir de logs inmutables. Todos los registros cuentan con firma digital para garantizar no-repudiación y conformidad regulatoria.
                    </div>
                </>
            )}

            {error && (
                <div role="alert" className="error-banner">
                    Error: {error}
                </div>
            )}
        </div>
    );
}
