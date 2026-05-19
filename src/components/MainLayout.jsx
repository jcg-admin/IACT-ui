import { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MockDataNotice from './MockDataNotice';
import { PermissionsService } from '@api/permissions/Permissions';
import BackendStatusPanel from './BackendStatusPanel';
import Header from '@ui/navigation/Header/Header';
import { logoutUser } from '@store/slices/auth';
import { selectUser } from '@store/selectors';

const MainLayout = memo(({ children, mockNotice, backendStatus, mockSummary }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [menuEntries, setMenuEntries] = useState([]);
  const [menuError, setMenuError] = useState(null);

  useEffect(() => {
    let isActive = true;

    const loadMenu = async () => {
      try {
        const result = await PermissionsService.getNormalizedPermissions();
        if (isActive) {
          setMenuEntries(result.data.menuEntries);
          setMenuError(null);
        }
      } catch (error) {
        if (isActive) {
          setMenuEntries([]);
          setMenuError(error.message);
        }
      }
    };

    loadMenu();

    return () => {
      isActive = false;
    };
  }, []);

  const renderMenuItems = () => {
    if (menuEntries.length === 0) {
      return (
        <li className="menu-placeholder" data-testid="menu-placeholder">
          {menuError ? 'Menu no disponible' : 'Cargando menu...'}
        </li>
      );
    }

    return menuEntries.map((entry) => {
      const path = entry.code === 'dashboards' ? '/' : `/${entry.code}`;

      return (
        <li key={entry.id}>
          <a href={path}>{entry.label}</a>
        </li>
      );
    });
  };

  return (
    <div className="app-container">
      <Header
        onLogout={() => dispatch(logoutUser())}
        userInfo={{ name: user?.first_name, email: user?.email }}
      />
      <nav className="app-nav" aria-label="Main navigation">
        <ul>
          {renderMenuItems()}
        </ul>
      </nav>
      <BackendStatusPanel health={backendStatus} mockSummary={mockSummary} />
      <MockDataNotice {...mockNotice} />
      <main className="app-main" role="main">
        {children}
      </main>
      <footer className="app-footer">
        <p>IACT - Sistema de metricas IVR</p>
      </footer>
    </div>
  );
});

MainLayout.displayName = 'MainLayout';

MainLayout.defaultProps = {
  mockNotice: { isVisible: false },
  backendStatus: { status: 'unknown', source: 'unknown' },
  mockSummary: { domainsUsingMock: 0, totalDomains: 0, metrics: {} },
};

export default MainLayout;
