/**
 * Global Error Display Component
 * Muestra errores globales de la aplicación en un toast o banner
 */

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectGlobalError,
  clearGlobalError,
  selectErrorHistory,
} from '@redux/slices/errorSlice';
import { getErrorMessage } from '@utils/apiErrors';

/**
 * Global Error Toast
 * Muestra un toast flotante con el error
 */
function GlobalErrorToast() {
  const dispatch = useDispatch();
  const globalError = useSelector(selectGlobalError);
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (globalError) {
      setIsVisible(true);
      setShowDetails(false);

      // Auto-hide después de 8 segundos
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          dispatch(clearGlobalError());
        }, 300);
      }, 8000);

      return () => clearTimeout(timeout);
    } else {
      setIsVisible(false);
    }
  }, [globalError, dispatch]);

  if (!isVisible || !globalError) {
    return null;
  }

  const errorMessage = getErrorMessage(globalError);
  const isServerError = globalError.statusCode && globalError.statusCode >= 500;
  const isValidationError = globalError.statusCode === 422;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50 animate-slide-in">
      <div
        className={`rounded-lg shadow-lg p-4 ${
          isServerError
            ? 'bg-red-600 text-white'
            : isValidationError
            ? 'bg-amber-600 text-white'
            : 'bg-red-500 text-white'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold mb-1">
              {isServerError
                ? 'Server Error'
                : isValidationError
                ? 'Validation Error'
                : 'Error'}
            </h4>
            <p className="text-sm opacity-90">{errorMessage}</p>

            {(globalError.code || globalError.statusCode) && (
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="mt-2 text-xs underline hover\:opacity-75"
              >
                {showDetails ? 'Hide' : 'Show'} details
              </button>
            )}

            {showDetails && (
              <div className="mt-2 text-xs font-mono bg-black bg-opacity-20 p-2 rounded">
                <div>Code: {globalError.code}</div>
                {globalError.statusCode && <div>Status: {globalError.statusCode}</div>}
                {globalError.timestamp && (
                  <div>Time: {new Date(globalError.timestamp).toLocaleTimeString()}</div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              dispatch(clearGlobalError());
            }}
            className="ml-2 text-lg leading-none hover\:opacity-75"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export { GlobalErrorToast };

// ============================================================================
// ERROR BANNER
// ============================================================================

/**
 * Error Banner
 * Muestra un banner con errores en la parte superior
 */
function ErrorBanner() {
  const dispatch = useDispatch();
  const globalError = useSelector(selectGlobalError);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(!!globalError);
  }, [globalError]);

  if (!isVisible || !globalError) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-3 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <p className="font-semibold">Error: {globalError.code}</p>
          <p className="text-sm">{getErrorMessage(globalError)}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            dispatch(clearGlobalError());
          }}
          className="text-2xl leading-none hover\:opacity-75"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export { ErrorBanner };

// ============================================================================
// ERROR DETAILS MODAL
// ============================================================================

/**
 * Error Details Modal
 * Muestra detalles completos del error
 */
function ErrorDetailsModal({ error, isOpen, onClose }) {
  if (!isOpen || !error) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
        <div className="bg-red-600 text-white px-6 py-4">
          <h2 className="text-xl font-bold">Error Details</h2>
        </div>

        <div className="p-6">
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-semibold text-gray-700">Code</dt>
              <dd className="text-gray-600">{error.code || 'UNKNOWN'}</dd>
            </div>

            {error.statusCode && (
              <div>
                <dt className="font-semibold text-gray-700">Status</dt>
                <dd className="text-gray-600">{error.statusCode}</dd>
              </div>
            )}

            <div>
              <dt className="font-semibold text-gray-700">Message</dt>
              <dd className="text-gray-600">{error.message}</dd>
            </div>

            {error.timestamp && (
              <div>
                <dt className="font-semibold text-gray-700">Time</dt>
                <dd className="text-gray-600">
                  {new Date(error.timestamp).toLocaleString()}
                </dd>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && error.stack && (
              <div>
                <dt className="font-semibold text-gray-700">Stack</dt>
                <dd className="text-xs font-mono bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {error.stack}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-gray-100 px-6 py-3 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-400 hover\:bg-gray-500 text-white rounded"
          >
            Close
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(error, null, 2));
              alert('Error copied to clipboard');
            }}
            className="flex-1 px-4 py-2 bg-blue-600 hover\:bg-blue-700 text-white rounded"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}

export { ErrorDetailsModal };

// ============================================================================
// ERROR HISTORY VIEWER
// ============================================================================

/**
 * Error History Viewer
 * Muestra historial de últimos errores (útil para debugging)
 */
function ErrorHistoryViewer() {
  const errorHistory = useSelector(selectErrorHistory);
  const [isOpen, setIsOpen] = useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 px-3 py-1 bg-gray-700 hover\:bg-gray-800 text-white text-xs rounded z-40"
        title="Error history (dev only)"
      >
        Errors ({errorHistory.length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-white rounded shadow-lg z-40 max-w-sm">
      <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
        <h3 className="font-semibold text-sm">Error History</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-lg leading-none hover\:opacity-75"
        >
          ×
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {errorHistory.length === 0 ? (
          <p className="p-3 text-xs text-gray-400">No errors yet</p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {errorHistory.map((error, idx) => (
              <li key={idx} className="p-3 text-xs">
                <div className="font-mono font-semibold text-red-400">
                  {error.code}
                </div>
                <div className="text-gray-300 mt-1">{error.message}</div>
                <div className="text-gray-500 text-xs mt-1">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export { ErrorHistoryViewer };
