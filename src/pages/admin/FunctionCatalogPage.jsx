/**
 * FunctionCatalogPage.jsx
 * IACT v4.0 - Admin Module
 * Administración del catálogo de funciones RBAC.
 */

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchFunctions,
  createFunction,
  updateFunction,
  deactivateFunction,
  selectFunctions,
  selectAdminLoading,
  selectAdminError,
} from '../../redux/slices/adminSlice'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

// Valida el formato sistema.dominio.recurso.accion (4 segmentos separados por punto)
const CODENAME_REGEX = /^[a-z0-9_]+\.[a-z0-9_]+\.[a-z0-9_]+\.[a-z0-9_]+$/

const EMPTY_FORM = { codename: '', name: '', description: '', domain: '' }

export default function FunctionCatalogPage() {
  const dispatch = useDispatch()
  const functions = useSelector(selectFunctions)
  const loading = useSelector(selectAdminLoading)
  const error = useSelector(selectAdminError)

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    dispatch(fetchFunctions())
  }, [dispatch])

  // ── Filtrado local ───────────────────────────────────────────────────────

  const filtered = functions.filter((fn) => {
    const q = search.toLowerCase()
    return (
      fn.codename?.toLowerCase().includes(q) ||
      fn.name?.toLowerCase().includes(q)
    )
  })

  // ── Formulario ───────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (fn) => {
    setEditingId(fn.id)
    setForm({
      codename: fn.codename ?? '',
      name: fn.name ?? '',
      description: fn.description ?? '',
      domain: fn.domain ?? '',
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
    if (!CODENAME_REGEX.test(form.codename.trim())) {
      return 'El codename debe tener el formato sistema.dominio.recurso.accion (solo minúsculas, números y guiones bajos).'
    }
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
      domain: form.domain.trim(),
    }

    if (editingId) {
      dispatch(updateFunction({ id: editingId, data }))
    } else {
      dispatch(createFunction(data))
    }
    closeForm()
  }

  // ── Desactivar ───────────────────────────────────────────────────────────

  const handleDeactivate = (fn) => {
    if (!window.confirm(`¿Desactivar la función "${fn.codename}"? Esta acción puede afectar permisos activos.`)) return
    dispatch(deactivateFunction(fn.id))
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Catálogo de Funciones RBAC</h1>
        <button className="btn btn-primary" onClick={openCreate}>
          Nueva función
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
            {editingId ? 'Editar función' : 'Nueva función'}
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
                placeholder="sistema.dominio.recurso.accion"
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
                placeholder="Nombre descriptivo"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #374151', borderRadius: '4px', background: '#1f2937', color: '#fff', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                Dominio
              </label>
              <input
                name="domain"
                value={form.domain}
                onChange={handleChange}
                placeholder="Ej: acceso, reportes, pipelines"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #374151', borderRadius: '4px', background: '#1f2937', color: '#fff', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#9ca3af' }}>
                Descripción
              </label>
              <input
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Descripción de la función"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #374151', borderRadius: '4px', background: '#1f2937', color: '#fff', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Guardar cambios' : 'Crear función'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={closeForm}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Tabla */}
      {loading ? (
        <LoadingSpinner message="Cargando funciones..." />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          {search ? 'No hay funciones que coincidan con la búsqueda.' : 'No hay funciones registradas.'}
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Codename</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Dominio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((fn) => (
              <tr key={fn.id}>
                <td><code>{fn.codename}</code></td>
                <td>{fn.name}</td>
                <td>{fn.description || '—'}</td>
                <td>{fn.domain || '—'}</td>
                <td>
                  <span className={fn.active === false ? 'badge badge-danger' : 'badge'}>
                    {fn.active === false ? 'INACTIVE' : 'ACTIVE'}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => openEdit(fn)}
                  >
                    Editar
                  </button>
                  {fn.active !== false && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleDeactivate(fn)}
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
