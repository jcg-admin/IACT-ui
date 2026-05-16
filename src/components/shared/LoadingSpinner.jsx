import React from 'react';
import PropTypes from 'prop-types'

function LoadingSpinner({ size = 'md', message = null }) {
  const sizeClasses = {
    sm: 'spinner spinner-sm',
    md: 'spinner',
    lg: 'spinner spinner-lg',
  };

  return (
    <div className="flex items-center justify-center p-lg">
      <div className="flex flex-column items-center justify-center">
        <div className={sizeClasses[size]}></div>
        {message && (
          <p style={{ marginTop: '16px', color: '#cbd5e1', fontSize: '14px' }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default LoadingSpinner;
LoadingSpinner.propTypes = {
  size:    PropTypes.oneOf(['sm', 'md', 'lg']),
  message: PropTypes.string,
}
