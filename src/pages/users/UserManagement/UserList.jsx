/**
 * UserList Component
 * Muestra usuarios en tabla con ordenamiento, paginación y baja lógica (UC-USR-04).
 * UC_USR_05/06: botones Bloquear/Desbloquear con modal de confirmación.
 */

import React, { useState } from 'react'
import userAuth from '../../../facades/UserIdentity'
import ConfirmModal from '../../../components/shared/ConfirmModal'
import './UserList.scss'

const STATE_BADGE = {
  ACTIVE: 'badge-primary',
  INACTIVE: 'badge-secondary',
  BLOCKED: 'badge-warning',
  ELIMINATED: 'badge-danger',
}

export default function UserList({ users, loading, onEdit, onDeactivate, onBlock, onUnblock }) {
  const [sortField, setSortField] = useState('username')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, user: null })
  const itemsPerPage = 10

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    if (typeof aValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage)

  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null
    return <span className="sort-indicator">{sortOrder === 'asc' ? '▲' : '▼'}</span>
  }

  const handleConfirm = () => {
    const { type, user } = confirmModal
    if (type === 'block') onBlock(user.id)
    else if (type === 'unblock') onUnblock(user.id)
    setConfirmModal({ open: false, type: null, user: null })
  }

  if (loading) {
    return <div className="user-list loading">Cargando usuarios...</div>
  }

  if (users.length === 0) {
    return (
      <div className="user-list empty">
        <p>No se encontraron usuarios. Crea el primero para empezar.</p>
      </div>
    )
  }

  return (
    <div className="user-list">
      <table className="users-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('username')} className="sortable">
              Usuario <SortIndicator field="username" />
            </th>
            <th onClick={() => handleSort('email')} className="sortable">
              Email <SortIndicator field="email" />
            </th>
            <th onClick={() => handleSort('first_name')} className="sortable">
              Nombre <SortIndicator field="first_name" />
            </th>
            <th>Grupos de acceso</th>
            <th onClick={() => handleSort('state')} className="sortable">
              Estado <SortIndicator field="state" />
            </th>
            <th onClick={() => handleSort('created_at')} className="sortable">
              Creado <SortIndicator field="created_at" />
            </th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((user) => (
            <tr key={user.id} className={`state-${user.state?.toLowerCase()}`}>
              <td className="username">{user.username}</td>
              <td className="email">{user.email}</td>
              <td className="name">{user.first_name} {user.last_name}</td>
              <td className="access-groups">
                {(user.access_groups || []).length > 0
                  ? (user.access_groups || []).join(', ')
                  : <span className="text-muted">—</span>}
              </td>
              <td className="state">
                <span className={`badge ${STATE_BADGE[user.state] || 'badge-secondary'}`}>
                  {user.state}
                </span>
              </td>
              <td className="created">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="actions">
                <button
                  onClick={() => onEdit(user)}
                  className="btn-action btn-edit"
                  title="Editar usuario"
                >
                  Editar
                </button>
                {user.state === 'ACTIVE' && userAuth.can('users:block') && (
                  <button
                    onClick={() => setConfirmModal({ open: true, type: 'block', user })}
                    className="btn-action btn-block"
                    title="Bloquear usuario"
                  >
                    Bloquear
                  </button>
                )}
                {user.state === 'BLOCKED' && userAuth.can('users:unblock') && (
                  <button
                    onClick={() => setConfirmModal({ open: true, type: 'unblock', user })}
                    className="btn-action btn-unblock"
                    title="Desbloquear usuario"
                  >
                    Desbloquear
                  </button>
                )}
                {user.state !== 'ELIMINATED' && (
                  <button
                    onClick={() => onDeactivate(user.id)}
                    className="btn-action btn-deactivate"
                    title="Dar de baja"
                  >
                    Dar de baja
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn-pagination"
          >
            Anterior
          </button>
          <div className="page-info">
            Página {currentPage} de {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn-pagination"
          >
            Siguiente
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, type: null, user: null })}
        onConfirm={handleConfirm}
        title={confirmModal.type === 'block' ? `Bloquear a ${confirmModal.user?.username}` : `Desbloquear a ${confirmModal.user?.username}`}
        message={
          confirmModal.type === 'block'
            ? 'El usuario no podrá iniciar sesión mientras esté bloqueado.'
            : 'El usuario recuperará el acceso al sistema.'
        }
        confirmLabel={confirmModal.type === 'block' ? 'Bloquear' : 'Desbloquear'}
        variant={confirmModal.type === 'block' ? 'danger' : 'default'}
      />
    </div>
  )
}
