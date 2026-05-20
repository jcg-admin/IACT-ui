import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAccessAudit, selectLoading, selectError } from '../../redux/slices/access'
import Table from '@ui/presentational/Table'

const PERMISSION_ACTIONS = [
    'EXCEPTIONAL_PERMISSION_GRANTED',
    'EXCEPTIONAL_PERMISSION_REVOKED',
    'AGR_ASSIGNED',
    'AGR_REVOKED',
]

export default function PermissionsAudit() {
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

    const COLUMNS = [
        { key: 'action', label: 'Acción' },
        { key: 'user', label: 'Usuario' },
        { key: 'target', label: 'Objetivo', render: (v) => v ?? '—' },
        {
            key: 'timestamp',
            label: 'Fecha',
            render: (v) => new Date(v).toLocaleString('es'),
        },
    ]

    return (
        <div style={{ padding: '24px' }}>
            <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                Auditoría de Permisos
            </h1>
            <p style={{ color: '#9ca3af', margin: '0 0 24px 0', fontSize: '14px' }}>
                UC_PERM_10 — Historial de cambios de permisos y grupos
            </p>

            {error && (
                <div role="alert" className="error-banner">
                    Error: {error}
                </div>
            )}

            <Table
                columns={COLUMNS}
                data={permissionsLog}
                loading={loading}
                sortable={false}
            />
        </div>
    )
}
