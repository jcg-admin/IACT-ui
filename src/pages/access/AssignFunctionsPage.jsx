/**
 * AssignFunctionsPage.jsx
 * IACT v4.0 - Access Module
 * UC_ACC_01: Asignar funciones a usuarios
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllFunctions, assignFunction, validateSeparationRules, selectLoading, selectError, selectSuccess, clearSuccess } from '../../redux/slices/accessSlice';
import FunctionSelector from '../../components/access/FunctionSelector';

export default function AssignFunctionsPage() {
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

    const handleAssign = async (e) => {
        e.preventDefault();

        if (!selectedUser || selectedFunctions.length === 0) {
            return;
        }

        if (hasConflicts) {
            alert('No se pueden asignar funciones con conflictos de separación de funciones');
            return;
        }

        // Asignar cada función seleccionada
        for (const catalogId of selectedFunctions) {
            await dispatch(assignFunction({
                userId: parseInt(selectedUser),
                catalogId,
                expiresAt: expiryDate || null,
            }));
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Asignar Funciones
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ACC_01 - Asignar funciones a usuarios con validación de separación de funciones
                </p>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Panel izquierdo - Selección de usuario */}
                <div style={{
                    padding: '16px',
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                }}>
                    <h2 style={{ margin: '0 0 16px 0', color: '#fff' }}>Seleccionar Usuario</h2>

                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                        Usuario
                    </label>
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            marginBottom: '16px',
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

                    {/* Opciones adicionales */}
                    <div style={{ marginTop: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#9ca3af' }}>
                            Fecha de Expiración (opcional)
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
                        <small style={{ color: '#6b7280', display: 'block', marginTop: '4px' }}>
                            Dejar en blanco para asignación permanente
                        </small>
                    </div>

                    {/* Reglas de separación */}
                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        backgroundColor: '#1f2937',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#9ca3af',
                    }}>
                        <strong style={{ color: '#fff' }}>Reglas de separación activas:</strong>
                        <ul style={{ margin: '8px 0 0 16px', paddingLeft: '16px' }}>
                            <li>SOD-001: PIP-* incompatible con AUD-*</li>
                            <li>SOD-002: USR-* incompatible con AUD-*</li>
                            <li>SOD-003: ACC-* incompatible con AUD-*</li>
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
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#111827',
                            borderRadius: '8px',
                            color: '#9ca3af',
                            textAlign: 'center',
                        }}>
                            Cargando funciones...
                        </div>
                    )}
                </div>
            </div>

            {/* Botones de acción */}
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => {
                        setSelectedFunctions([]);
                        setSelectedUser('');
                        setExpiryDate('');
                    }}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#374151',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                    }}
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
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        cursor: hasConflicts || !selectedUser || selectedFunctions.length === 0 || loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                    }}
                >
                    {loading ? 'Asignando...' : 'Asignar Funciones'}
                </button>
            </div>
        </div>
    );
}
