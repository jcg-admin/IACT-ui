import React from 'react';

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
