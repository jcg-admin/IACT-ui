/**
 * UserManagement Component - DRY Version
 * 
 * Demonstrates how to use useExport hook + ExportButtons component
 * for clean, reusable export functionality
 */

import React, { useState, useMemo, useRef } from 'react'
import { AnimatedButton } from '@components/animations'
import ExportButtons from '@components/shared/ExportButtons'

const mockUsers = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  username: `user_${i + 1}`,
  email: `user${i + 1}@example.com`,
  first_name: `User ${i + 1}`,
  last_name: `Test`,
  role: i % 3 === 0 ? 'admin' : 'user',
  date_joined: new Date(2024, Math.floor(i / 5), i + 1).toISOString(),
}))

function UserManagement() {
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [search, setSearch] = useState('')
  const tableRef = useRef(null)

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user =>
      user.username.includes(search) || 
      user.email.includes(search) ||
      user.first_name.includes(search)
    )
  }, [search])

  const totalPages = Math.ceil(filteredUsers.length / limit)
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * limit,
    page * limit
  )

  const handleDelete = (userId) => {
    if (window.confirm('Seguro que quieres eliminar este usuario?')) {
      alert('Usuario eliminado (mock)')
    }
  }

  return (
    <div className="p-lg">
      <div className="flex justify-between items-center mb-lg">
        <h1>Administracion de Usuarios</h1>
        <div className="flex gap-md">
          <AnimatedButton variant="primary">Nuevo Usuario</AnimatedButton>
          {/* DRY: Single component replaces 100+ lines of export code */}
          <ExportButtons
            data={filteredUsers}
            exportName="users_report"
            headers={['ID', 'Username', 'Email', 'First Name', 'Last Name', 'Role', 'Date Joined']}
            columns={['id', 'username', 'email', 'first_name', 'last_name', 'role', 'date_joined']}
            tableRef={tableRef}
            title="User Management Report"
          />
        </div>
      </div>

      <div className="card mb-lg">
        <div className="card-body">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="form-control"
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover" ref={tableRef}>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Email</th>
              <th>Role</th>
              <th>Creado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>
                  No hay usuarios
                </td>
              </tr>
            ) : (
              paginatedUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-md">
                      <div className="avatar avatar-sm">
                        {user.first_name.charAt(0)}
                      </div>
                      <div>
                        <div>{user.first_name}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge badge-${user.role === 'admin' ? 'primary' : 'secondary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {new Date(user.date_joined).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="flex gap-sm">
                      <AnimatedButton variant="secondary" className="btn-sm">Editar</AnimatedButton>
                      <AnimatedButton
                        variant="danger"
                        className="btn-sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        Eliminar
                      </AnimatedButton>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination" style={{ marginTop: '24px', justifyContent: 'center' }}>
        <button
          className="pagination-prev"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          Anterior
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => Math.abs(p - page) <= 1 || p === 1 || p === totalPages)
          .map((p, idx, arr) => (
            <React.Fragment key={p}>
              {idx > 0 && arr[idx - 1] !== p - 1 && (
                <span className="pagination-link ellipsis">...</span>
              )}
              <button
                className={`pagination-link ${p === page ? 'active' : ''}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            </React.Fragment>
          ))}

        <button
          className="pagination-next"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Siguiente
        </button>

        <span className="pagination-info" style={{ marginLeft: '16px' }}>
          Pagina {page} de {totalPages}
        </span>
      </div>
    </div>
  )
}

export default UserManagement
