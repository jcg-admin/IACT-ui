import React from 'react'
import LoadingSpinner from '../components/shared/LoadingSpinner'

function withLoading(WrappedComponent, { spinnerSize = 'md', message = null } = {}) {
  function LoadingGuard({ isLoading, ...props }) {
    if (isLoading) {
      return <LoadingSpinner size={spinnerSize} message={message} />
    }

    return <WrappedComponent {...props} />
  }

  LoadingGuard.displayName = `withLoading(${WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component'})`

  return LoadingGuard
}

export default withLoading
