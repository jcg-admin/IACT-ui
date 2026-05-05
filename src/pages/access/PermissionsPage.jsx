/**
 * PermissionsPage.jsx
 * IACT v4.0 - Access Module
 * UC_ACC_03: Consultar y gestionar permisos de usuarios
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserPermissions, revokeFunction, selectLoading, selectError } from '../../redux/slices/accessSlice';

export default function PermissionsPage() {
    const [selectedUser, setSelectedUser] = useState('');
    const [users, setUsers] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [revokeConfirm, setRevokeConfirm] = useState(null);

    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const userPermissions = useSelector(state => state.access.userPermissions);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (selectedUser) {
            dispatch(fetchUserPermissions(parseInt(selectedUser)));
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

    const handleRevoke = async (catalogId) => {
        if (revokeConfirm === catalogId) {
            await dispatch(revokeFunction({
                userId: parseInt(selectedUser),
                catalogId,
            }));
            setRevokeConfirm(null);
        } else {
            setRevokeConfirm(catalogId);
        }
    };

    const getPermissions = () => {
        if (!userPermissions.functions) return [];
        if (!categoryFilter) return userPermissions.functions;
        return userPermissions.functions.filter(f => f.category === categoryFilter);
    };

    const permissions = getPermissions();

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

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Permisos de Usuario
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ACC_03 - Ver y gestionar funciones asignadas
                </p>
            </div>

            {/* Selector de usuario */}
            <div style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: '1px solid #374151',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
            }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                        Seleccionar Usuario
                    </label>
                    <select
                        value={selectedUser}
                        onChange={(e) => {
                            setSelectedUser(e.target.value);
                            setCategoryFilter('');
                        }}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #374151',
                            borderRadius: '4px',
                            backgroundColor: '#1f2937',
                            color: '#fff',
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="">Selecciona un usuario...</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.username}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                        Filtrar por Categoría
                    </label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        disabled={!selectedUser}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #374151',
                            borderRadius: '4px',
                            backgroundColor: '#1f2937',
                            color: '#fff',
                            fontSize: '14px',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="">Todas las categorías</option>
                        <option value="PIPELINE">Pipeline</option>
                        <option value="USUARIO">Usuarios</option>
                        <option value="AUDITORIA">Auditoria</option>
                        <option value="ACCESO">Control de Acceso</option>
                        <option value="CONFIGURACION">Configuración</option>
                        <option value="DASHBOARD">Dashboard</option>
                    </select>
                </div>
            </div>

            {/* Tabla de permisos */}
            {selectedUser ? (
                <div style={{
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                    overflow: 'hidden',
                }}>
                    {/* Header de tabla */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '150px 250px 1fr 150px 150px',
                        gap: '16px',
                        padding: '16px',
                        backgroundColor: '#0f172a',
                        borderBottom: '1px solid #374151',
                        fontWeight: 600,
                        color: '#fff',
                        fontSize: '14px',
                    }}>
                        <div>Código</div>
                        <div>Nombre</div>
                        <div>Descripción</div>
                        <div>Asignado</div>
                        <div>Acción</div>
                    </div>

                    {/* Filas */}
                    {loading ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                            Cargando permisos...
                        </div>
                    ) : permissions.length > 0 ? (
                        permissions.map(perm => (
                            <div
                                key={perm.assignment_id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '150px 250px 1fr 150px 150px',
                                    gap: '16px',
                                    padding: '16px',
                                    borderBottom: '1px solid #374151',
                                    alignItems: 'center',
                                    backgroundColor: isExpired(perm) ? '#7f1d1d' : '#1f2937',
                                }}
                            >
                                {/* Código */}
                                <div style={{ color: '#fff' }}>
                                    <span
                                        style={{
                                            backgroundColor: getCategoryColor(perm.category),
                                            color: '#fff',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {perm.code}
                                    </span>
                                </div>

                                {/* Nombre */}
                                <div style={{ color: '#fff' }}>{perm.name}</div>

                                {/* Descripción */}
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                    {perm.description}
                                </div>

                                {/* Asignado */}
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                    <div>{new Date(perm.assigned_at).toLocaleDateString()}</div>
                                    {isTemporary(perm) && (
                                        <div style={{ color: '#f59e0b', marginTop: '4px' }}>
                                            Exp: {new Date(perm.expires_at).toLocaleDateString()}
                                        </div>
                                    )}
                                    {isExpired(perm) && (
                                        <div style={{ color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                                            EXPIRADO
                                        </div>
                                    )}
                                </div>

                                {/* Acción */}
                                <button
                                    onClick={() => handleRevoke(perm.assignment_id)}
                                    style={{
                                        padding: '6px 12px',
                                        backgroundColor: revokeConfirm === perm.assignment_id ? '#dc2626' : '#374151',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                    }}
                                >
                                    {revokeConfirm === perm.assignment_id ? 'Confirmar' : 'Revocar'}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af' }}>
                            {categoryFilter ? 'No hay permisos en esta categoría' : 'El usuario no tiene permisos asignados'}
                        </div>
                    )}
                </div>
            ) : (
                <div style={{
                    padding: '24px',
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                    color: '#9ca3af',
                    textAlign: 'center',
                }}>
                    Selecciona un usuario para ver sus permisos
                </div>
            )}

            {/* Estadísticas */}
            {selectedUser && (
                <div style={{
                    marginTop: '24px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                }}>
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#111827',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                    }}>
                        <div style={{ color: '#9ca3af', fontSize: '12px' }}>Total Permisos</div>
                        <div style={{ color: '#fff', fontSize: '24px', fontWeight: 600, marginTop: '4px' }}>
                            {permissions.length}
                        </div>
                    </div>

                    <div style={{
                        padding: '16px',
                        backgroundColor: '#111827',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                    }}>
                        <div style={{ color: '#9ca3af', fontSize: '12px' }}>Temporales</div>
                        <div style={{ color: '#f59e0b', fontSize: '24px', fontWeight: 600, marginTop: '4px' }}>
                            {permissions.filter(p => isTemporary(p) && !isExpired(p)).length}
                        </div>
                    </div>

                    <div style={{
                        padding: '16px',
                        backgroundColor: '#111827',
                        borderRadius: '8px',
                        border: '1px solid #374151',
                    }}>
                        <div style={{ color: '#9ca3af', fontSize: '12px' }}>Expirados</div>
                        <div style={{ color: '#dc2626', fontSize: '24px', fontWeight: 600, marginTop: '4px' }}>
                            {permissions.filter(p => isExpired(p)).length}
                        </div>
                    </div>
                </div>
            )}

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
