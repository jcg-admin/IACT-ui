/**
 * UserList Component
 * 
 * Displays users in a table with actions
 * Features: Sort, paginate, edit, delete
 */

import React, { useState } from 'react'
import './UserList.scss'

export default function UserList({ users, loading, onEdit, onDelete }) {
  const [sortField, setSortField] = useState('username')
  const [sortOrder, setSortOrder] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  /**
   * Sort users by field
   */
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  /**
   * Sort users
   */
  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    return sortOrder === 'asc' 
      ? aValue - bValue
      : bValue - aValue
  })

  /**
   * Paginate users
   */
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage)

  /**
   * Render sort indicator
   */
  const SortIndicator = ({ field }) => {
    if (sortField !== field) return null
    return <span className="sort-indicator">{sortOrder === 'asc' ? '▲' : '▼'}</span>
  }

  if (loading) {
    return <div className="user-list loading">Loading users...</div>
  }

  if (users.length === 0) {
    return (
      <div className="user-list empty">
        <p>No users found. Create your first user to get started.</p>
      </div>
    )
  }

  return (
    <div className="user-list">
      <table className="users-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('username')} className="sortable">
              Username <SortIndicator field="username" />
            </th>
            <th onClick={() => handleSort('email')} className="sortable">
              Email <SortIndicator field="email" />
            </th>
            <th onClick={() => handleSort('first_name')} className="sortable">
              Name <SortIndicator field="first_name" />
            </th>
            <th onClick={() => handleSort('role')} className="sortable">
              Role <SortIndicator field="role" />
            </th>
            <th onClick={() => handleSort('status')} className="sortable">
              Status <SortIndicator field="status" />
            </th>
            <th onClick={() => handleSort('created_at')} className="sortable">
              Created <SortIndicator field="created_at" />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map((user) => (
            <tr key={user.id} className={`status-${user.status.toLowerCase()}`}>
              <td className="username">{user.username}</td>
              <td className="email">{user.email}</td>
              <td className="name">
                {user.first_name} {user.last_name}
              </td>
              <td className="role">
                <span className={`badge role-${user.role.toLowerCase()}`}>
                  {user.role}
                </span>
              </td>
              <td className="status">
                <span className={`badge status-${user.status.toLowerCase()}`}>
                  {user.status}
                </span>
              </td>
              <td className="created">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="actions">
                <button
                  onClick={() => onEdit(user)}
                  className="btn-action btn-edit"
                  title="Edit user"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(user.id)}
                  className="btn-action btn-delete"
                  title="Delete user"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn-pagination"
          >
            Previous
          </button>

          <div className="page-info">
            Page {currentPage} of {totalPages}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn-pagination"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
