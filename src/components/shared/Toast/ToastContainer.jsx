import React from 'react';
import { useToast } from '../../context/ToastContext';
import Toast from './Toast';
import '@styles/components/_toast-container.scss';

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onRemove={removeToast}
        />
      ))}
    </div>
  );
}

export default ToastContainer;
