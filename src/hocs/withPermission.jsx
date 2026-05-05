import React from 'react'
import { useSelector } from 'react-redux'
import { selectUserRole } from '../redux/selectors/authSelectors'

const DefaultFallback = () => (
  <div className="error-banner" role="alert">
    No tienes permiso para acceder a este contenido.
  </div>
)

function withPermission(WrappedComponent, allowedRoles, FallbackComponent = DefaultFallback) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  function PermissionGuard(props) {
    const userRole = useSelector(selectUserRole)
    const hasPermission = roles.includes(userRole)

    if (!hasPermission) {
      return <FallbackComponent />
    }

    return <WrappedComponent {...props} />
  }

  PermissionGuard.displayName = `withPermission(${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})`

  return PermissionGuard
}

export default withPermission
