/**
 * MenuItemCatalog.jsx
 * IACT v4.0 - Admin Module
 * UC_ADM_04: Gestionar catálogo de MenuItems
 * UC_ADM_05: Gestionar lifecycle de MenuItem (DRAFT → ACTIVE → DEPRECATED → ARCHIVED)
 */

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchMenuItems,
  createMenuItem,
  updateMenuItem,
  publishMenuItem,
  deprecateMenuItem,
  reactivateMenuItem,
  archiveMenuItem,
  bulkReorderMenuItems,
  blockAutoArchive,
  unblockAutoArchive,
  selectMenuItems,
  selectAdminLoading,
} from '../../redux/slices/admin'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import Modal from '../../components/shared/Modal'

const STATUS_TRANSITIONS = {
  DRAFT:       ['ACTIVE'],
  ACTIVE:      ['DEPRECATED'],
  DEPRECATED:  ['ACTIVE', 'ARCHIVED'],
  ARCHIVED:    ['ACTIVE'],
}

const STATUS_LABELS = { DRAFT: 'Borrador', ACTIVE: 'Activo', DEPRECATED: 'Deprecado', ARCHIVED: 'Archivado' }
const STATUS_BADGE  = { DRAFT: 'secondary', ACTIVE: 'success', DEPRECATED: 'warning', ARCHIVED: 'danger' }

const EMPTY_FORM = { label: '', icon: '', route_path: '', display_order: '', function_codename: '', parent: '' }
const BLOCK_REASON_MIN = 20

export default function MenuItemCatalog() {
  const dispatch = useDispatch()
  const items = useSelector(selectMenuItems)
  const loading = useSelector(selectAdminLoading)

  const [activeTab, setActiveTab] = useState('catalog')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [feedback, setFeedback] = useState(null)

  // Reorder state
  const [reorderMode, setReorderMode] = useState(false)
  const [orderValues, setOrderValues] = useState({})
  const [reorderError, setReorderError] = useState(null)

  // Lifecycle transition errors
  const [transitionErrors, setTransitionErrors] = useState({})

  // Block-archive modal
  const [blockArchiveModal, setBlockArchiveModal] = useState({ isOpen: false, itemId: null, reason: '', error: null })

  useEffect(() => {
    dispatch(fetchMenuItems())
  }, [dispatch])

  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 3000)
  }

  const handleOpenCreate = () => {
    setEditingItem(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setForm({
      label: item.label,
      icon: item.icon,
      route_path: item.route_path,
      display_order: item.display_order,
      function_codename: item.function_codename,
      parent: item.parent ?? '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const payload = { ...form, display_order: parseInt(form.display_order, 10) || 0 }
    let result
    if (editingItem) {
      result = await dispatch(updateMenuItem({ id: editingItem.id, data: payload }))
    } else {
      result = await dispatch(createMenuItem(payload))
    }
    if (!result.error) {
      setShowForm(false)
      showFeedback(editingItem ? 'Item actualizado' : 'Item creado')
    }
  }

  // ── Reorder handlers ─────────────────────────────────────────────────────

  const enterReorderMode = () => {
    setOrderValues(Object.fromEntries(items.map((i) => [i.id, i.display_order])))
    setReorderError(null)
    setReorderMode(true)
  }

  const handleSaveOrder = async () => {
    const payload = items.map((i) => ({ id: i.id, display_order: orderValues[i.id] ?? i.display_order }))
    try {
      await dispatch(bulkReorderMenuItems(payload)).unwrap()
      setReorderMode(false)
      showFeedback('Orden actualizado')
    } catch (err) {
      setReorderError(err?.message || 'Error al guardar el orden')
    }
  }

  // ── Lifecycle transition ─────────────────────────────────────────────────

  const handleTransition = async (item, newStatus) => {
    const thunk = newStatus === 'ACTIVE'
      ? (item.status === 'DRAFT' ? publishMenuItem(item.id) : reactivateMenuItem(item.id))
      : newStatus === 'DEPRECATED'
        ? deprecateMenuItem(item.id)
        : archiveMenuItem(item.id)
    try {
      await dispatch(thunk).unwrap()
      setTransitionErrors((e) => ({ ...e, [item.id]: null }))
      showFeedback(`${item.label}: ${STATUS_LABELS[newStatus]}`)
    } catch (err) {
      setTransitionErrors((e) => ({ ...e, [item.id]: err?.message || 'Error en la transición' }))
    }
  }

  // ── Block-archive handlers ────────────────────────────────────────────────

  const handleConfirmBlockArchive = async () => {
    try {
      await dispatch(blockAutoArchive({ id: blockArchiveModal.itemId, blockReason: blockArchiveModal.reason })).unwrap()
      setBlockArchiveModal({ isOpen: false, itemId: null, reason: '', error: null })
      showFeedback('Archivado bloqueado correctamente')
    } catch (err) {
      setBlockArchiveModal((m) => ({ ...m, error: err?.message || 'Error al bloquear el archivado' }))
    }
  }

  const handleUnblockArchive = async (itemId) => {
    try {
      await dispatch(unblockAutoArchive(itemId)).unwrap()
      showFeedback('Bloqueo de archivado desactivado')
    } catch (err) {
      setTransitionErrors((e) => ({ ...e, [itemId]: err?.message || 'Error al desbloquear el archivado' }))
    }
  }

  if (loading && items.length === 0) return <LoadingSpinner />

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Catálogo de Menú</h1>
        <p className="page-subtitle">UC_ADM_04/05 — Gestión de MenuItems y su ciclo de vida</p>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type}`} role="alert">
          {feedback.msg}
        </div>
      )}

      <div role="tablist" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['catalog', 'lifecycle'].map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'catalog' ? 'Catálogo' : 'Lifecycle'}
          </button>
        ))}
      </div>

      {/* ── TAB CATÁLOGO ── */}
      {activeTab === 'catalog' && (
        <>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button className="btn btn-primary" onClick={handleOpenCreate}>
              Nuevo item
            </button>
            {!reorderMode && (
              <button className="btn btn-secondary" onClick={enterReorderMode}>
                Reordenar
              </button>
            )}
          </div>

          {showForm && (
            <form className="form-card" onSubmit={handleSubmit} aria-label="Formulario MenuItem">
              <h2>{editingItem ? 'Editar item' : 'Nuevo item'}</h2>
              {[
                { key: 'label', label: 'Etiqueta', placeholder: 'Dashboard' },
                { key: 'icon', label: 'Ícono', placeholder: 'grid-alt' },
                { key: 'route_path', label: 'Ruta', placeholder: '/dashboard' },
                { key: 'display_order', label: 'Orden', placeholder: '1' },
                { key: 'function_codename', label: 'Función RBAC', placeholder: 'reports:view' },
              ].map(({ key, label, placeholder }) => (
                <label key={key}>
                  {label}
                  <input
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder}
                    required={key !== 'display_order'}
                  />
                </label>
              ))}
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Guardar' : 'Crear'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Inline table kept: reorder mode uses inline number inputs per cell, incompatible with Table component actions prop */}
          <table className="table" aria-label="Menú items">
            <thead>
              <tr>
                <th>Etiqueta</th>
                <th>Ruta</th>
                <th>Función RBAC</th>
                <th>Orden</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.label}</td>
                  <td>{item.route_path}</td>
                  <td>{item.function_codename}</td>
                  <td>
                    {reorderMode ? (
                      <input
                        type="number"
                        value={orderValues[item.id] ?? item.display_order}
                        onChange={(e) =>
                          setOrderValues((v) => ({ ...v, [item.id]: parseInt(e.target.value, 10) }))
                        }
                        style={{ width: '60px' }}
                        aria-label={`Orden de ${item.label}`}
                      />
                    ) : (
                      item.display_order
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${STATUS_BADGE[item.status] || 'secondary'}`}>
                      {STATUS_LABELS[item.status] || item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleOpenEdit(item)}
                      aria-label={`Editar ${item.label}`}
                      disabled={item.status === 'ARCHIVED'}
                      aria-disabled={item.status === 'ARCHIVED'}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !loading && (
                <tr><td colSpan={6}>No hay items configurados</td></tr>
              )}
            </tbody>
          </table>

          {reorderMode && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {reorderError && (
                <div className="error-banner" role="alert">{reorderError}</div>
              )}
              <button className="btn btn-primary" onClick={handleSaveOrder}>
                Guardar orden
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => { setReorderMode(false); setReorderError(null) }}
              >
                Cancelar reorden
              </button>
            </div>
          )}
        </>
      )}

      {/* ── TAB LIFECYCLE ── */}
      {activeTab === 'lifecycle' && (
        <>
          {/* Inline table kept: lifecycle transition buttons per row need per-item state (transitionErrors), incompatible with Table component actions prop */}
          <table className="table" aria-label="Lifecycle de menú items">
            <thead>
              <tr>
                <th>Etiqueta</th>
                <th>Estado actual</th>
                <th>Transiciones disponibles</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const transitions = STATUS_TRANSITIONS[item.status] || []
                return (
                  <tr key={item.id}>
                    <td>{item.label}</td>
                    <td>
                      <span className={`badge badge-${STATUS_BADGE[item.status] || 'secondary'}`}>
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>
                    <td>
                      {transitions.map((t) => (
                        <button
                          key={t}
                          className="btn btn-sm btn-outline"
                          onClick={() => handleTransition(item, t)}
                          aria-label={`Transicionar ${item.label} a ${STATUS_LABELS[t]}`}
                        >
                          → {STATUS_LABELS[t]}
                        </button>
                      ))}
                      {item.status === 'DEPRECATED' && !item.block_auto_archive && (
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() =>
                            setBlockArchiveModal({ isOpen: true, itemId: item.id, reason: '', error: null })
                          }
                          aria-label={`Bloquear archivado de ${item.label}`}
                        >
                          Bloquear archivado
                        </button>
                      )}
                      {item.status === 'DEPRECATED' && item.block_auto_archive && (
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleUnblockArchive(item.id)}
                          aria-label={`Desbloquear archivado de ${item.label}`}
                        >
                          Desbloquear archivado
                        </button>
                      )}
                      {transitions.length === 0 && item.status !== 'DEPRECATED' && (
                        <span className="text-muted">Sin transiciones</span>
                      )}
                      {transitionErrors[item.id] && (
                        <div className="error-banner" role="alert">
                          {transitionErrors[item.id]}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {items.length === 0 && !loading && (
                <tr><td colSpan={3}>No hay items</td></tr>
              )}
            </tbody>
          </table>

          <Modal
            isOpen={blockArchiveModal.isOpen}
            onClose={() => setBlockArchiveModal({ isOpen: false, itemId: null, reason: '', error: null })}
            title="Bloquear archivado automático"
            size="sm"
            footer={
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => setBlockArchiveModal({ isOpen: false, itemId: null, reason: '', error: null })}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  disabled={blockArchiveModal.reason.length < BLOCK_REASON_MIN}
                  onClick={handleConfirmBlockArchive}
                >
                  Confirmar bloqueo
                </button>
              </>
            }
          >
            <textarea
              aria-label="Razón para bloquear el archivado"
              maxLength={500}
              value={blockArchiveModal.reason}
              onChange={(e) => setBlockArchiveModal((m) => ({ ...m, reason: e.target.value }))}
              placeholder="Describe el motivo del bloqueo (mínimo 20 caracteres)..."
              rows={3}
              style={{ width: '100%', padding: '8px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '4px' }}
            />
            <small style={{ color: '#9ca3af' }}>
              {blockArchiveModal.reason.length}/500 · mínimo {BLOCK_REASON_MIN}
            </small>
            {blockArchiveModal.error && (
              <div className="error-banner" role="alert">
                {blockArchiveModal.error}
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  )
}
