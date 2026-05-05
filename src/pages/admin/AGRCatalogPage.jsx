/**
 * AGRCatalogPage.jsx
 * IACT v4.0 - Admin Module
 * Administración de AGRs (Agrupadores de Funciones Relacionadas).
 */

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAGRCatalog,
  createAGR,
  updateAGR,
  deactivateAGR,
  selectAGRs,
  selectAdminLoading,
  selectAdminError,
} from '../../redux/slices/adminSlice'

const EMPTY_FORM = { codename: '', name: '', description: '' }

export default function AGRCatalogPage() {
  const dispatch = useDispatch()
  const agrs = useSelector(selectAGRs)
  const loading = useSelector(selectAdminLoading)
  const error = useSelector(selectAdminError)

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    dispatch(fetchAGRCatalog())
  }, [dispatch])

  // ── Filtrado local ───────────────────────────────────────────────────────

  const filtered = agrs.filter((agr) => {
    const q = search.toLowerCase()
    return (
      agr.codename?.toLowerCase().includes(q) ||
      agr.name?.toLowerCase().includes(q)
    )
  })

  // ── Formulario ───────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (agr) => {
    setEditingId(agr.id)
    setForm({
      codename: agr.codename ?? '',
      name: agr.name ?? '',
      description: agr.description ?? '',
    })
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    if (!form.codename.trim()) return 'El codename es requerido.'
    if (!form.name.trim()) return 'El nombre es requerido.'
    return ''
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setFormError(validationError)
      return
    }

    const data = {
      codename: form.codename.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
    }

    if (editingId) {
      dispatch(updateAGR({ id: editingId, data }))
    } else {
      dispatch(createAGR(data))
    }
    closeForm()
  }

  // ── Desactivar ───────────────────────────────────────────────────────────

  const handleDeactivate = (agr) => {
    if (!window.confirm(`¿Desactivar el AGR "${agr.codename}"? Los usuarios con este agrupador perderán las funciones asociadas.`)) return
    dispatch(deactivateAGR(agr.id))
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Catálogo de AGRs</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          Nuevo AGR
        </button>
      </div>

      {error && (
        <div className="error-banner">
          Error: {error}
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          className="search-input"
          type="text"
          placeholder="Buscar por codename o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Formulario inline create/edit */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '16px', padding: '16px', border: '1px solid #374151', borderRadius: '8px', background: '#111827' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>
            {editingId ? 'Editar AGR' : 'Nuevo AGR'}
          </h3>

          {formError && (
            <div className="error-banner" style={{ marginBottom: '12px' }}>
              {formError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                Codename <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                name="codename"
                value={form.codename}
                onChange={handleChange}
                placeholder="Ej: MANAGER, OPERATOR"
                disabled={!!editingId}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #374151', borderRadius: '4px', background: '#1f2937', color: '#fff', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                Nombre <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Nombre descriptivo del agrupador"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #374151', borderRadius: '4px', background: '#1f2937', color: '#fff', fontSize: '13px' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                Descripción
              </label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Propósito y alcance del agrupador"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #374151', borderRadius: '4px', background: '#1f2937', color: '#fff', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Guardar cambios' : 'Crear AGR'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={closeForm}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="loading-state">Cargando AGRs...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {search ? 'No hay AGRs que coincidan con la búsqueda.' : 'No hay AGRs registrados.'}
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Codename</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((agr) => (
              <tr key={agr.id}>
                <td><code>{agr.codename}</code></td>
                <td>{agr.name}</td>
                <td>{agr.description || '—'}</td>
                <td>
                  <span className={agr.active === false ? 'badge badge-danger' : 'badge'}>
                    {agr.active === false ? 'INACTIVE' : 'ACTIVE'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => openEdit(agr)}
                  >
                    Editar
                  </button>
                  {agr.active !== false && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDeactivate(agr)}
                    >
                      Desactivar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
