/**
 * UserManagement — administración de usuarios.
 * Conectado a userSlice: carga usuarios via fetchUsers en mount.
 * Los datos provienen del MockInterceptor en dev (REACT_APP_USE_MOCKS=true)
 * o del backend real en producción — el componente no distingue.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AnimatedButton } from '@ui/animations'
import ExportButtons from '@ui/shared/ExportButtons'
import {
    fetchUsers,
    deactivateUser,
    selectUsers,
    selectUsersLoading,
    selectUsersError,
    selectUsersTotal,
} from '../../redux/slices/user'

const STATE_BADGE_CLASS = {
    ACTIVE: 'badge-primary',
    INACTIVE: 'badge-secondary',
    BLOCKED: 'badge-warning',
    ELIMINATED: 'badge-danger',
}

function UserManagement() {
    const dispatch = useDispatch()
    const users = useSelector(selectUsers)
    const loading = useSelector(selectUsersLoading)
    const error = useSelector(selectUsersError)
    const total = useSelector(selectUsersTotal)

    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [search, setSearch] = useState('')
    const tableRef = useRef(null)

    useEffect(() => {
        dispatch(fetchUsers())
    }, [dispatch])

    const filteredUsers = useMemo(() => {
        if (!search) return users
        const searchQuery = search.toLowerCase()
        return users.filter(u =>
            u.username.toLowerCase().includes(searchQuery) ||
            u.email.toLowerCase().includes(searchQuery) ||
            (u.first_name || '').toLowerCase().includes(searchQuery)
        )
    }, [users, search])

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / limit))
    const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit)

    const handleDeactivate = (userId) => {
        if (window.confirm('¿Dar de baja este usuario? (baja lógica UC_USR_04)')) {
            dispatch(deactivateUser(userId))
        }
    }

    if (loading) {
        return (
            <div className="p-lg" style={{ textAlign: 'center', color: '#94a3b8' }}>
                Cargando usuarios...
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-lg">
                <div role="alert" className="error-banner">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="p-lg">
            <div className="flex justify-between items-center mb-lg">
                <h1>Administracion de Usuarios</h1>
                <div className="flex gap-md">
                    <AnimatedButton variant="primary">Nuevo Usuario</AnimatedButton>
                    <ExportButtons
                        data={filteredUsers}
                        exportName="users_report"
                        headers={['ID', 'Username', 'Email', 'Nombre', 'Apellido', 'Estado', 'Creado']}
                        columns={['id', 'username', 'email', 'first_name', 'last_name', 'state', 'date_joined']}
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
                            <th>Estado</th>
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
                                                {(user.first_name || user.username).charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div>{user.first_name} {user.last_name}</div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                                                    @{user.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={`badge ${STATE_BADGE_CLASS[user.state] || 'badge-secondary'}`}>
                                            {user.state || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        {new Date(user.date_joined).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="flex gap-sm">
                                            <AnimatedButton variant="secondary" className="btn-sm">
                                                Editar
                                            </AnimatedButton>
                                            {user.state !== 'ELIMINATED' && (
                                                <AnimatedButton
                                                    variant="danger"
                                                    className="btn-sm"
                                                    onClick={() => handleDeactivate(user.id)}
                                                >
                                                    Dar de baja
                                                </AnimatedButton>
                                            )}
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
                    Página {page} de {totalPages} · Total: {total}
                </span>
            </div>
        </div>
    )
}

export default UserManagement
