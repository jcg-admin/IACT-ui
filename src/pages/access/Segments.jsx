/**
 * SegmentsPage.jsx
 * IACT v4.0 - Access Module
 * UC_ACC_06-07: Gestionar y asignar segmentos
 */

import React, { useState, useEffect } from 'react';

const SEGMENTS_DATA = [
    {
        id: 1,
        code: 'SEG-NORTH',
        name: 'Región Norte',
        description: 'Datos y operaciones de región norte',
        parentId: null,
        userCount: 3,
        level: 0,
    },
    {
        id: 2,
        code: 'SEG-NORTH-SALES',
        name: 'Ventas - Norte',
        description: 'Equipo de ventas región norte',
        parentId: 1,
        userCount: 2,
        level: 1,
    },
    {
        id: 3,
        code: 'SEG-NORTH-OPS',
        name: 'Operaciones - Norte',
        description: 'Equipo de operaciones región norte',
        parentId: 1,
        userCount: 1,
        level: 1,
    },
    {
        id: 4,
        code: 'SEG-SOUTH',
        name: 'Región Sur',
        description: 'Datos y operaciones de región sur',
        parentId: null,
        userCount: 2,
        level: 0,
    },
    {
        id: 5,
        code: 'SEG-EAST',
        name: 'Región Este',
        description: 'Datos y operaciones de región este',
        parentId: null,
        userCount: 4,
        level: 0,
    },
];

export default function Segments() {
    const [segments, setSegments] = useState(SEGMENTS_DATA);
    const [selectedSegment, setSelectedSegment] = useState(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [expandedSegments, setExpandedSegments] = useState([1, 4, 5]);
    const [newSegment, setNewSegment] = useState({
        code: '',
        name: '',
        description: '',
        parentId: '',
    });
    const [assignData, setAssignData] = useState({
        userId: '',
        expiryDate: '',
    });
    const [users, setUsers] = useState([]);

     
    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setUsers([
            { id: 1, username: 'user1' },
            { id: 2, username: 'user2' },
            { id: 3, username: 'admin_test' },
        ]);
    };

    const toggleExpand = (segmentId) => {
        setExpandedSegments(prev =>
            prev.includes(segmentId)
                ? prev.filter(id => id !== segmentId)
                : [...prev, segmentId]
        );
    };

    const getChildren = (segmentId) => segments.filter(s => s.parentId === segmentId);

    const handleCreateSegment = () => {
        if (!newSegment.code || !newSegment.name) {
            alert('Completa código y nombre');
            return;
        }

        const created = {
            id: segments.length + 1,
            code: newSegment.code,
            name: newSegment.name,
            description: newSegment.description,
            parentId: newSegment.parentId ? parseInt(newSegment.parentId) : null,
            userCount: 0,
            level: newSegment.parentId ? 1 : 0,
        };

        setSegments([...segments, created]);
        setNewSegment({ code: '', name: '', description: '', parentId: '' });
        setShowNewForm(false);
    };

    const handleAssignSegment = () => {
        if (!selectedSegment || !assignData.userId) {
            alert('Selecciona usuario');
            return;
        }

        const updated = segments.map(seg =>
            seg.id === selectedSegment.id
                ? { ...seg, userCount: seg.userCount + 1 }
                : seg
        );
        setSegments(updated);
        setAssignData({ userId: '', expiryDate: '' });
        alert('Segmento asignado exitosamente');
    };

    const renderSegmentTree = (parentId = null, depth = 0) => {
        return segments
            .filter(s => s.parentId === parentId)
            .map(segment => {
                const children = getChildren(segment.id);
                const hasChildren = children.length > 0;
                const isExpanded = expandedSegments.includes(segment.id);

                return (
                    <div key={segment.id}>
                        <div
                            onClick={() => setSelectedSegment(segment)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                marginLeft: `${depth * 20}px`,
                                backgroundColor: selectedSegment?.id === segment.id ? '#1e40af' : '#111827',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                marginBottom: '8px',
                            }}
                        >
                            {hasChildren && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpand(segment.id);
                                    }}
                                    style={{
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        padding: 0,
                                        width: '20px',
                                    }}
                                >
                                    {isExpanded ? '-' : '+'}
                                </button>
                            )}
                            {!hasChildren && <div style={{ width: '20px' }}></div>}

                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#fff', fontWeight: 600 }}>
                                    {segment.code} - {segment.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                                    {segment.description}
                                </div>
                            </div>

                            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                {segment.userCount} usuarios
                            </div>
                        </div>

                        {hasChildren && isExpanded && renderSegmentTree(segment.id, depth + 1)}
                    </div>
                );
            });
    };

    return (
        <div style={{ padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '28px' }}>
                    Segmentos de Datos
                </h1>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                    UC_ACC_06-07 - Gestionar segmentación y asignación de usuarios
                </p>
            </div>

            {/* Estadísticas */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '24px',
            }}>
                <div style={{
                    padding: '16px',
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                }}>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>Segmentos Totales</div>
                    <div style={{ color: '#0ea5e9', fontSize: '28px', fontWeight: 600, marginTop: '4px' }}>
                        {segments.length}
                    </div>
                </div>

                <div style={{
                    padding: '16px',
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                }}>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>Usuarios Asignados</div>
                    <div style={{ color: '#10b981', fontSize: '28px', fontWeight: 600, marginTop: '4px' }}>
                        {segments.reduce((sum, s) => sum + s.userCount, 0)}
                    </div>
                </div>

                <div style={{
                    padding: '16px',
                    backgroundColor: '#111827',
                    borderRadius: '8px',
                    border: '1px solid #374151',
                }}>
                    <div style={{ color: '#9ca3af', fontSize: '12px' }}>Niveles de Profundidad</div>
                    <div style={{ color: '#8b5cf6', fontSize: '28px', fontWeight: 600, marginTop: '4px' }}>
                        2
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Panel izquierdo - Árbol de segmentos */}
                <div>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                    }}>
                        <h2 style={{ margin: 0, color: '#fff' }}>Árbol de Segmentos</h2>
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
                            {showNewForm ? 'Cancelar' : 'Nuevo'}
                        </button>
                    </div>

                    {/* Formulario nuevo segmento */}
                    {showNewForm && (
                        <div style={{
                            padding: '16px',
                            backgroundColor: '#111827',
                            borderRadius: '8px',
                            border: '1px solid #374151',
                            marginBottom: '16px',
                        }}>
                            <h3 style={{ margin: '0 0 12px 0', color: '#fff' }}>Crear Segmento</h3>

                            <input
                                type="text"
                                placeholder="Código (ej: SEG-WEST)"
                                value={newSegment.code}
                                onChange={(e) => setNewSegment({ ...newSegment, code: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    marginBottom: '8px',
                                    border: '1px solid #374151',
                                    borderRadius: '4px',
                                    backgroundColor: '#1f2937',
                                    color: '#fff',
                                    fontSize: '12px',
                                }}
                            />

                            <input
                                type="text"
                                placeholder="Nombre"
                                value={newSegment.name}
                                onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    marginBottom: '8px',
                                    border: '1px solid #374151',
                                    borderRadius: '4px',
                                    backgroundColor: '#1f2937',
                                    color: '#fff',
                                    fontSize: '12px',
                                }}
                            />

                            <input
                                type="text"
                                placeholder="Descripción"
                                value={newSegment.description}
                                onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    marginBottom: '12px',
                                    border: '1px solid #374151',
                                    borderRadius: '4px',
                                    backgroundColor: '#1f2937',
                                    color: '#fff',
                                    fontSize: '12px',
                                }}
                            />

                            <select
                                value={newSegment.parentId}
                                onChange={(e) => setNewSegment({ ...newSegment, parentId: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    marginBottom: '12px',
                                    border: '1px solid #374151',
                                    borderRadius: '4px',
                                    backgroundColor: '#1f2937',
                                    color: '#fff',
                                    fontSize: '12px',
                                }}
                            >
                                <option value="">Sin padre (nivel raíz)</option>
                                {segments.filter(s => !s.parentId).map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>

                            <button
                                onClick={handleCreateSegment}
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
                                Crear Segmento
                            </button>
                        </div>
                    )}

                    {/* Árbol */}
                    <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {renderSegmentTree()}
                    </div>
                </div>

                {/* Panel derecho - Detalles y asignación */}
                <div>
                    {selectedSegment ? (
                        <>
                            {/* Detalles */}
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#111827',
                                borderRadius: '8px',
                                border: '1px solid #374151',
                                marginBottom: '16px',
                            }}>
                                <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>
                                    {selectedSegment.code}
                                </h3>

                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                                        Nombre
                                    </div>
                                    <div style={{ color: '#fff' }}>{selectedSegment.name}</div>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '4px' }}>
                                        Descripción
                                    </div>
                                    <div style={{ color: '#fff' }}>{selectedSegment.description}</div>
                                </div>

                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#1f2937',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    color: '#9ca3af',
                                }}>
                                    <strong style={{ color: '#fff' }}>Usuarios:</strong> {selectedSegment.userCount}
                                </div>
                            </div>

                            {/* Asignar usuario */}
                            <div style={{
                                padding: '16px',
                                backgroundColor: '#111827',
                                borderRadius: '8px',
                                border: '1px solid #374151',
                            }}>
                                <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>
                                    Asignar Usuario a Segmento
                                </h3>

                                <select
                                    value={assignData.userId}
                                    onChange={(e) => setAssignData({ ...assignData, userId: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        marginBottom: '12px',
                                        border: '1px solid #374151',
                                        borderRadius: '4px',
                                        backgroundColor: '#1f2937',
                                        color: '#fff',
                                        fontSize: '12px',
                                    }}
                                >
                                    <option value="">Selecciona usuario...</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>{user.username}</option>
                                    ))}
                                </select>

                                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                                    Fecha de Expiración (opcional)
                                </label>
                                <input
                                    type="date"
                                    value={assignData.expiryDate}
                                    onChange={(e) => setAssignData({ ...assignData, expiryDate: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        marginBottom: '12px',
                                        border: '1px solid #374151',
                                        borderRadius: '4px',
                                        backgroundColor: '#1f2937',
                                        color: '#fff',
                                        fontSize: '12px',
                                    }}
                                />

                                <button
                                    onClick={handleAssignSegment}
                                    disabled={!assignData.userId}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: assignData.userId ? '#0ea5e9' : '#6b7280',
                                        border: 'none',
                                        borderRadius: '4px',
                                        color: '#fff',
                                        cursor: assignData.userId ? 'pointer' : 'not-allowed',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                    }}
                                >
                                    Asignar Segmento
                                </button>

                                <div style={{
                                    marginTop: '12px',
                                    padding: '12px',
                                    backgroundColor: '#1f2937',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    color: '#9ca3af',
                                }}>
                                    <strong style={{ color: '#10b981' }}>Info:</strong> Los usuarios asignados a un segmento solo ven datos de ese segmento
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
                            Selecciona un segmento para ver detalles
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
