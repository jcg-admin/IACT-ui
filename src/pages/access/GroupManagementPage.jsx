/**
 * GroupManagementPage.jsx
 * IACT v4.0 - Access Module
 * CRUD de grupos/AGRs del catálogo de acceso
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllFunctions,
    createGroup,
    updateGroup,
    deactivateGroup,
    selectGroups,
    selectLoading,
    selectError,
    clearError,
    clearSuccess,
} from '../../redux/slices/accessSlice';
import accessService from '../../services/accessService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const EMPTY_FORM = { name: '', description: '' };

export default function GroupManagementPage() {
    const dispatch = useDispatch();
    const groups = useSelector(selectGroups);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    const [localGroups, setLocalGroups] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null); // null = crear, object = editar
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchAllFunctions());
        loadGroups();
    }, [dispatch]);

    // Merge redux groups with local list (redux may be empty on first load)
    useEffect(() => {
        if (groups.length > 0) {
            setLocalGroups(groups);
        }
    }, [groups]);

    const loadGroups = async () => {
        try {
            const data = await accessService.getFunctionGroups();
            setLocalGroups(Array.isArray(data) ? data : []);
        } catch {
            // fallback to redux state
        }
    };

    const openCreateModal = () => {
        setEditingGroup(null);
        setForm(EMPTY_FORM);
        setFormError('');
        setModalOpen(true);
    };

    const openEditModal = (group) => {
        setEditingGroup(group);
        setForm({ name: group.name || '', description: group.description || '' });
        setFormError('');
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingGroup(null);
        setForm(EMPTY_FORM);
        setFormError('');
        dispatch(clearError());
        dispatch(clearSuccess());
    };

    const handleFormChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setFormError('El nombre es obligatorio');
            return;
        }
        setSubmitting(true);
        setFormError('');

        try {
            if (editingGroup) {
                const result = await dispatch(updateGroup({ id: editingGroup.id, data: form }));
                if (!result.error) {
                    setLocalGroups(prev =>
                        prev.map(g => g.id === editingGroup.id ? { ...g, ...form } : g)
                    );
                    closeModal();
                } else {
                    setFormError(result.payload || 'Error al actualizar el grupo');
                }
            } else {
                const result = await dispatch(createGroup(form));
                if (!result.error) {
                    if (result.payload) {
                        setLocalGroups(prev => [...prev, result.payload]);
                    }
                    closeModal();
                } else {
                    setFormError(result.payload || 'Error al crear el grupo');
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeactivate = async (group) => {
        if (!window.confirm(`¿Desactivar el grupo "${group.name}"?`)) return;
        const result = await dispatch(deactivateGroup(group.id));
        if (!result.error) {
            setLocalGroups(prev =>
                prev.map(g => g.id === group.id ? { ...g, active: false } : g)
            );
        }
    };

    const getStatusBadge = (active) => (
        <span
            className={active !== false ? 'badge' : 'badge badge-danger'}
            style={{ fontSize: '12px' }}
        >
            {active !== false ? 'ACTIVE' : 'INACTIVE'}
        </span>
    );

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1>Gestión de Grupos / AGRs</h1>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                        Crear y administrar grupos de acceso del catálogo (T-041)
                    </p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    + Crear grupo
                </button>
            </div>

            {/* Error banner */}
            {error && (
                <div className="error-banner" style={{ marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            {/* Tabla */}
            {loading && localGroups.length === 0 ? (
                <LoadingSpinner message="Cargando grupos..." />
            ) : localGroups.length === 0 ? (
                <div className="empty-state">No hay grupos registrados. Crea el primero.</div>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {localGroups.map(group => (
                            <tr key={group.id}>
                                <td style={{ fontWeight: 600 }}>{group.name}</td>
                                <td style={{ color: '#9ca3af' }}>{group.description || '—'}</td>
                                <td>{getStatusBadge(group.active)}</td>
                                <td>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ fontSize: '12px', padding: '4px 10px' }}
                                            onClick={() => openEditModal(group)}
                                        >
                                            Editar
                                        </button>
                                        {group.active !== false && (
                                            <button
                                                className="btn btn-secondary"
                                                style={{
                                                    fontSize: '12px',
                                                    padding: '4px 10px',
                                                    color: '#f87171',
                                                    borderColor: '#f87171',
                                                }}
                                                onClick={() => handleDeactivate(group)}
                                                disabled={loading}
                                            >
                                                Desactivar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Modal inline crear/editar */}
            {modalOpen && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                    }}
                    onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                >
                    <div
                        style={{
                            backgroundColor: '#111827',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            padding: '24px',
                            width: '480px',
                            maxWidth: '90vw',
                        }}
                    >
                        <h2 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: '18px' }}>
                            {editingGroup ? 'Editar grupo' : 'Crear grupo'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#9ca3af' }}>
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleFormChange}
                                    placeholder="Nombre del grupo"
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #374151',
                                        borderRadius: '4px',
                                        backgroundColor: '#1f2937',
                                        color: '#fff',
                                        fontSize: '14px',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#9ca3af' }}>
                                    Descripción
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleFormChange}
                                    placeholder="Descripción opcional del grupo"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #374151',
                                        borderRadius: '4px',
                                        backgroundColor: '#1f2937',
                                        color: '#fff',
                                        fontSize: '14px',
                                        resize: 'vertical',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>

                            {formError && (
                                <div className="error-banner" style={{ marginBottom: '16px' }}>
                                    {formError}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeModal}
                                    disabled={submitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? (editingGroup ? 'Guardando...' : 'Creando...')
                                        : (editingGroup ? 'Guardar cambios' : 'Crear grupo')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
