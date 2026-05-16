import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllFunctions,
    fetchGroupers,
    createGroup,
    updateGroup,
    retireGroup,
    selectGroups,
    selectLoading,
    selectError,
    clearError,
    clearSuccess,
} from '../../redux/slices/access';
import Table from '@ui/presentational/Table';

const EMPTY_FORM = { name: '', description: '', code: '' };
const CODE_REGEX = /^[a-z][a-z0-9_]+_group$/;

export default function GroupManagement() {
    const dispatch = useDispatch();
    const groups = useSelector(selectGroups);
    const loading = useSelector(selectLoading);
    const error = useSelector(selectError);

    const [localGroups, setLocalGroups] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Retire modal state
    const [retiringGroup, setRetiringGroup] = useState(null);
    const [retireReason, setRetireReason] = useState('');
    const [retireError, setRetireError] = useState('');
    const [retiring, setRetiring] = useState(false);

    useEffect(() => {
        dispatch(fetchAllFunctions());
        dispatch(fetchGroupers());
    }, [dispatch]);

    useEffect(() => {
        if (groups.length > 0) {
            setLocalGroups(groups);
        }
    }, [groups]);


    const openCreateModal = () => {
        setEditingGroup(null);
        setForm(EMPTY_FORM);
        setFormError('');
        setModalOpen(true);
    };

    const openEditModal = (group) => {
        setEditingGroup(group);
        setForm({ name: group.name || '', description: group.description || '', code: group.code || '' });
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

    const openRetireModal = (group) => {
        setRetiringGroup(group);
        setRetireReason('');
        setRetireError('');
    };

    const closeRetireModal = () => {
        setRetiringGroup(null);
        setRetireReason('');
        setRetireError('');
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
        if (!editingGroup && !CODE_REGEX.test(form.code.trim())) {
            setFormError('El código debe seguir el formato: ej. admins_group (minúsculas, termina en _group)');
            return;
        }
        setSubmitting(true);
        setFormError('');

        try {
            if (editingGroup) {
                const result = await dispatch(updateGroup({ id: editingGroup.id, data: { name: form.name, description: form.description } }));
                if (!result.error) {
                    setLocalGroups(prev =>
                        prev.map(g => g.id === editingGroup.id ? { ...g, name: form.name, description: form.description } : g)
                    );
                    closeModal();
                } else {
                    setFormError(result.payload?.message || 'Error al actualizar el grupo');
                }
            } else {
                const result = await dispatch(createGroup({ name: form.name, description: form.description, code: form.code.trim() }));
                if (!result.error) {
                    if (result.payload) {
                        setLocalGroups(prev => [...prev, result.payload]);
                    }
                    closeModal();
                } else {
                    setFormError(result.payload?.message || 'Error al crear el grupo');
                }
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetireSubmit = async () => {
        if (retireReason.trim().length < 20) return;
        setRetiring(true);
        setRetireError('');
        try {
            const result = await dispatch(retireGroup({ id: retiringGroup.id, retireReason: retireReason.trim() }));
            if (!result.error) {
                setLocalGroups(prev =>
                    prev.map(g => g.id === retiringGroup.id ? { ...g, state: 'RETIRED' } : g)
                );
                closeRetireModal();
            } else {
                setRetireError(result.payload?.message || 'Error al retirar el grupo');
            }
        } finally {
            setRetiring(false);
        }
    };

    const getStatusBadge = (group) => {
        const isRetired = group.state === 'RETIRED';
        return (
            <span
                className={isRetired ? 'badge badge-danger' : 'badge'}
                style={{ fontSize: '12px' }}
            >
                {isRetired ? 'RETIRADO' : 'ACTIVO'}
            </span>
        );
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Gestión de Grupos / AGRs</h1>
                    <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>
                        Crear y administrar grupos de acceso del catálogo
                    </p>
                </div>
                <button className="btn btn-primary" onClick={openCreateModal}>
                    + Crear grupo
                </button>
            </div>

            {error && (
                <div className="error-banner" style={{ marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            <Table
                columns={[
                    {
                        key: 'code',
                        label: 'Código',
                        render: (v) => (
                            <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#9ca3af' }}>
                                {v || '—'}
                            </span>
                        ),
                    },
                    { key: 'name', label: 'Nombre', render: (v) => <strong>{v}</strong> },
                    { key: 'description', label: 'Descripción', render: (v) => v || '—' },
                    { key: 'state', label: 'Estado', render: (_, row) => getStatusBadge(row) },
                ]}
                data={localGroups}
                loading={loading && localGroups.length === 0}
                sortable={false}
                actions={[
                    {
                        label: 'Editar',
                        onClick: openEditModal,
                        disabled: (row) => !!row.is_predefined,
                    },
                    {
                        label: 'Retirar',
                        onClick: openRetireModal,
                        hidden: (row) => row.state === 'RETIRED',
                        disabled: (row) => loading || !!row.is_predefined,
                        variant: 'danger',
                    },
                ]}
            />

            {/* Modal crear/editar */}
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
                            {!editingGroup && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#9ca3af' }}>
                                        Código * <span style={{ fontSize: '12px' }}>(ej: operadores_group)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={form.code}
                                        onChange={handleFormChange}
                                        placeholder="ej: operadores_group"
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
                                            fontFamily: 'monospace',
                                        }}
                                    />
                                    {form.code && !CODE_REGEX.test(form.code) && (
                                        <div style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>
                                            Formato: minúsculas, alfanumérico, debe terminar en _group
                                        </div>
                                    )}
                                </div>
                            )}

                            {editingGroup && (
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#9ca3af' }}>
                                        Código (inmutable)
                                    </label>
                                    <input
                                        type="text"
                                        value={editingGroup.code || ''}
                                        readOnly
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #374151',
                                            borderRadius: '4px',
                                            backgroundColor: '#0f172a',
                                            color: '#6b7280',
                                            fontSize: '14px',
                                            boxSizing: 'border-box',
                                            fontFamily: 'monospace',
                                            cursor: 'not-allowed',
                                        }}
                                    />
                                </div>
                            )}

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
                                    autoFocus={!!editingGroup}
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

            {/* Modal retirar grupo */}
            {retiringGroup && (
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
                    onClick={(e) => { if (e.target === e.currentTarget) closeRetireModal(); }}
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
                        <h2 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '18px' }}>
                            Retirar grupo
                        </h2>
                        <p style={{ margin: '0 0 20px 0', color: '#9ca3af', fontSize: '14px' }}>
                            El grupo <strong style={{ color: '#fff' }}>{retiringGroup.name}</strong> pasará a estado RETIRADO.
                            Esta acción requiere justificación.
                        </p>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', color: '#9ca3af' }}>
                                Motivo de retiro * (mínimo 20 caracteres)
                            </label>
                            <textarea
                                value={retireReason}
                                onChange={(e) => setRetireReason(e.target.value)}
                                placeholder="Explique por qué se retira este grupo..."
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
                            {retireReason.length > 0 && retireReason.trim().length < 20 && (
                                <div style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>
                                    El motivo debe tener al menos 20 caracteres ({retireReason.trim().length}/20).
                                </div>
                            )}
                        </div>

                        {retireError && (
                            <div className="error-banner" style={{ marginBottom: '16px' }}>
                                {retireError}
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={closeRetireModal}
                                disabled={retiring}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn btn-primary"
                                style={{ backgroundColor: '#dc2626', borderColor: '#dc2626' }}
                                onClick={handleRetireSubmit}
                                disabled={retiring || retireReason.trim().length < 20}
                            >
                                {retiring ? 'Retirando...' : 'Confirmar retiro'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
