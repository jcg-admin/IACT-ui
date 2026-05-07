/**
 * AccessPage — Control de Acceso (ITER4)
 *
 * Gestión de funciones asignadas al usuario activo y validación de reglas de separación.
 * Requiere permiso VIEW_ACCESS.
 */

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchUserPermissions,
  fetchAllFunctions,
  revokeFunction,
  selectUserPermissions,
  selectFunctions,
  selectLoading,
  selectError,
} from '@redux/slices/accessSlice'
import { selectUser } from '@redux/selectors'
import PermissionsTable from '../../access/PermissionsTable'
import FunctionSelector from '../../access/FunctionSelector'
import './AccessPage.scss'

export default function AccessPage() {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const userPermissions = useSelector(selectUserPermissions)
  const functions = useSelector(selectFunctions)
  const loading = useSelector(selectLoading)
  const error = useSelector(selectError)
  const [activeTab, setActiveTab] = useState('permisos')

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserPermissions(user.id))
      dispatch(fetchAllFunctions())
    }
  }, [dispatch, user?.id])

  const handleRevoke = (functionId) => {
    if (user?.id) {
      dispatch(revokeFunction({ userId: user.id, catalogId: functionId }))
    }
  }

  return (
    <div className="access-page page-container">
      <header className="page-header">
        <h1>Control de Acceso</h1>
        <p className="page-subtitle">Gestión de permisos y funciones del sistema</p>
      </header>

      <nav className="tab-nav" aria-label="Secciones de acceso">
        <button
          className={`tab-btn${activeTab === 'permisos' ? ' active' : ''}`}
          onClick={() => setActiveTab('permisos')}
        >
          Permisos Activos
        </button>
        <button
          className={`tab-btn${activeTab === 'asignar' ? ' active' : ''}`}
          onClick={() => setActiveTab('asignar')}
        >
          Asignar Función
        </button>
      </nav>

      {error && (
        <div className="error-banner" role="alert">
          Error cargando permisos: {error}
        </div>
      )}

      {activeTab === 'permisos' && (
        <PermissionsTable
          permissions={userPermissions}
          onRevoke={handleRevoke}
          loading={loading}
        />
      )}

      {activeTab === 'asignar' && (
        <FunctionSelector
          availableFunctions={functions}
          userId={user?.id}
        />
      )}
    </div>
  )
}
