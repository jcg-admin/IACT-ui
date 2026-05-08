/**
 * AGRCatalogPage.jsx
 * IACT v4.0 - Admin Module
 * UC_ADM_03: Gestionar composición de AGR de sistema
 */

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAGRCatalog,
  createAGR,
  updateAGR,
  deactivateAGR,
  fetchAGRComposition,
  addFunctionToAGR,
  removeFunctionFromAGR,
  fetchAGRImpact,
  selectAGRs,
  selectAdminLoading,
  selectAGRComposition,
} from '../../redux/slices/admin'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

// Valida formato snake_case para codenames de AGR (ej: basic_operator_group)
const AGR_CODENAME_REGEX = /^[a-z][a-z0-9_]*$/

const EMPTY_FORM = { codename: '', name: '', description: '' }

export default function AGRCatalog() {
  const dispatch = useDispatch()
  const agrs = useSelector(selectAGRs)
  const loading = useSelector(selectAdminLoading)

  const [activeTab, setActiveTab] = useState('catalog')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  // ── Composición state ────────────────────────────────────────────────────
  const [selectedAgrId, setSelectedAgrId] = useState(null)
  const [addCodename, setAddCodename] = useState('')
  const [compositionError, setCompositionError] = useState(null)

  const selectedAgr = agrs.find(a => a.id === selectedAgrId)
  const composition = useSelector(selectAGRComposition(selectedAgrId))

  useEffect(() => {
    dispatch(fetchAGRCatalog())
  }, [dispatch])

  // ── Filtrado local ───────────────────────────────────────────────────────

  const filtered = agrs.filter((agr) => {
    const searchQuery = search.toLowerCase()
    return (
      agr.codename?.toLowerCase().includes(searchQuery) ||
      agr.name?.toLowerCase().includes(searchQuery)
    )
  })

  // ── Formulario CRUD ──────────────────────────────────────────────────────

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
    if (!AGR_CODENAME_REGEX.test(form.codename.trim())) {
      return 'El codename debe tener el formato snake_case (minúsculas, números y guiones bajos).'
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
    }

    if (editingId) {
      dispatch(updateAGR({ id: editingId, data }))
    } else {
      dispatch(createAGR(data))
    }
    closeForm()
  }

  const handleDeactivate = (agr) => {
    if (!window.confirm(`¿Desactivar el AGR "${agr.codename}"? Los usuarios con este agrupador perderán las funciones asociadas.`)) return
    dispatch(deactivateAGR(agr.id))
  }

  // ── Composición handlers ─────────────────────────────────────────────────

  const handleSelectAGR = (agr) => {
    setSelectedAgrId(agr.id)
    setCompositionError(null)
    setAddCodename('')
    dispatch(fetchAGRComposition(agr.id))
    dispatch(fetchAGRImpact(agr.id))
  }

  const handleClosePanel = () => {
    setSelectedAgrId(null)
    setCompositionError(null)
    setAddCodename('')
  }

  const handleAddFunction = async () => {
    if (!addCodename.trim()) return
    try {
      await dispatch(addFunctionToAGR({ agrId: selectedAgrId, functionCodename: addCodename.trim() })).unwrap()
      setAddCodename('')
      setCompositionError(null)
    } catch (err) {
      setCompositionError(err?.message || 'Error al agregar la función')
    }
  }

  const handleRemoveFunction = async (codename) => {
    try {
      await dispatch(removeFunctionFromAGR({ agrId: selectedAgrId, functionCodename: codename })).unwrap()
    } catch (err) {
      setCompositionError(err?.message || 'Error al remover la función')
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  if (loading && agrs.length === 0) return <LoadingSpinner />

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Catálogo de AGRs</h1>
        {activeTab === 'catalog' && (
          <button className="btn btn-primary" onClick={openCreate}>
            Nuevo AGR
          </button>
        )}
      </div>

      {/* Tabs */}
      <div role="tablist" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {['catalog', 'composition'].map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'catalog' ? 'Catálogo' : 'Composición'}
          </button>
        ))}
      </div>

      {/* ── TAB CATÁLOGO ── */}
      {activeTab === 'catalog' && (
        <>
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
                    placeholder="ej: basic_operator_group"
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
            <LoadingSpinner message="Cargando AGRs..." />
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
        </>
      )}

      {/* ── TAB COMPOSICIÓN ── */}
      {activeTab === 'composition' && (
        <>
          <table className="table" aria-label="AGRs disponibles para gestionar composición">
            <thead>
              <tr>
                <th>Codename</th>
                <th>Nombre</th>
                <th>Funciones</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {agrs.map((agr) => (
                <tr key={agr.id}>
                  <td><code>{agr.codename}</code></td>
                  <td>{agr.name}</td>
                  <td>{agr.functions_count ?? '—'}</td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleSelectAGR(agr)}
                      aria-label={`Gestionar composición de ${agr.name}`}
                    >
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Panel de composición inline */}
          {selectedAgrId !== null && selectedAgr && (
            <div
              style={{ marginTop: '20px', padding: '16px', border: '1px solid #374151', borderRadius: '8px', background: '#111827' }}
              aria-label={`Panel composición ${selectedAgr.name}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, color: '#fff' }}>Composición: {selectedAgr.name}</h3>
                <button className="btn btn-secondary" onClick={handleClosePanel} aria-label="Cerrar panel de composición">
                  Cerrar panel
                </button>
              </div>

              {composition.impact && (
                <p style={{ color: '#9ca3af', marginBottom: '12px' }}>
                  Impacto: <strong style={{ color: '#fff' }}>{composition.impact.affected_users}</strong> usuarios afectados
                </p>
              )}

              {compositionError && (
                <div role="alert" style={{ color: '#ef4444', marginBottom: '12px', padding: '8px', background: '#1f2937', borderRadius: '4px' }}>
                  {compositionError}
                </div>
              )}

              {/* Lista de funciones actuales */}
              <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Funciones asignadas</h4>
              {composition.functions && composition.functions.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '16px' }}>
                  {composition.functions.map((fn) => (
                    <li key={fn} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', borderBottom: '1px solid #374151' }}>
                      <code style={{ flex: 1 }}>{fn}</code>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleRemoveFunction(fn)}
                        aria-label={`Remover ${fn} del AGR`}
                      >
                        Remover
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>Sin funciones asignadas.</p>
              )}

              {/* Sección agregar función */}
              <h4 style={{ color: '#9ca3af', marginBottom: '8px' }}>Agregar función</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={addCodename}
                  onChange={(e) => setAddCodename(e.target.value)}
                  placeholder="modulo:accion"
                  aria-label="Codename de función a agregar"
                  style={{ flex: 1, padding: '8px 12px', border: '1px solid #374151', borderRadius: '4px', background: '#1f2937', color: '#fff', fontSize: '13px' }}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleAddFunction}
                  aria-label="Agregar función al AGR"
                >
                  Agregar
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
