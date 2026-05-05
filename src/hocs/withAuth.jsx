import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import { selectIsAuthenticated, selectAuthLoading } from '../redux/selectors/authSelectors'
import LoadingSpinner from '../components/shared/LoadingSpinner'

function withAuth(WrappedComponent, { redirectTo = '/login' } = {}) {
  function AuthGuard(props) {
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const isLoading = useSelector(selectAuthLoading)

    if (isLoading) {
      return <LoadingSpinner message="Verificando sesión…" />
    }

    if (!isAuthenticated) {
      return <Navigate to={redirectTo} replace />
    }

    return <WrappedComponent {...props} />
  }

  AuthGuard.displayName = `withAuth(${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})`

  return AuthGuard
}

export default withAuth
