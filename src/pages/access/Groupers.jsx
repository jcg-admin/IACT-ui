/**
 * GroupersPage.jsx
 * IACT v4.0 - Access Module
 * UC_ACC_04: Gestionar agrupadores de funciones
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllFunctions, selectLoading, selectError } from '../../redux/slices/access';

export default function Groupers() {
    const [groupers, setGroupers] = useState([]);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newGrouper, setNewGrouper] = useState({
        name: '',
        description: '',
        functions: [],
    });
    const [selectedGrouper, setSelectedGrouper] = useState(null);
    const [assignUser, setAssignUser] = useState('');
    const [users, setUsers] = useState([]);

    const dispatch = useDispatch();
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);
    const allFunctions = useSelector(state => state.access.functions);

    useEffect(() => {
        dispatch(fetchAllFunctions());
        loadGroupers();
        loadUsers();
    }, [dispatch]);

    const loadGroupers = async () => {
        try {
            // Datos de ejemplo - en producción vienen del backend
            setGroupers([
                {
                    id: 1,
                    name: 'MANAGER',
                    description: 'Gestor general del sistema',
                    functionCount: 10,
                    assignedCount: 2,
                    functions: ['ACC-001', 'ACC-002', 'USR-001', 'PIP-001'],
                },
                {
                    id: 2,
                    name: 'OPERATOR',
                    description: 'Operador de pipelines',
                    functionCount: 6,
                    assignedCount: 5,
                    functions: ['PIP-001', 'PIP-002', 'PIP-005'],
                },
                {
                    id: 3,
                    name: 'ANALYST',
                    description: 'Analista de datos',
                    functionCount: 5,
                    assignedCount: 3,
                    functions: ['PIP-001', 'DAS-001', 'DAS-002'],
                },
            ]);
        } catch (error) {
            console.error('Error loading groupers:', error);
        }
    };

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

    const handleCreateGrouper = () => {
        if (!newGrouper.name || newGrouper.functions.length === 0) {
            alert('Completa nombre y selecciona al menos una función');
            return;
        }

        const created = {
            id: groupers.length + 1,
            name: newGrouper.name,
            description: newGrouper.description,
            functionCount: newGrouper.functions.length,
            assignedCount: 0,
            functions: newGrouper.functions,
        };

        setGroupers([...groupers, created]);
        setNewGrouper({ name: '', description: '', functions: [] });
        setShowNewForm(false);
    };

    const handleToggleFunction = (functionId) => {
        setNewGrouper(prev => ({
            ...prev,
            functions: prev.functions.includes(functionId)
                ? prev.functions.filter(id => id !== functionId)
                : [...prev.functions, functionId],
        }));
    };

    const handleAssignGrouper = async () => {
        if (!selectedGrouper || !assignUser) {
            alert('Selecciona agrupador y usuario');
            return;
        }

        // Simulación de asignación
        const updated = groupers.map(g =>
            g.id === selectedGrouper.id
                ? { ...g, assignedCount: g.assignedCount + 1 }
                : g
        );
        setGroupers(updated);
        setAssignUser('');
        alert('Agrupador asignado exitosamente');
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Agrupadores de Funciones
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ACC_04 - Gestionar grupos de funciones relacionadas
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Panel izquierdo - Lista de agrupadores */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                    }}>
                        <h2 style={{ margin: 0, color: '#fff' }}>Agrupadores Disponibles</h2>
                        <button
                            onClick={() => setShowNewForm(!showNewForm)}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#0ea5e9',
                                border: 'none',
                                borderRadius: '4px',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            {showNewForm ? 'Cancelar' : 'Nuevo Agrupador'}
                        </button>
                    </div>

                    {/* Formulario nuevo agrupador */}
                    {showNewForm && (
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#111827',
                            borderRadius: '8px',
                            border: '1px solid #374151',
                            marginBottom: '16px',
                        }}>
                            <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>Crear Agrupador</h3>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    value={newGrouper.name}
                                    onChange={(e) => setNewGrouper({ ...newGrouper, name: e.target.value })}
                                    placeholder="Ej: SUPERVISOR"
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

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                                    Descripción
                                </label>
                                <input
                                    type="text"
                                    value={newGrouper.description}
                                    onChange={(e) => setNewGrouper({ ...newGrouper, description: e.target.value })}
                                    placeholder="Descripción del agrupador"
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

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: '#9ca3af' }}>
                                    Seleccionar Funciones
                                </label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '8px',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                }}>
                                    {allFunctions.map(func => (
                                        <label key={func.id} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '6px',
                                            backgroundColor: '#1f2937',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '11px',
                                            color: '#fff',
                                        }}>
                                            <input
                                                type="checkbox"
                                                checked={newGrouper.functions.includes(func.id)}
                                                onChange={() => handleToggleFunction(func.id)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            {func.code}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleCreateGrouper}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    backgroundColor: '#10b981',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                }}
                            >
                                Crear Agrupador
                            </button>
                        </div>
                    )}

                    {/* Lista de agrupadores */}
                    <div style={{
                        display: 'grid',
                        gap: '12px',
                    }}>
                        {groupers.map(grouper => (
                            <div
                                key={grouper.id}
                                onClick={() => setSelectedGrouper(grouper)}
                                style={{
                                    padding: '16px',
                                    backgroundColor: selectedGrouper?.id === grouper.id ? '#1e40af' : '#111827',
                                    border: '1px solid #374151',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                }}
                            >
                                <div style={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}>
                                    {grouper.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                                    {grouper.description}
                                </div>
                                <div style={{
                                    display: 'flex',
                                    gap: '16px',
                                    fontSize: '12px',
                                    color: '#6b7280',
                                }}>
                                    <span>Funciones: {grouper.functionCount}</span>
                                    <span>Asignado a: {grouper.assignedCount} usuarios</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Panel derecho - Detalles y asignación */}
                <div>
                    {selectedGrouper ? (
                        <>
                            {/* Detalles del agrupador */}
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#111827',
                                borderRadius: '8px',
                                border: '1px solid #374151',
                                marginBottom: '16px',
                            }}>
                                <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>
                                    {selectedGrouper.name}
                                </h3>

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                                        Descripción
                                    </div>
                                    <div style={{ color: '#fff' }}>
                                        {selectedGrouper.description}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
                                        Funciones incluidas ({selectedGrouper.functionCount})
                                    </div>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, 1fr)',
                                        gap: '8px',
                                    }}>
                                        {selectedGrouper.functions.map((funcCode, idx) => (
                                            <span
                                                key={idx}
                                                style={{
                                                    padding: '6px 12px',
                                                    backgroundColor: '#1f2937',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    color: '#fff',
                                                }}
                                            >
                                                {funcCode}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#1f2937',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#9ca3af',
                                }}>
                                    <strong style={{ color: '#fff' }}>Asignado a:</strong> {selectedGrouper.assignedCount} usuarios
                                </div>
                            </div>

                            {/* Asignar agrupador */}
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#111827',
                                borderRadius: '8px',
                                border: '1px solid #374151',
                            }}>
                                <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>
                                    Asignar a Usuario
                                </h3>

                                <select
                                    value={assignUser}
                                    onChange={(e) => setAssignUser(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #374151',
                                        borderRadius: '4px',
                                        backgroundColor: '#1f2937',
                                        color: '#fff',
                                        fontSize: '14px',
                                        marginBottom: '12px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option value="">Selecciona usuario...</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.username}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={handleAssignGrouper}
                                    disabled={!assignUser}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: assignUser ? '#0ea5e9' : '#6b7280',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        cursor: assignUser ? 'pointer' : 'not-allowed',
                                        fontSize: '14px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Asignar Agrupador
                                </button>

                                <div style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    backgroundColor: '#1f2937',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#9ca3af',
                                }}>
                                    <strong style={{ color: '#10b981' }}>Benefit:</strong> Al asignar un agrupador, el usuario obtiene automáticamente todas sus funciones
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            padding: '24px',
                            backgroundColor: '#111827',
                            borderRadius: '8px',
                            border: '1px solid #374151',
                            color: '#9ca3af',
                            textAlign: 'center',
                        }}>
                            Selecciona un agrupador para ver detalles
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div role="alert" className="error-banner">
                    Error: {error}
                </div>
            )}
        </div>
    );
}
