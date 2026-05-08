/**
 * AssignFunctionsPage.jsx
 * IACT v4.0 - Access Module
 * UC_ACC_01: Asignar funciones a usuarios
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllFunctions, assignFunction, revokeFunction,
    fetchUserAssignedFunctions,
    validateSeparationRules, selectLoading, selectError, selectSuccess,
    selectUserAssignedFunctions, clearSuccess,
} from '../../redux/slices/access';
import FunctionSelector from '../../components/access/FunctionSelector';

export default function AssignFunctions() {
    const [activeTab, setActiveTab] = useState('asignar');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedFunctions, setSelectedFunctions] = useState([]);
    const [hasConflicts, setHasConflicts] = useState(false);
    const [expiryDate, setExpiryDate] = useState('');
    const [users, setUsers] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const success = useSelector(selectSuccess);
    const allFunctions = useSelector(state => state.access.functions);
    const userAssignedFunctions = useSelector(selectUserAssignedFunctions);

    useEffect(() => {
        // Cargar funciones disponibles
        dispatch(fetchAllFunctions());
        // Cargar usuarios (esto debería venir de un endpoint)
        loadUsers();
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            setSuccessMessage('Funciones asignadas exitosamente');
            setSelectedFunctions([]);
            setSelectedUser('');
            setTimeout(() => {
                dispatch(clearSuccess());
                setSuccessMessage('');
            }, 3000);
        }
    }, [success, dispatch]);

    const loadUsers = async () => {
        try {
            // Aquí se cargarían usuarios reales del backend
            setUsers([
                { id: 1, username: 'user1' },
                { id: 2, username: 'user2' },
                { id: 3, username: 'admin_test' },
            ]);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const handleFunctionSelection = (newSelection, conflicts) => {
        setSelectedFunctions(newSelection);
        setHasConflicts(conflicts);
    };

    const handleConflictDetected = (conflicts) => {
        setHasConflicts(conflicts.length > 0);
    };

    const handleUserChange = (userId) => {
        setSelectedUser(userId);
        if (userId && activeTab === 'revocar') {
            dispatch(fetchUserAssignedFunctions(parseInt(userId)));
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'revocar' && selectedUser) {
            dispatch(fetchUserAssignedFunctions(parseInt(selectedUser)));
        }
    };

    const handleAssign = async (e) => {
        e.preventDefault();

        if (!selectedUser || selectedFunctions.length === 0) {
            return;
        }

        if (hasConflicts) {
            alert('No se pueden asignar funciones con conflictos de separación de funciones');
            return;
        }

        for (const catalogId of selectedFunctions) {
            await dispatch(assignFunction({
                userId: parseInt(selectedUser),
                catalogId,
                expiresAt: expiryDate || null,
            }));
        }
    };

    const handleRevoke = async (catalogId) => {
        if (!selectedUser) return;
        await dispatch(revokeFunction({ userId: parseInt(selectedUser), catalogId }));
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Asignar / Revocar Funciones
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ACC_01/02 - Gestión de funciones de usuarios
                </p>
            </div>

            {/* Tabs */}
            <div role="tablist" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button
                    role="tab"
                    aria-selected={activeTab === 'asignar'}
                    onClick={() => handleTabChange('asignar')}
                    style={{
                        padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                        backgroundColor: activeTab === 'asignar' ? '#0ea5e9' : '#374151',
                        color: '#fff', fontWeight: activeTab === 'asignar' ? 600 : 400,
                    }}
                >
                    Asignar
                </button>
                <button
                    role="tab"
                    aria-selected={activeTab === 'revocar'}
                    onClick={() => handleTabChange('revocar')}
                    style={{
                        padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer',
                        backgroundColor: activeTab === 'revocar' ? '#0ea5e9' : '#374151',
                        color: '#fff', fontWeight: activeTab === 'revocar' ? 600 : 400,
                    }}
                >
                    Revocar
                </button>
            </div>

            {/* Mensajes */}
            {successMessage && (
                <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    backgroundColor: '#064e3b',
                    border: '1px solid #10b981',
                    borderRadius: '4px',
                    color: '#86efac',
                    fontSize: '14px',
                }}>
                    {successMessage}
                </div>
            )}

            {error && (
                <div style={{
                    marginBottom: '16px',
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

            {/* User selector — shared between tabs */}
            <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                    Usuario
                </label>
                <select
                    value={selectedUser}
                    onChange={(e) => handleUserChange(e.target.value)}
                    disabled={loading}
                    style={{
                        width: '300px',
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

            {/* Revocar tab panel */}
            {activeTab === 'revocar' && (
                <div style={{ padding: '16px', backgroundColor: '#111827', borderRadius: '8px', border: '1px solid #374151' }}>
                    <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Funciones Asignadas</h2>
                    {!selectedUser ? (
                        <p style={{ color: '#9ca3af' }}>Selecciona un usuario para ver sus funciones asignadas.</p>
                    ) : userAssignedFunctions.length === 0 ? (
                        <p style={{ color: '#9ca3af' }}>Este usuario no tiene funciones asignadas.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                            {userAssignedFunctions.map((fn) => (
                                <li key={fn.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #374151' }}>
                                    <span style={{ color: '#fff' }}>{fn.name}</span>
                                    <button
                                        aria-label={`Revocar ${fn.name}`}
                                        onClick={() => handleRevoke(fn.id)}
                                        disabled={loading}
                                        style={{ padding: '4px 12px', backgroundColor: '#dc2626', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '13px' }}
                                    >
                                        Revocar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Asignar tab panel */}
            {activeTab === 'asignar' && (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Panel izquierdo - opciones */}
                        <div style={{ padding: '16px', backgroundColor: '#111827', borderRadius: '8px', border: '1px solid #374151' }}>
                            <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Opciones</h2>
                            <div>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                                    Fecha de Expiración (opcional)
                                </label>
                                <input
                                    type="date"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #374151', borderRadius: '4px', backgroundColor: '#1f2937', color: '#fff', fontSize: '14px' }}
                                />
                                <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                                    Dejar en blanco para asignación permanente
                                </small>
                            </div>
                            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#1f2937', borderRadius: '4px', fontSize: '12px', color: '#9ca3af' }}>
                                <strong style={{ color: '#fff' }}>Reglas de separación activas:</strong>
                                <ul style={{ margin: '8px 0 0 16px', paddingLeft: '16px' }}>
                                    <li>SR-001: PIP-* incompatible con AUD-*</li>
                                    <li>SR-002: USR-* incompatible con AUD-*</li>
                                    <li>SR-003: ACC-* incompatible con AUD-*</li>
                                </ul>
                            </div>
                        </div>

                        {/* Panel derecho - Selector de funciones */}
                        <div>
                            {allFunctions.length > 0 ? (
                                <FunctionSelector
                                    allFunctions={allFunctions}
                                    selectedFunctionIds={selectedFunctions}
                                    currentUserFunctions={[]}
                                    onSelectionChange={handleFunctionSelection}
                                    onConflictDetected={handleConflictDetected}
                                />
                            ) : (
                                <div style={{ padding: '16px', backgroundColor: '#111827', borderRadius: '8px', color: '#9ca3af', textAlign: 'center' }}>
                                    Cargando funciones...
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => { setSelectedFunctions([]); setSelectedUser(''); setExpiryDate(''); }}
                            style={{ padding: '8px 16px', backgroundColor: '#374151', border: 'none', borderRadius: '4px', color: '#fff', cursor: 'pointer', fontSize: '14px' }}
                            disabled={loading}
                        >
                            Limpiar
                        </button>
                        <button
                            onClick={handleAssign}
                            disabled={!selectedUser || selectedFunctions.length === 0 || hasConflicts || loading}
                            style={{
                                padding: '8px 24px',
                                backgroundColor: hasConflicts ? '#6b7280' : '#0ea5e9',
                                border: 'none', borderRadius: '4px', color: '#fff',
                                cursor: hasConflicts || !selectedUser || selectedFunctions.length === 0 || loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px', fontWeight: 600,
                            }}
                        >
                            {loading ? 'Asignando...' : 'Asignar Funciones'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
