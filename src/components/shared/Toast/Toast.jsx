import React from 'react';
import '@styles/components/_toast.scss';

function Toast({ id, message, type, onRemove }) {
  return (
    <div className={`toast toast--${type}`}>
      <div className="toast-icon">
        {type === 'success' && '✓'}
        {type === 'error' && '✕'}
        {type === 'warning' && '⚠'}
        {type === 'info' && 'ℹ'}
      </div>
      <p className="toast-message">{message}</p>
      <button className="toast-close" onClick={() => onRemove(id)}>
        ✕
      </button>
    </div>
  );
}

export default Toast;
