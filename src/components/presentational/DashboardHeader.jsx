import React from 'react';
import PropTypes from 'prop-types'

function DashboardHeader({ user, onLogout }) {
  return (
    <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
      <div className="px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm">Welcome, {user?.name}</p>
        </div>
        <button
          onClick={onLogout}
          className="bg-red-600 hover\:bg-red-700 text-white px-4 py-2 rounded transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
DashboardHeader.propTypes = {
  user:     PropTypes.object,
  onLogout: PropTypes.func,
}
