import React from 'react';

function LoadingSpinner({ 
  fullScreen = false, 
  size = 'md',
  message = null,
  overlay = true 
}) {
  const sizeClasses = {
    sm: 'spinner spinner-sm',
    md: 'spinner',
    lg: 'spinner spinner-lg',
  };

  const spinner = (
    <div className="flex flex-column items-center justify-center">
      <div className={sizeClasses[size]}></div>
      {message && (
        <p style={{ marginTop: '16px', color: '#cbd5e1', fontSize: '14px' }}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="loading-overlay"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-lg">
      {spinner}
    </div>
  );
}

export default LoadingSpinner;
