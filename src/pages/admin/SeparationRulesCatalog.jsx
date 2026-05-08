/**
 * SeparationRulesCatalog.jsx
 * IACT v4.0 - Admin Module
 * UC_ADM_01: Gestionar ciclo de vida de Reglas de Separación de Funciones
 */

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAdminSeparationRules,
  createSeparationRule,
  updateSeparationRule,
  toggleSeparationRuleStatus,
  selectAdminSeparationRules,
  selectAdminLoading,
} from '../../redux/slices/admin'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const EMPTY_FORM = { name: '', description: '', group_a: '', group_b: '' }

export default function SeparationRulesCatalog() {
  const dispatch = useDispatch()
  const rules = useSelector(selectAdminSeparationRules)
  const loading = useSelector(selectAdminLoading)

  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    dispatch(fetchAdminSeparationRules())
  }, [dispatch])

  const handleOpenCreate = () => {
    setEditingRule(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowForm(true)
  }

  const handleOpenEdit = (rule) => {
    setEditingRule(rule)
    setForm({
      name: rule.name,
      description: rule.description,
      group_a: Array.isArray(rule.group_a) ? rule.group_a.join(', ') : rule.group_a,
      group_b: Array.isArray(rule.group_b) ? rule.group_b.join(', ') : rule.group_b,
    })
    setFormError(null)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const groupAArr = form.group_a.split(',').map((s) => s.trim()).filter(Boolean)
    const groupBArr = form.group_b.split(',').map((s) => s.trim()).filter(Boolean)

    const overlap = groupAArr.filter((f) => groupBArr.includes(f))
    if (overlap.length > 0) {
      setFormError(`Los grupos A y B no pueden tener funciones en común: ${overlap.join(', ')}`)
      return
    }

    setFormError(null)
    const payload = { ...form, group_a: groupAArr, group_b: groupBArr }
    try {
      if (editingRule) {
        await dispatch(updateSeparationRule({ id: editingRule.id, data: payload })).unwrap()
      } else {
        await dispatch(createSeparationRule(payload)).unwrap()
      }
      setShowForm(false)
      setFeedback({ type: 'success', msg: editingRule ? 'Regla actualizada' : 'Regla creada' })
      setTimeout(() => setFeedback(null), 3000)
    } catch (err) {
      setFormError(err?.message || 'Error al guardar la regla')
    }
  }

  const handleToggleStatus = async (rule) => {
    const result = await dispatch(toggleSeparationRuleStatus(rule.id))
    if (!result.error) {
      setFeedback({ type: 'success', msg: `Regla ${rule.isActive ? 'desactivada' : 'activada'}` })
      setTimeout(() => setFeedback(null), 3000)
    } else {
      setFeedback({ type: 'danger', msg: result.payload?.message ?? 'Error al cambiar estado de la regla' })
    }
  }

  if (loading && rules.length === 0) return <LoadingSpinner />

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Reglas de Separación de Funciones</h1>
        <p className="page-subtitle">UC_ADM_01 — Gestión del catálogo de reglas de separación</p>
        <button className="btn btn-primary" onClick={handleOpenCreate}>
          Nueva regla
        </button>
      </div>

      {feedback && (
        <div className={`alert alert-${feedback.type}`} role="alert">
          {feedback.msg}
        </div>
      )}

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit} aria-label="Formulario regla de separación">
          <h2>{editingRule ? 'Editar regla' : 'Nueva regla'}</h2>

          {formError && (
            <div className="error-banner" role="alert" style={{ marginBottom: '12px' }}>
              {formError}
            </div>
          )}

          <label>
            Nombre
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>
          <label>
            Descripción
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </label>
          <label>
            Grupo A (codenames separados por coma)
            <input
              value={form.group_a}
              onChange={(e) => setForm((f) => ({ ...f, group_a: e.target.value }))}
              placeholder="reports:view, audit:view"
              required
            />
          </label>
          <label>
            Grupo B (codenames separados por coma)
            <input
              value={form.group_b}
              onChange={(e) => setForm((f) => ({ ...f, group_b: e.target.value }))}
              placeholder="access:assign, users:create"
              required
            />
          </label>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingRule ? 'Guardar cambios' : 'Crear regla'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <table className="data-table" aria-label="Reglas de separación de funciones">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.id}>
              <td>{rule.code}</td>
              <td>{rule.name}</td>
              <td>{rule.description}</td>
              <td>
                <span className={`badge badge-${rule.isActive ? 'success' : 'secondary'}`}>
                  {rule.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleOpenEdit(rule)}
                  aria-label={`Editar ${rule.name}`}
                >
                  Editar
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => handleToggleStatus(rule)}
                  aria-label={rule.isActive ? `Desactivar ${rule.name}` : `Activar ${rule.name}`}
                >
                  {rule.isActive ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
          {rules.length === 0 && !loading && (
            <tr>
              <td colSpan={5}>No hay reglas configuradas</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
