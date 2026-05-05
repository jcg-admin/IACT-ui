/**
 * Root Error Boundary
 * Captura errores en toda la aplicación
 * Colocarse en el nivel más alto (wrapping toda la app)
 */

import React from 'react';
import { logError } from '@utils/apiErrors';

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error
    logError(error, {
      context: 'RootErrorBoundary',
      componentStack: errorInfo.componentStack,
    });

    // Store error info
    this.setState(prev => ({
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));

    // If too many errors, might be stuck in loop
    if (this.state.errorCount > 5) {
      console.error('[RootErrorBoundary] Too many errors, app might be unstable');
      // Could clear localStorage, reset app state, etc
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-red-900 border-2 border-red-700 rounded-lg p-6 shadow-2xl">
              <h1 className="text-2xl font-bold text-red-100 mb-4">
                Application Error
              </h1>

              <p className="text-red-200 mb-4">
                An unexpected error occurred. Our team has been notified.
              </p>

              <div className="bg-red-950 rounded p-3 mb-4 max-h-32 overflow-y-auto">
                <p className="text-xs font-mono text-red-300">
                  {this.state.error?.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-400 cursor-pointer hover\:text-red-300">
                      Stack trace
                    </summary>
                    <pre className="text-xs text-red-300 mt-2 whitespace-pre-wrap break-words">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={this.handleReset}
                  className="flex-1 px-4 py-2 bg-amber-600 hover\:bg-amber-700 text-white font-semibold rounded transition"
                >
                  Retry
                </button>
                <button
                  onClick={this.handleReload}
                  className="flex-1 px-4 py-2 bg-blue-600 hover\:bg-blue-700 text-white font-semibold rounded transition"
                >
                  Reload
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-red-400 mt-4">
                  Error ID: {this.state.error?.code || 'UNKNOWN'}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default RootErrorBoundary;

// ============================================================================
// API ERROR BOUNDARY
// ============================================================================

/**
 * API Error Boundary
 * Captura errores de componentes que hacen llamadas a API
 */
class APIErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, {
      context: 'APIErrorBoundary',
      componentStack: errorInfo.componentStack,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
          <h3 className="text-red-800 font-semibold mb-2">
            Failed to load data
          </h3>
          <p className="text-red-700 text-sm mb-3">
            {this.state.error?.message || 'An error occurred while loading data.'}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-red-600 hover\:bg-red-700 text-white text-sm rounded"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export { APIErrorBoundary };

// ============================================================================
// COMPONENT ERROR BOUNDARY
// ============================================================================

/**
 * Component Error Boundary
 * Captura errores de un componente específico
 * Similar a APIErrorBoundary pero más genérico
 */
class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, {
      context: this.props.context || 'ComponentErrorBoundary',
      componentStack: errorInfo.componentStack,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="text-yellow-800 font-semibold">
            Component Error
          </h3>
          <p className="text-yellow-700 text-sm">
            {this.props.fallback || 'Unable to display this component.'}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-2 px-3 py-1 bg-yellow-600 hover\:bg-yellow-700 text-white text-sm rounded"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ComponentErrorBoundary };

// ============================================================================
// MODAL ERROR BOUNDARY
// ============================================================================

/**
 * Modal Error Boundary
 * Captura errores en modales/diálogos
 */
class ModalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logError(error, {
      context: 'ModalErrorBoundary',
      componentStack: errorInfo.componentStack,
    });
  }

  handleClose = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm p-6">
            <h2 className="text-lg font-bold text-red-600 mb-2">
              Modal Error
            </h2>
            <p className="text-gray-700 text-sm mb-4">
              An error occurred. Please close this dialog and try again.
            </p>
            <button
              onClick={this.handleClose}
              className="w-full px-4 py-2 bg-red-600 hover\:bg-red-700 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ModalErrorBoundary };
