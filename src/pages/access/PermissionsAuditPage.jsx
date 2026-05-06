import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAccessAudit, selectLoading, selectError } from '../../redux/slices/accessSlice'

const PERMISSION_ACTIONS = ['ASSIGN_PERMISSION', 'REVOKE_PERMISSION', 'ASSIGN_GROUP', 'REVOKE_GROUP']

export default function PermissionsAuditPage() {
    const dispatch = useDispatch()
    const loading = useSelector(selectLoading)
    const error = useSelector(selectError)
    const allLog = useSelector((state) => state.access.auditLog)

    useEffect(() => {
        dispatch(fetchAccessAudit())
    }, [dispatch])

    const permissionsLog = (allLog || []).filter((entry) =>
        PERMISSION_ACTIONS.includes(entry.action)
    )

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                Auditoría de Permisos
            </h1>
            <p style={{ color: '#9ca3af', margin: '0 0 24px 0', fontSize: '14px' }}>
                UC-PERM-10 — Historial de cambios de permisos y grupos
            </p>

            {error && (
                <div role="alert" style={{ padding: '12px', backgroundColor: '#7f1d1d', border: '1px solid #dc2626', borderRadius: '4px', color: '#fca5a5', marginBottom: '16px' }}>
                    Error: {error}
                </div>
            )}

            {loading ? (
                <div aria-busy="true">Cargando auditoría…</div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            {['Acción', 'Usuario', 'Objetivo', 'Fecha'].map((h) => (
                                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#9ca3af', fontSize: '12px', borderBottom: '1px solid #374151' }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {permissionsLog.length === 0 ? (
                            <tr>
                                <td colSpan={4} style={{ padding: '16px', color: '#9ca3af', textAlign: 'center' }}>
                                    Sin entradas de auditoría de permisos
                                </td>
                            </tr>
                        ) : (
                            permissionsLog.map((entry) => (
                                <tr key={entry.id} style={{ borderBottom: '1px solid #1f2937' }}>
                                    <td style={{ padding: '8px 12px', color: '#e5e7eb', fontSize: '13px' }}>{entry.action}</td>
                                    <td style={{ padding: '8px 12px', color: '#e5e7eb', fontSize: '13px' }}>{entry.user}</td>
                                    <td style={{ padding: '8px 12px', color: '#e5e7eb', fontSize: '13px' }}>{entry.target ?? '—'}</td>
                                    <td style={{ padding: '8px 12px', color: '#9ca3af', fontSize: '12px' }}>
                                        {new Date(entry.timestamp).toLocaleString('es')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    )
}
