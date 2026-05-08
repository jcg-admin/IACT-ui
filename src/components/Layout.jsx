import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@store/slices/auth';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/login';
  };

  return (
    <div>
      <nav className="navbar">
        <div className="flex items-center gap-md">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            Menu
          </button>
          <div className="navbar-brand">
            <div className="navbar-brand-logo">IACT</div>
            Dashboard
          </div>
        </div>

        <div className="navbar-right">
          <button className="navbar-icon" title="Notificaciones">
            Bell
          </button>
          <div className="navbar-divider"></div>
          <div className="navbar-user">
            <div className="navbar-user-avatar">
              {user?.first_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="navbar-user-name">{user?.first_name || 'Usuario'}</div>
            </div>
          </div>
          <button
            className="navbar-icon"
            onClick={handleLogout}
            title="Salir"
          >
            Exit
          </button>
        </div>
      </nav>

      <div className="flex">
        <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
          <div className="sidebar-menu">
            <a href="/dashboard" className="sidebar-menu-link active">
              <span className="sidebar-menu-icon">Home</span>
              <span className="sidebar-menu-label">Dashboard</span>
            </a>
            <a href="/users" className="sidebar-menu-link">
              <span className="sidebar-menu-icon">Users</span>
              <span className="sidebar-menu-label">Usuarios</span>
            </a>
            <a href="/profile" className="sidebar-menu-link">
              <span className="sidebar-menu-icon">User</span>
              <span className="sidebar-menu-label">Perfil</span>
            </a>
            <a href="/settings" className="sidebar-menu-link">
              <span className="sidebar-menu-icon">Settings</span>
              <span className="sidebar-menu-label">Configuracion</span>
            </a>
          </div>

          <div className="sidebar-footer">
            <p style={{ fontSize: '12px', color: 'gray', margin: 0 }}>
              IACT v1.0.0
            </p>
          </div>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
