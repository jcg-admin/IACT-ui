/**
 * TemporaryPermissionsPage.jsx
 * IACT v4.0 - Access Module
 * UC_ACC_08: Gestionar permisos temporales con fecha de expiración
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllFunctions, assignFunction, selectLoading, selectError, selectSuccess } from '../../redux/slices/accessSlice';

export default function TemporaryPermissionsPage() {
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedFunction, setSelectedFunction] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [expiryTime, setExpiryTime] = useState('23:59');
    const [users, setUsers] = useState([]);
    const [temporaryPermissions, setTemporaryPermissions] = useState([]);

    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const success = useSelector(selectSuccess);
    const allFunctions = useSelector(state => state.access.functions);

    useEffect(() => {
        dispatch(fetchAllFunctions());
        loadUsers();
        loadTemporaryPermissions();
    }, [dispatch]);

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

    const loadTemporaryPermissions = async () => {
        try {
            // Esto debería venir de un endpoint
            setTemporaryPermissions([
                {
                    id: 1,
                    user: 'user1',
                    function: 'PIP-005',
                    functionName: 'Ejecutar pipeline',
                    expiresAt: '2026-05-10 23:59',
                    assignedAt: '2026-04-27 10:00',
                    hoursRemaining: 336,
                },
                {
                    id: 2,
                    user: 'user2',
                    function: 'USR-005',
                    functionName: 'Resetear contraseña',
                    expiresAt: '2026-04-30 18:00',
                    assignedAt: '2026-04-27 14:00',
                    hoursRemaining: 76,
                },
            ]);
        } catch (error) {
            console.error('Error loading temporary permissions:', error);
        }
    };

    const validateForm = () => {
        if (!selectedUser || !selectedFunction || !expiryDate) {
            return false;
        }
        const selectedDate = new Date(`${expiryDate}T${expiryTime}`);
        return selectedDate > new Date();
    };

    const handleAssignTemporary = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            alert('Por favor completa todos los campos y selecciona una fecha futura');
            return;
        }

        const expiryDateTime = `${expiryDate}T${expiryTime}`;
        await dispatch(assignFunction({
            userId: parseInt(selectedUser),
            functionId: parseInt(selectedFunction),
            expiresAt: expiryDateTime,
        }));

        if (success) {
            setSelectedFunction('');
            setExpiryDate('');
            setExpiryTime('23:59');
            loadTemporaryPermissions();
        }
    };

    const calculateTimeRemaining = (expiryDate) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffMs = expiry - now;
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return { days, hours };
    };

    const getUrgencyColor = (hoursRemaining) => {
        if (hoursRemaining < 24) return '#dc2626';
        if (hoursRemaining < 72) return '#f59e0b';
        return '#10b981';
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Permisos Temporales
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ACC_08 - Asignar funciones con fecha de expiración
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Formulario */}
                <div style={{
                    padding: '20px',
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                    height: 'fit-content',
                }}>
                    <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Asignar Permiso Temporal</h2>

                    {/* Usuario */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                            Usuario
                        </label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                backgroundColor: '#1f2937',
                                color: '#fff',
                                fontSize: '14px',
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

                    {/* Función */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                            Función
                        </label>
                        <select
                            value={selectedFunction}
                            onChange={(e) => setSelectedFunction(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                backgroundColor: '#1f2937',
                                color: '#fff',
                                fontSize: '14px',
                            }}
                        >
                            <option value="">Selecciona función...</option>
                            {allFunctions.map(func => (
                                <option key={func.id} value={func.id}>
                                    {func.code} - {func.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha de expiración */}
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                            Fecha de Expiración
                        </label>
                        <input
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                backgroundColor: '#1f2937',
                                color: '#fff',
                                fontSize: '14px',
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
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                backgroundColor: '#1f2937',
                                color: '#fff',
                                fontSize: '14px',
                            }}
                        />
                    </div>

                    {/* Info */}
                    <div style={{
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: '#1f2937',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#9ca3af',
                    }}>
                        <strong style={{ color: '#fff' }}>Importante:</strong>
                        <ul style={{ margin: '8px 0 0 16px', paddingLeft: '16px' }}>
                            <li>El permiso expirará automáticamente en la fecha/hora especificada</li>
                            <li>Los permisos expirados se revocан automáticamente</li>
                            <li>Se registrará en auditoria (CNST-009)</li>
                        </ul>
                    </div>

                    {/* Botón */}
                    <button
                        onClick={handleAssignTemporary}
                        disabled={!validateForm() || loading}
                        style={{
                            width: '100%',
                            padding: '10px',
                            backgroundColor: validateForm() ? '#0ea5e9' : '#6b7280',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            fontWeight: 600,
                            cursor: validateForm() ? 'pointer' : 'not-allowed',
                            fontSize: '14px',
                        }}
                    >
                        {loading ? 'Asignando...' : 'Asignar Permiso Temporal'}
                    </button>

                    {error && (
                        <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            backgroundColor: '#7f1d1d',
                            border: '1px solid #dc2626',
                            borderRadius: '4px',
                            color: '#fca5a5',
                            fontSize: '12px',
                        }}>
                            {error}
                        </div>
                    )}
                </div>

                {/* Lista de temporales activos */}
                <div style={{
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#0f172a',
                        borderBottom: '1px solid #374151',
                    }}>
                        <h2 style={{ margin: 0, color: '#fff' }}>
                            Permisos Temporales Activos
                            <span style={{ fontSize: '14px', color: '#9ca3af', marginLeft: '8px' }}>
                                ({temporaryPermissions.length})
                            </span>
                        </h2>
                    </div>

                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {temporaryPermissions.length > 0 ? (
                            temporaryPermissions.map(perm => {
                                const timeRemaining = calculateTimeRemaining(perm.expiresAt);
                                const urgencyColor = getUrgencyColor(timeRemaining.hours);

                                return (
                                    <div
                                        key={perm.id}
                                        style={{
                                            padding: '12px',
                                            borderBottom: '1px solid #374151',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px' }}>
                                                {perm.user}
                                            </div>
                                            <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                                                {perm.function} - {perm.functionName}
                                            </div>
                                            <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                                                Exp: {perm.expiresAt}
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'flex-end',
                                            gap: '8px',
                                        }}>
                                            <div style={{
                                                backgroundColor: urgencyColor,
                                                color: '#fff',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 600,
                                            }}>
                                                {timeRemaining.days}d {timeRemaining.hours}h
                                            </div>
                                            <button
                                                style={{
                                                    padding: '4px 8px',
                                                    backgroundColor: '#374151',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    color: '#fff',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                }}
                                            >
                                                Revocar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{
                                padding: '24px',
                                textAlign: 'center',
                                color: '#9ca3af',
                            }}>
                                No hay permisos temporales activos
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
