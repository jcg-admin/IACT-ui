/**
 * PermissionsTable.jsx
 * IACT v4.0 - Access Module
 * Tabla reutilizable para mostrar permisos
 */

import React from 'react';

export default function PermissionsTable({
    permissions = [],
    onRevoke,
    loading = false,
    showStats = true,
}) {
    const getCategoryColor = (category) => {
        const colors = {
            PIPELINE: '#8b5cf6',
            USUARIO: '#0ea5e9',
            AUDITORIA: '#f59e0b',
            ACCESO: '#10b981',
            CONFIGURACION: '#ec4899',
            DASHBOARD: '#6366f1',
        };
        return colors[category] || '#6b7280';
    };

    const isTemporary = (permission) => !!permission.expires_at;
    const isExpired = (permission) => permission.expires_at && new Date(permission.expires_at) < new Date();
    const getDaysUntilExpiry = (permission) => {
        if (!permission.expires_at) return null;
        const now = new Date();
        const expiry = new Date(permission.expires_at);
        const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        return days;
    };

    const stats = {
        total: permissions.length,
        permanent: permissions.filter(p => !isTemporary(p)).length,
        temporary: permissions.filter(p => isTemporary(p) && !isExpired(p)).length,
        expired: permissions.filter(p => isExpired(p)).length,
    };

    return (
        <div>
            {/* Estadísticas */}
            {showStats && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '12px',
                    marginBottom: '16px',
                }}>
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#111827',
                        borderRadius: '4px',
                        border: '1px solid #374151',
                    }}>
                        <div style={{ color: '#9ca3af', fontSize: '12px' }}>Total</div>
                        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 600 }}>{stats.total}</div>
                    </div>

                    <div style={{
                        padding: '12px',
                        backgroundColor: '#111827',
                        borderRadius: '4px',
                        border: '1px solid #374151',
                    }}>
                        <div style={{ color: '#9ca3af', fontSize: '12px' }}>Permanentes</div>
                        <div style={{ color: '#10b981', fontSize: '20px', fontWeight: 600 }}>{stats.permanent}</div>
                    </div>

                    <div style={{
                        padding: '12px',
                        backgroundColor: '#111827',
                        borderRadius: '4px',
                        border: '1px solid #374151',
                    }}>
                        <div style={{ color: '#9ca3af', fontSize: '12px' }}>Temporales</div>
                        <div style={{ color: '#f59e0b', fontSize: '20px', fontWeight: 600 }}>{stats.temporary}</div>
                    </div>

                    <div style={{
                        padding: '12px',
                        backgroundColor: '#111827',
                        borderRadius: '4px',
                        border: '1px solid #374151',
                    }}>
                        <div style={{ color: '#9ca3af', fontSize: '12px' }}>Expirados</div>
                        <div style={{ color: '#dc2626', fontSize: '20px', fontWeight: 600 }}>{stats.expired}</div>
                    </div>
                </div>
            )}

            {/* Tabla */}
            <div style={{
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: '1px solid #374151',
                overflow: 'hidden',
            }}>
                {/* Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '100px 200px 1fr 120px 150px 100px',
                    gap: '12px',
                    padding: '14px',
                    backgroundColor: '#0f172a',
                    borderBottom: '1px solid #374151',
                    fontWeight: 600,
                    color: '#fff',
                    fontSize: '12px',
                }}>
                    <div>Código</div>
                    <div>Nombre</div>
                    <div>Descripción</div>
                    <div>Tipo</div>
                    <div>Asignado</div>
                    <div>Acción</div>
                </div>

                {/* Rows */}
                {permissions.length > 0 ? (
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {permissions.map((perm, idx) => {
                            const daysUntilExpiry = getDaysUntilExpiry(perm);
                            const isExp = isExpired(perm);
                            const isTemp = isTemporary(perm);

                            return (
                                <div
                                    key={idx}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '100px 200px 1fr 120px 150px 100px',
                                        gap: '12px',
                                        padding: '12px 14px',
                                        borderBottom: '1px solid #374151',
                                        alignItems: 'center',
                                        backgroundColor: isExp ? '#7f1d1d' : '#1f2937',
                                    }}
                                >
                                    {/* Código */}
                                    <span
                                        style={{
                                            backgroundColor: getCategoryColor(perm.category),
                                            color: '#fff',
                                            padding: '4px 6px',
                                            borderRadius: '3px',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            textAlign: 'center',
                                        }}
                                    >
                                        {perm.code}
                                    </span>

                                    {/* Nombre */}
                                    <div style={{ color: '#fff', fontSize: '12px' }}>
                                        {perm.name}
                                    </div>

                                    {/* Descripción */}
                                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>
                                        {perm.description}
                                    </div>

                                    {/* Tipo */}
                                    <div style={{ fontSize: '11px' }}>
                                        {isExp ? (
                                            <span style={{ color: '#dc2626', fontWeight: 600 }}>EXPIRADO</span>
                                        ) : isTemp ? (
                                            <span style={{ color: '#f59e0b', fontWeight: 600 }}>TEMPORAL</span>
                                        ) : (
                                            <span style={{ color: '#10b981', fontWeight: 600 }}>PERMANENTE</span>
                                        )}
                                    </div>

                                    {/* Asignado */}
                                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                        <div>{new Date(perm.assigned_at).toLocaleDateString()}</div>
                                        {isTemp && (
                                            <div style={{
                                                marginTop: '2px',
                                                color: daysUntilExpiry < 7 ? '#dc2626' : '#f59e0b',
                                            }}>
                                                {isExp ? 'Exp' : `${daysUntilExpiry}d`}
                                            </div>
                                        )}
                                    </div>

                                    {/* Acción */}
                                    <button
                                        onClick={() => onRevoke && onRevoke(perm.assignment_id)}
                                        disabled={loading || isExp}
                                        style={{
                                            padding: '6px 10px',
                                            backgroundColor: isExp ? '#6b7280' : '#374151',
                                            border: 'none',
                                            borderRadius: '4px',
                                            color: '#fff',
                                            cursor: isExp || loading ? 'not-allowed' : 'pointer',
                                            fontSize: '11px',
                                            opacity: isExp ? 0.5 : 1,
                                        }}
                                    >
                                        Revocar
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontSize: '14px',
                    }}>
                        No hay permisos para mostrar
                    </div>
                )}
            </div>
        </div>
    );
}
