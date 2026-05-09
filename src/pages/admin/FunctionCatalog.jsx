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
} from '../../redux/slices/admin'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import ConfirmModal from '../../components/shared/ConfirmModal'

// Valida el formato modulo:accion definido en RBAC v5.6.0
const CODENAME_REGEX = /^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$/

const EMPTY_FORM = { codename: '', name: '', description: '', domain: '' }

export default function FunctionCatalog() {
  const dispatch = useDispatch()
  const functions = useSelector(selectFunctions)
  const loading = useSelector(selectAdminLoading)

  const [search, setSearch] = useState('')
  const [filterDomain, setFilterDomain] = useState('')
  const [filterActive, setFilterActive] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [deactivateWarning, setDeactivateWarning] = useState(null)
  const [deactivateError, setDeactivateError] = useState(null)
  const [deactivateModal, setDeactivateModal] = useState({ isOpen: false, fn: null })

  useEffect(() => {
    dispatch(fetchFunctions())
  }, [dispatch])

  // ── Filtrado local ───────────────────────────────────────────────────────

  const filtered = functions.filter((fn) => {
    const searchQuery = search.toLowerCase()
    const matchesSearch =
      fn.codename?.toLowerCase().includes(searchQuery) ||
      fn.name?.toLowerCase().includes(searchQuery)
    const matchesDomain = !filterDomain || fn.domain === filterDomain
    const matchesActive =
      !filterActive ||
      (filterActive === 'active' ? fn.active !== false : fn.active === false)
    return matchesSearch && matchesDomain && matchesActive
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
      return 'El codename debe tener el formato modulo:accion (minúsculas, números y guiones bajos).'
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
    setDeactivateModal({ isOpen: true, fn })
  }

  const handleConfirmDeactivate = async () => {
    const fn = deactivateModal.fn
    setDeactivateModal({ isOpen: false, fn: null })
    setDeactivateWarning(null)
    setDeactivateError(null)
    try {
      const result = await dispatch(deactivateFunction(fn.id)).unwrap()
      if (result.warnings?.length) {
        setDeactivateWarning(`La función "${fn.codename}" se desactivó, pero tiene asignaciones activas (${result.affected_users ?? '?'} usuario(s) afectado(s)). Las asignaciones existentes no se renovarán.`)
      }
    } catch (err) {
      setDeactivateError(err?.message ?? 'Error al desactivar la función')
    }
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

      {deactivateWarning && (
        <div className="alert alert-warning" role="alert">
          {deactivateWarning}
        </div>
      )}
      {deactivateError && (
        <div className="error-banner" role="alert">
          {deactivateError}
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="search-bar" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="search-input"
          type="text"
          placeholder="Buscar por codename o nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1 }}
        />
        <select
          value={filterDomain}
          onChange={(e) => setFilterDomain(e.target.value)}
          aria-label="Filtrar por dominio"
          style={{ padding: '8px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '4px' }}
        >
          <option value="">Todos los dominios</option>
          {[...new Set(functions.map((f) => f.domain).filter(Boolean))].sort().map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value)}
          aria-label="Filtrar por estado"
          style={{ padding: '8px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '4px' }}
        >
          <option value="">Todos los estados</option>
          <option value="active">Solo activas</option>
          <option value="inactive">Solo inactivas</option>
        </select>
      </div>

      {/* Formulario inline create/edit */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '16px', padding: '16px', border: '1px solid #374151', borderRadius: '8px', background: '#111827' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#fff' }}>
            {editingId ? 'Editar función' : 'Nueva función'}
          </h3>

          {formError && (
            <div className="error-banner" role="alert">
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
                placeholder="modulo:accion"
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

      <ConfirmModal
        isOpen={deactivateModal.isOpen}
        onClose={() => setDeactivateModal({ isOpen: false, fn: null })}
        onConfirm={handleConfirmDeactivate}
        title="Desactivar función"
        message={`¿Desactivar la función "${deactivateModal.fn?.codename}"? Esta acción puede afectar permisos activos.`}
        confirmLabel="Desactivar"
        variant="warning"
      />
    </div>
  )
}
