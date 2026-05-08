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
  transitionMenuItemStatus,
  selectMenuItems,
  selectAdminLoading,
} from '../../redux/slices/admin'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const STATUS_TRANSITIONS = {
  DRAFT:       ['ACTIVE'],
  ACTIVE:      ['DEPRECATED'],
  DEPRECATED:  ['ACTIVE', 'ARCHIVED'],
  ARCHIVED:    ['ACTIVE'],
}

const STATUS_LABELS = { DRAFT: 'Borrador', ACTIVE: 'Activo', DEPRECATED: 'Deprecado', ARCHIVED: 'Archivado' }
const STATUS_BADGE  = { DRAFT: 'secondary', ACTIVE: 'success', DEPRECATED: 'warning', ARCHIVED: 'danger' }

const EMPTY_FORM = { label: '', icon: '', route_path: '', display_order: '', function_codename: '', parent: '' }

export default function MenuItemCatalog() {
  const dispatch = useDispatch()
  const items = useSelector(selectMenuItems)
  const loading = useSelector(selectAdminLoading)

  const [activeTab, setActiveTab] = useState('catalog')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [feedback, setFeedback] = useState(null)

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

  const handleTransition = async (item, newStatus) => {
    const result = await dispatch(transitionMenuItemStatus({ id: item.id, newStatus }))
    if (!result.error) {
      showFeedback(`${item.label}: ${STATUS_LABELS[newStatus]}`)
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

      {activeTab === 'catalog' && (
        <>
          <button className="btn btn-primary" onClick={handleOpenCreate} style={{ marginBottom: '12px' }}>
            Nuevo item
          </button>

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

          <table className="data-table" aria-label="Menú items">
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
                  <td>{item.display_order}</td>
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
        </>
      )}

      {activeTab === 'lifecycle' && (
        <table className="data-table" aria-label="Lifecycle de menú items">
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
                    {transitions.length === 0 && <span className="text-muted">Sin transiciones</span>}
                  </td>
                </tr>
              )
            })}
            {items.length === 0 && !loading && (
              <tr><td colSpan={3}>No hay items</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
