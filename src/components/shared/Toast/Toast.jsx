import React from 'react';
import '@styles/components/_toast.scss';
import PropTypes from 'prop-types'

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
Toast.propTypes = {
  id:       PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  message:  PropTypes.string.isRequired,
  type:     PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  onRemove: PropTypes.func.isRequired,
}
