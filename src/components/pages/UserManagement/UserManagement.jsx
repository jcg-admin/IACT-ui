/**
 * UserManagement Page
 * 
 * Main user management interface with CRUD operations
 * Features: List, Search, Filter, Create, Edit, Delete, Export
 */

import React, { useState, useEffect } from 'react'
import userAuth from '../../../facades/UserAuth'
import reportExporter from '../../../facades/ReportExporter'
import { getNotificationService } from '@services/notificationService'
import UserList from './UserList'
import UserForm from './UserForm'
import './UserManagement.scss'

export default function UserManagement() {
  // State
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  const notify = getNotificationService()

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  /**
   * Load users list
   * In production, would call a service
   */
  const loadUsers = async () => {
    try {
      setLoading(true)
      
      // Mock data - in production, call API
      const mockUsers = [
        {
          id: '1',
          username: 'john_doe',
          email: 'john@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'Admin',
          status: 'Active',
          created_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          username: 'jane_smith',
          email: 'jane@example.com',
          first_name: 'Jane',
          last_name: 'Smith',
          role: 'User',
          status: 'Active',
          created_at: '2024-02-20T14:45:00Z'
        },
        {
          id: '3',
          username: 'bob_wilson',
          email: 'bob@example.com',
          first_name: 'Bob',
          last_name: 'Wilson',
          role: 'User',
          status: 'Inactive',
          created_at: '2024-03-10T09:15:00Z'
        }
      ]

      setUsers(mockUsers)
      setLoading(false)
    } catch (error) {
      notify.error(`Failed to load users: ${error.message}`)
      setLoading(false)
    }
  }

  /**
   * Handle create new user
   */
  const handleCreateUser = async (userData) => {
    try {
      // Use UserAuth facade to create account
      const newUser = await userAuth.createAccount({
        username: userData.username,
        password: userData.password,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName
      })

      // Add to list
      setUsers([...users, {
        id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'User',
        status: 'Active',
        created_at: new Date().toISOString()
      }])

      notify.success(`User ${userData.username} created successfully`)
      setShowForm(false)
    } catch (error) {
      notify.error(`Failed to create user: ${error.message}`)
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
   * Handle update user
   */
  const handleUpdateUser = async (userData) => {
    try {
      // In production, call user update API
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? {
              ...u,
              email: userData.email,
              first_name: userData.firstName,
              last_name: userData.lastName,
              role: userData.role,
              state: userData.state
            }
          : u
      ))

      notify.success(`User ${userData.username} updated successfully`)
      setShowForm(false)
      setSelectedUser(null)
    } catch (error) {
      notify.error(`Failed to update user: ${error.message}`)
    }
  }

  /**
   * Handle deactivate user (baja lógica — UC-USR-04)
   */
  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('¿Confirmar dar de baja al usuario?')) {
      return
    }

    try {
      setUsers(users.map(u => u.id === userId ? { ...u, state: 'ELIMINATED' } : u))
      notify.success('Usuario dado de baja correctamente')
    } catch (error) {
      notify.error(`Error al dar de baja: ${error.message}`)
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
          Role: u.role,
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

  /**
   * Filter users by search term and role
   */
  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = filterRole === 'all' || user.role === filterRole

      return matchesSearch && matchesRole
    })
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

            <div className="filter-group">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
                <option value="Moderator">Moderator</option>
              </select>
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
          />

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
    </div>
  )
}
