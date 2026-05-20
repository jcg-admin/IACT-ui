/**
 * UserManagement Page
 * 
 * Main user management interface with CRUD operations
 * Features: List, Search, Filter, Create, Edit, Delete, Export
 */

import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import reportExporter from '../../../facades/ReportExporter'
import { getNotificationService } from '@api/notificationGateway'
import { assignGroupToUser, revokeGroupFromUser, selectGroups } from '../../../redux/slices/access'
import {
  fetchUsers, createUser, deactivateUser, blockUser, unblockUser,
  selectUsers, selectUsersLoading,
} from '../../../redux/slices/user'
import GroupAssignModal from '../../../components/access/GroupAssignModal'
import ConfirmModal from '../../../components/shared/ConfirmModal'
import UserList from './UserList'
import UserForm from './UserForm'
import './UserManagement.scss'

export default function UserManagement() {
  const dispatch = useDispatch()
  const groups     = useSelector(selectGroups)
  const users      = useSelector(selectUsers)
  const loading    = useSelector(selectUsersLoading)
  const [showForm, setShowForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [groupModal, setGroupModal] = useState({ isOpen: false, mode: 'assign', userId: null })
  const [deactivateModal, setDeactivateModal] = useState({ isOpen: false, userId: null })

  const notify = getNotificationService()

  // Load users on mount via Redux
  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  /**
   * Handle create new user — UC_USR_01 → POST /api/users/create/
   */
  const handleCreateUser = async (userData) => {
    const result = await dispatch(createUser({
      username:   userData.username,
      password:   userData.password,
      email:      userData.email,
      first_name: userData.firstName,
      last_name:  userData.lastName,
    }))
    if (!result.error) {
      notify.success(`Usuario ${userData.username} creado correctamente`)
      setShowForm(false)
    } else {
      notify.error(`Error al crear usuario: ${result.payload?.message ?? 'Error desconocido'}`)
    }
  }

  /**
   * Handle edit user
   */
  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowForm(true)
  }

  /**
   * Handle update user — UC_USR_03 → PATCH /api/users/{id}/
   */
  const handleUpdateUser = async (userData) => {
    if (!selectedUser) return
    const result = await dispatch(
      require('../../../redux/slices/user').patchUser({
        id:   selectedUser.id,
        data: {
          email:      userData.email,
          first_name: userData.firstName,
          last_name:  userData.lastName,
        },
      })
    )
    if (!result.error) {
      notify.success(`Usuario ${userData.username} actualizado correctamente`)
      setShowForm(false)
      setSelectedUser(null)
    } else {
      notify.error(`Error al actualizar: ${result.payload?.message ?? 'Error desconocido'}`)
    }
  }

  // UC_USR_05: bloquear usuario → dispatch thunk
  const handleBlockUser = async (userId) => {
    const result = await dispatch(blockUser(userId))
    if (!result.error) {
      notify.success('Usuario bloqueado correctamente')
    } else {
      notify.error(`Error al bloquear usuario: ${result.payload?.message ?? 'Error'}`)
    }
  }

  // UC_USR_06: desbloquear usuario → dispatch thunk
  const handleUnblockUser = async (userId) => {
    const result = await dispatch(unblockUser(userId))
    if (!result.error) {
      notify.success('Usuario desbloqueado correctamente')
    } else {
      notify.error(`Error al desbloquear usuario: ${result.payload?.message ?? 'Error'}`)
    }
  }

  /**
   * Handle deactivate user (baja lógica — UC_USR_04)
   */
  const handleDeactivateUser = (userId) => {
    setDeactivateModal({ isOpen: true, userId })
  }

  const handleConfirmDeactivate = async () => {
    const { userId } = deactivateModal
    setDeactivateModal({ isOpen: false, userId: null })
    const result = await dispatch(deactivateUser(userId))
    if (!result.error) {
      notify.success('Usuario dado de baja correctamente')
    } else {
      notify.error(`Error al dar de baja: ${result.payload?.message ?? 'Error'}`)
    }
  }

  /**
   * Handle export to Excel
   */
  const handleExportExcel = async () => {
    try {
      const filteredUsers = getFilteredUsers()

      const result = await reportExporter.exportAsExcel(
        filteredUsers.map(u => ({
          ID: u.id,
          Username: u.username,
          Email: u.email,
          'First Name': u.first_name,
          'Last Name': u.last_name,
          Grupos: (u.access_groups || []).join(', '),
          Status: u.status,
          'Created': new Date(u.created_at).toLocaleDateString()
        })),
        {
          filename: 'users.xlsx',
          headers: ['ID', 'Username', 'Email', 'First Name', 'Last Name', 'Role', 'Status', 'Created']
        }
      )

      notify.success(`Exported ${filteredUsers.length} users to Excel`)
    } catch (error) {
      notify.error(`Export failed: ${error.message}`)
    }
  }

  /**
   * Handle batch export (Excel + CSV)
   */
  const handleBatchExport = async () => {
    try {
      const filteredUsers = getFilteredUsers()
      const userData = filteredUsers.map(u => ({
        ID: u.id,
        Username: u.username,
        Email: u.email,
        'First Name': u.first_name,
        'Last Name': u.last_name,
        Role: u.role,
        Status: u.status,
        'Created': new Date(u.created_at).toLocaleDateString()
      }))

      const result = await reportExporter.batchExport([
        { data: userData, format: 'xlsx', name: 'users-excel' },
        { data: userData, format: 'csv', name: 'users-csv' }
      ])

      notify.success(`Exported ${filteredUsers.length} users in multiple formats`)
    } catch (error) {
      notify.error(`Batch export failed: ${error.message}`)
    }
  }

  const handleGroupConfirm = (groupId) => {
    if (!groupModal.userId) return
    if (groupModal.mode === 'assign') {
      dispatch(assignGroupToUser({ userId: groupModal.userId, groupId }))
    } else {
      dispatch(revokeGroupFromUser({ userId: groupModal.userId, groupId }))
    }
    setGroupModal({ isOpen: false, mode: 'assign', userId: null })
  }

  const getFilteredUsers = () => {
    return users.filter(user =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const filteredUsers = getFilteredUsers()

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage system users, roles, and permissions</p>
      </div>

      {!showForm ? (
        <>
          {/* Search and Filter Bar */}
          <div className="user-controls">
            <div className="search-group">
              <input
                type="text"
                placeholder="Search by username, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="action-buttons">
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setShowForm(true)
                }}
                className="btn btn-primary"
              >
                Create User
              </button>
              <button
                onClick={handleExportExcel}
                disabled={filteredUsers.length === 0}
                className="btn btn-secondary"
              >
                Export Excel
              </button>
              <button
                onClick={handleBatchExport}
                disabled={filteredUsers.length === 0}
                className="btn btn-secondary"
              >
                Batch Export
              </button>
            </div>
          </div>

          {/* User List */}
          <UserList
            users={filteredUsers}
            loading={loading}
            onEdit={handleEditUser}
            onDeactivate={handleDeactivateUser}
            onBlock={handleBlockUser}
            onUnblock={handleUnblockUser}
          />

          {/* Group assign/revoke buttons per user */}
          {!loading && filteredUsers.map(user => (
            <div key={`group-actions-${user.id}`} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button
                aria-label="Asignar Grupo"
                onClick={() => setGroupModal({ isOpen: true, mode: 'assign', userId: user.id })}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '2px 8px' }}
              >
                Asignar Grupo
              </button>
              <button
                aria-label="Revocar Grupo"
                onClick={() => setGroupModal({ isOpen: true, mode: 'revoke', userId: user.id })}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '2px 8px' }}
              >
                Revocar Grupo
              </button>
            </div>
          ))}

          <div className="results-info">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </>
      ) : (
        // User Form (Create/Edit Mode)
        <UserForm
          user={selectedUser}
          onSubmit={selectedUser ? handleUpdateUser : handleCreateUser}
          onCancel={() => {
            setShowForm(false)
            setSelectedUser(null)
          }}
          onDeactivate={handleDeactivateUser}
        />
      )}

      <GroupAssignModal
        isOpen={groupModal.isOpen}
        mode={groupModal.mode}
        groups={groups || []}
        onConfirm={handleGroupConfirm}
        onClose={() => setGroupModal({ isOpen: false, mode: 'assign', userId: null })}
      />

      <ConfirmModal
        isOpen={deactivateModal.isOpen}
        onClose={() => setDeactivateModal({ isOpen: false, userId: null })}
        onConfirm={handleConfirmDeactivate}
        title="Dar de baja al usuario"
        message="¿Confirmar dar de baja al usuario? Esta acción no se puede deshacer."
        confirmLabel="Dar de baja"
        variant="danger"
      />
    </div>
  )
}
