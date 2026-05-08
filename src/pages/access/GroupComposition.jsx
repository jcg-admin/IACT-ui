/**
 * GroupCompositionPage.jsx
 * IACT v4.0 - Access Module
 * Gestión de funciones asignadas a un grupo/AGR
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllFunctions,
    fetchGroupFunctions,
    assignFunctionsToGroup,
    selectGroups,
    selectGroupFunctions,
    selectFunctions,
    selectLoading,
    selectError,
    clearError,
} from '../../redux/slices/access';
import accessService from '../../services/accessGateway';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function GroupComposition() {
    const dispatch = useDispatch();
    const groups = useSelector(selectGroups);
    const groupFunctions = useSelector(selectGroupFunctions);
    const allFunctions = useSelector(selectFunctions);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    const [localGroups, setLocalGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('');
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [selectorSearch, setSelectorSearch] = useState('');
    const [pendingAdd, setPendingAdd] = useState([]); // ids seleccionados en el modal
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchAllFunctions());
        loadGroups();
    }, [dispatch]);

    useEffect(() => {
        if (selectedGroupId) {
            dispatch(fetchGroupFunctions(selectedGroupId));
        }
    }, [selectedGroupId, dispatch]);

    const loadGroups = async () => {
        try {
            const data = await accessService.getFunctionGroups();
            const list = Array.isArray(data) ? data : [];
            setLocalGroups(list);
            // Merge with redux groups as backup
        } catch {
            // use redux groups
        }
    };

    const displayGroups = localGroups.length > 0 ? localGroups : groups;

    const assignedIds = groupFunctions.map(f => f.id ?? f.function_id ?? f);

    const handleGroupChange = (e) => {
        dispatch(clearError());
        setSelectedGroupId(e.target.value);
        setSelectorOpen(false);
        setPendingAdd([]);
    };

    // Quitar una función ya asignada: re-asignar sin ella
    const handleRemoveFunction = async (funcId) => {
        if (!selectedGroupId) return;
        const newIds = assignedIds.filter(id => id !== funcId);
        setSubmitting(true);
        try {
            await dispatch(assignFunctionsToGroup({ groupId: selectedGroupId, functionIds: newIds }));
            dispatch(fetchGroupFunctions(selectedGroupId));
        } finally {
            setSubmitting(false);
        }
    };

    // Modal de selección: toggle pendingAdd
    const togglePending = (funcId) => {
        setPendingAdd(prev =>
            prev.includes(funcId) ? prev.filter(id => id !== funcId) : [...prev, funcId]
        );
    };

    const handleConfirmAdd = async () => {
        if (!selectedGroupId || pendingAdd.length === 0) return;
        const newIds = Array.from(new Set([...assignedIds, ...pendingAdd]));
        setSubmitting(true);
        try {
            await dispatch(assignFunctionsToGroup({ groupId: selectedGroupId, functionIds: newIds }));
            dispatch(fetchGroupFunctions(selectedGroupId));
            setSelectorOpen(false);
            setPendingAdd([]);
        } finally {
            setSubmitting(false);
        }
    };

    const availableToAdd = allFunctions.filter(f =>
        !assignedIds.includes(f.id) &&
        (!selectorSearch ||
            f.name.toLowerCase().includes(selectorSearch.toLowerCase()) ||
            f.code.toLowerCase().includes(selectorSearch.toLowerCase()))
    );

    const selectedGroup = displayGroups.find(g => String(g.id) === String(selectedGroupId));

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Composición de Grupos / AGRs</h1>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                        Asignar y quitar funciones de un grupo de acceso (T-043)
                    </p>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="error-banner" style={{ marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {/* Selector de grupo */}
            <div style={{
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#111827',
                border: '1px solid #374151',
                borderRadius: '8px',
            }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#9ca3af' }}>
                    Seleccionar grupo
                </label>
                <select
                    value={selectedGroupId}
                    onChange={handleGroupChange}
                    style={{
                        width: '360px',
                        maxWidth: '100%',
                        padding: '8px 12px',
                        border: '1px solid #374151',
                        borderRadius: '4px',
                        backgroundColor: '#1f2937',
                        color: '#fff',
                        fontSize: '14px',
                    }}
                >
                    <option value="">-- Elige un grupo --</option>
                    {displayGroups.map(g => (
                        <option key={g.id} value={g.id}>
                            {g.name}{g.active === false ? ' (inactivo)' : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Contenido del grupo seleccionado */}
            {selectedGroupId && (
                <div style={{
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    overflow: 'hidden',
                }}>
                    {/* Sub-header */}
                    <div style={{
                        padding: '16px',
                        backgroundColor: '#0f172a',
                        borderBottom: '1px solid #374151',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <div>
                            <h2 style={{ margin: 0, color: '#fff', fontSize: '16px' }}>
                                Funciones asignadas — {selectedGroup?.name ?? selectedGroupId}
                                <span style={{ fontSize: '13px', color: '#9ca3af', marginLeft: '8px' }}>
                                    ({groupFunctions.length})
                                </span>
                            </h2>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ fontSize: '13px' }}
                            onClick={() => { setSelectorOpen(true); setSelectorSearch(''); setPendingAdd([]); }}
                            disabled={loading || submitting}
                        >
                            + Agregar función
                        </button>
                    </div>

                    {/* Lista de funciones asignadas */}
                    {loading && groupFunctions.length === 0 ? (
                        <LoadingSpinner message="Cargando funciones..." />
                    ) : groupFunctions.length === 0 ? (
                        <div className="empty-state">Este grupo no tiene funciones asignadas.</div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupFunctions.map(func => (
                                    <tr key={func.id ?? func.function_id}>
                                        <td>
                                            <span className="badge" style={{ fontSize: '12px' }}>
                                                {func.code ?? func.codename ?? '—'}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 500 }}>{func.name ?? '—'}</td>
                                        <td style={{ color: '#9ca3af', fontSize: '13px' }}>
                                            {func.description ?? '—'}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-secondary"
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '4px 10px',
                                                    color: '#f87171',
                                                    borderColor: '#f87171',
                                                }}
                                                onClick={() => handleRemoveFunction(func.id ?? func.function_id)}
                                                disabled={submitting || loading}
                                            >
                                                Quitar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Modal selector de funciones */}
            {selectorOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) setSelectorOpen(false); }}
                >
                    <div
                        style={{
                            backgroundColor: '#111827',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            padding: '24px',
                            width: '560px',
                            maxWidth: '90vw',
                            maxHeight: '80vh',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <h2 style={{ margin: '0 0 16px 0', color: '#fff', fontSize: '18px' }}>
                            Agregar función al grupo
                        </h2>

                        <input
                            type="text"
                            placeholder="Buscar función..."
                            value={selectorSearch}
                            onChange={(e) => setSelectorSearch(e.target.value)}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #374151',
                                borderRadius: '4px',
                                backgroundColor: '#1f2937',
                                color: '#fff',
                                fontSize: '14px',
                                marginBottom: '12px',
                                boxSizing: 'border-box',
                            }}
                        />

                        <div style={{ overflowY: 'auto', flex: 1, marginBottom: '16px' }}>
                            {availableToAdd.length === 0 ? (
                                <div className="empty-state">
                                    {selectorSearch ? 'Sin resultados' : 'Todas las funciones ya están asignadas'}
                                </div>
                            ) : (
                                availableToAdd.map(func => {
                                    const checked = pendingAdd.includes(func.id);
                                    return (
                                        <div
                                            key={func.id}
                                            onClick={() => togglePending(func.id)}
                                            style={{
                                                padding: '10px 12px',
                                                marginBottom: '6px',
                                                backgroundColor: checked ? '#1e40af' : '#1f2937',
                                                border: '1px solid #374151',
                                                borderRadius: '4px',
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: '10px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => {}}
                                                style={{ marginTop: '3px', accentColor: '#0ea5e9' }}
                                            />
                                            <div>
                                                <div style={{ color: '#fff', fontWeight: 500, fontSize: '14px' }}>
                                                    {func.code} — {func.name}
                                                </div>
                                                {func.description && (
                                                    <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>
                                                        {func.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setSelectorOpen(false)}
                                disabled={submitting}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleConfirmAdd}
                                disabled={pendingAdd.length === 0 || submitting}
                            >
                                {submitting
                                    ? 'Asignando...'
                                    : `Agregar ${pendingAdd.length > 0 ? `(${pendingAdd.length})` : ''}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
