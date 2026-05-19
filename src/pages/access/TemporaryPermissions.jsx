/**
 * TemporaryPermissionsPage.jsx
 * IACT v4.0 - Access Module
 * UC_ACC_08: Permisos excepcionales (ExceptionalPermission, not Assignment)
 * - POST /api/users/{id}/exceptional-permissions/
 * - justification ≥20 chars (spec req)
 * - expires_at mandatory + must be future (spec req)
 * - Anti-self P-11: cannot grant to self
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllFunctions,
    grantExceptionalPermission,
    fetchExceptionalPermissions,
    revokeExceptionalPermission,
    selectLoading,
    selectError,
    selectSuccess,
    selectExceptionalPermissions,
    clearSuccess,
} from '../../redux/slices/access';
import { selectUser } from '../../redux/selectors';

export default function TemporaryPermissions() {
    const [activeTab, setActiveTab] = useState('assign');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedFunction, setSelectedFunction] = useState('');
    const [justification, setJustification] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [expiryTime, setExpiryTime] = useState('23:59');
    const [users, setUsers] = useState([]);
    const [formError, setFormError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const success = useSelector(selectSuccess);
    const allFunctions = useSelector(state => state.access.functions);
    const exceptionalPermissions = useSelector(selectExceptionalPermissions);
    const currentUser = useSelector(selectUser);

    useEffect(() => {
        dispatch(fetchAllFunctions());
        loadUsers();
    }, [dispatch]);

    useEffect(() => {
        if (activeTab === 'view' && selectedUser) {
            dispatch(fetchExceptionalPermissions(parseInt(selectedUser)));
        }
    }, [activeTab, selectedUser, dispatch]);

    useEffect(() => {
        if (success) {
            setSuccessMsg('Permiso excepcional otorgado exitosamente');
            setSelectedFunction('');
            setJustification('');
            setExpiryDate('');
            setExpiryTime('23:59');
            setFormError('');
            setTimeout(() => {
                dispatch(clearSuccess());
                setSuccessMsg('');
            }, 3000);
        }
    }, [success, dispatch]);

    const loadUsers = async () => {
        try {
            setUsers([
                { id: 1, username: 'user1' },
                { id: 2, username: 'user2' },
                { id: 3, username: 'admin_test' },
            ]);
        } catch (err) {
            console.error('Error loading users:', err);
        }
    };

    const isSelf = currentUser && selectedUser && parseInt(selectedUser) === currentUser.id;

    const validateForm = () => {
        if (!selectedUser) return false;
        if (!selectedFunction) return false;
        if (!expiryDate) return false;
        if (justification.trim().length < 20) return false;
        const selectedDateTime = new Date(`${expiryDate}T${expiryTime}`);
        if (selectedDateTime <= new Date()) return false;
        if (isSelf) return false;
        return true;
    };

    const handleAssignTemporary = async (e) => {
        e.preventDefault();
        setFormError('');

        if (isSelf) {
            setFormError('No puedes otorgarte permisos a ti mismo (P-11)');
            return;
        }
        if (justification.trim().length < 20) {
            setFormError(`La justificación debe tener al menos 20 caracteres (actual: ${justification.trim().length})`);
            return;
        }
        if (!expiryDate) {
            setFormError('La fecha de expiración es obligatoria');
            return;
        }
        const selectedDateTime = new Date(`${expiryDate}T${expiryTime}`);
        if (selectedDateTime <= new Date()) {
            setFormError('La fecha/hora de expiración debe ser en el futuro');
            return;
        }

        await dispatch(grantExceptionalPermission({
            userId: parseInt(selectedUser),
            payload: {
                function_codename: selectedFunction,
                justification: justification.trim(),
                expires_at: `${expiryDate}T${expiryTime}`,
            },
        }));
    };

    const handleRevoke = (userId, permissionId) => {
        dispatch(revokeExceptionalPermission({ userId: parseInt(userId), permissionId }));
    };

    const handleUserChange = (userId) => {
        setSelectedUser(userId);
        setFormError('');
        if (userId && activeTab === 'view') {
            dispatch(fetchExceptionalPermissions(parseInt(userId)));
        }
    };

    const calculateTimeRemaining = (expiresAt) => {
        const diffMs = new Date(expiresAt) - new Date();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return { days, hours };
    };

    const getUrgencyColor = (expiresAt) => {
        const hours = (new Date(expiresAt) - new Date()) / (1000 * 60 * 60);
        if (hours < 24) return '#dc2626';
        if (hours < 72) return '#f59e0b';
        return '#10b981';
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Permisos Excepcionales
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ACC_08 - Otorgar permisos temporales excepcionales con justificación
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1px solid #374151' }}>
                {[
                    { key: 'assign', label: 'Otorgar permiso' },
                    { key: 'view', label: 'Ver activos' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            borderBottom: activeTab === tab.key ? '2px solid #0ea5e9' : '2px solid transparent',
                            backgroundColor: 'transparent',
                            color: activeTab === tab.key ? '#0ea5e9' : '#9ca3af',
                            fontWeight: activeTab === tab.key ? 600 : 400,
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}
                    >
                        {tab.label}
                        {tab.key === 'view' && exceptionalPermissions.length > 0 && (
                            <span style={{
                                marginLeft: '8px',
                                backgroundColor: '#374151',
                                color: '#fff',
                                borderRadius: '10px',
                                padding: '1px 7px',
                                fontSize: '12px',
                            }}>
                                {exceptionalPermissions.length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Shared messages */}
            {successMsg && (
                <div style={{
                    marginBottom: '16px', padding: '12px', backgroundColor: '#064e3b',
                    border: '1px solid #10b981', borderRadius: '4px', color: '#86efac', fontSize: '14px',
                }}>
                    {successMsg}
                </div>
            )}
            {error && (
                <div role="alert" className="error-banner">
                    Error: {error}
                </div>
            )}

            {/* Tab: Otorgar permiso */}
            {activeTab === 'assign' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div style={{
                        padding: '20px', backgroundColor: '#111827',
                        borderRadius: '8px', border: '1px solid #374151', height: 'fit-content',
                    }}>
                        <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Otorgar Permiso Excepcional</h2>

                        {/* Usuario */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                                Usuario <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <select
                                value={selectedUser}
                                onChange={(e) => handleUserChange(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 12px', border: '1px solid #374151',
                                    borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', fontSize: '14px',
                                }}
                            >
                                <option value="">Selecciona usuario...</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.username}
                                    </option>
                                ))}
                            </select>
                            {isSelf && (
                                <small style={{ color: '#dc2626', display: 'block', marginTop: '4px' }}>
                                    No puedes otorgarte permisos a ti mismo (P-11)
                                </small>
                            )}
                        </div>

                        {/* Función */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                                Función <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <select
                                value={selectedFunction}
                                onChange={(e) => setSelectedFunction(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 12px', border: '1px solid #374151',
                                    borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', fontSize: '14px',
                                }}
                            >
                                <option value="">Selecciona función...</option>
                                {allFunctions.map(func => (
                                    <option key={func.id} value={func.code}>
                                        {func.code} - {func.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Justificación — obligatorio ≥20 chars (spec P-10) */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                                Justificación <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <textarea
                                value={justification}
                                onChange={(e) => setJustification(e.target.value)}
                                placeholder="Describe la razón del permiso excepcional (mínimo 20 caracteres)"
                                minLength={20}
                                rows={3}
                                style={{
                                    width: '100%', padding: '8px 12px', border: '1px solid #374151',
                                    borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff',
                                    fontSize: '14px', resize: 'vertical', boxSizing: 'border-box',
                                }}
                            />
                            {justification.length > 0 && justification.trim().length < 20 && (
                                <small style={{ color: '#f59e0b', display: 'block', marginTop: '4px' }}>
                                    Faltan {20 - justification.trim().length} caracteres mínimos.
                                </small>
                            )}
                        </div>

                        {/* Fecha de expiración */}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                                Fecha de Expiración <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 12px', border: '1px solid #374151',
                                    borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', fontSize: '14px',
                                }}
                            />
                        </div>

                        {/* Hora de expiración */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                                Hora de Expiración
                            </label>
                            <input
                                type="time"
                                value={expiryTime}
                                onChange={(e) => setExpiryTime(e.target.value)}
                                style={{
                                    width: '100%', padding: '8px 12px', border: '1px solid #374151',
                                    borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', fontSize: '14px',
                                }}
                            />
                        </div>

                        {formError && (
                            <div role="alert" className="error-banner">
                                {formError}
                            </div>
                        )}

                        <button
                            onClick={handleAssignTemporary}
                            disabled={!validateForm() || loading}
                            style={{
                                width: '100%', padding: '10px',
                                backgroundColor: validateForm() ? '#0ea5e9' : '#6b7280',
                                border: 'none', borderRadius: '4px', color: '#fff',
                                fontWeight: 600, cursor: validateForm() && !loading ? 'pointer' : 'not-allowed',
                                fontSize: '14px',
                            }}
                        >
                            {loading ? 'Otorgando...' : 'Otorgar Permiso Excepcional'}
                        </button>
                    </div>

                    {/* Panel de información */}
                    <div style={{
                        padding: '20px', backgroundColor: '#111827',
                        borderRadius: '8px', border: '1px solid #374151', height: 'fit-content',
                    }}>
                        <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Requisitos</h2>
                        <div style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.6' }}>
                            <p style={{ margin: '0 0 12px 0' }}>
                                <strong style={{ color: '#fff' }}>Entidad:</strong> ExceptionalPermission (no Assignment regular)
                            </p>
                            <ul style={{ margin: '0', paddingLeft: '20px' }}>
                                <li>Justificación obligatoria ≥20 caracteres</li>
                                <li>Fecha de expiración obligatoria (debe ser futura)</li>
                                <li>No se puede otorgar a uno mismo (P-11)</li>
                                <li>Se registra en auditoría (CNST-009)</li>
                                <li>Expira automáticamente en la fecha indicada</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab: Ver activos */}
            {activeTab === 'view' && (
                <div>
                    {/* User selector for view tab */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                            Usuario
                        </label>
                        <select
                            value={selectedUser}
                            onChange={(e) => handleUserChange(e.target.value)}
                            style={{
                                width: '300px', padding: '8px 12px', border: '1px solid #374151',
                                borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', fontSize: '14px',
                            }}
                        >
                            <option value="">Selecciona usuario...</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{
                        backgroundColor: '#111827', borderRadius: '8px',
                        border: '1px solid #374151', overflow: 'hidden',
                    }}>
                        <div style={{ padding: '16px', backgroundColor: '#0f172a', borderBottom: '1px solid #374151' }}>
                            <h2 style={{ margin: 0, color: '#fff' }}>
                                Permisos Excepcionales Activos
                                {exceptionalPermissions.length > 0 && (
                                    <span style={{ fontSize: '14px', color: '#9ca3af', marginLeft: '8px' }}>
                                        ({exceptionalPermissions.length})
                                    </span>
                                )}
                            </h2>
                        </div>

                        {!selectedUser ? (
                            <div style={{ padding: '24px', color: '#9ca3af', textAlign: 'center' }}>
                                Selecciona un usuario para ver sus permisos excepcionales activos.
                            </div>
                        ) : loading ? (
                            <div style={{ padding: '24px', color: '#9ca3af', textAlign: 'center' }}>
                                Cargando...
                            </div>
                        ) : exceptionalPermissions.length === 0 ? (
                            <div style={{ padding: '24px', color: '#9ca3af', textAlign: 'center' }}>
                                Este usuario no tiene permisos excepcionales activos.
                            </div>
                        ) : (
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {exceptionalPermissions.map(perm => {
                                    const timeLeft = calculateTimeRemaining(perm.expires_at);
                                    return (
                                        <div
                                            key={perm.id}
                                            style={{
                                                padding: '12px 16px', borderBottom: '1px solid #374151',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>
                                                    {perm.function_codename}
                                                </div>
                                                <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                                                    Justificación: {perm.justification}
                                                </div>
                                                <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                                                    Exp: {perm.expires_at}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                                <div style={{
                                                    backgroundColor: getUrgencyColor(perm.expires_at),
                                                    color: '#fff', padding: '4px 8px',
                                                    borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                                                }}>
                                                    {timeLeft.days}d {timeLeft.hours}h
                                                </div>
                                                <button
                                                    onClick={() => handleRevoke(selectedUser, perm.id)}
                                                    disabled={loading}
                                                    style={{
                                                        padding: '4px 10px', border: 'none', borderRadius: '4px',
                                                        backgroundColor: '#dc2626', color: '#fff',
                                                        fontSize: '12px', cursor: loading ? 'not-allowed' : 'pointer',
                                                    }}
                                                >
                                                    Revocar
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
