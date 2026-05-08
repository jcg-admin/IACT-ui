import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectUser } from '@store/selectors'
import {
  fetchDashboardMetrics,
  selectMetrics,
  selectReportsLoading,
} from '@store/slices/reports'
import { logout } from '@store/slices/auth'
import DashboardHeader from '@ui/presentational/DashboardHeader'
import MetricsGrid from '@ui/presentational/MetricsGrid'
import ChartsSection from '@ui/presentational/ChartsSection'
import { AnimatedLoadingSpinner } from '@ui/animations'

function DashboardMain() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const loading = useSelector(selectReportsLoading);
  const metrics = useSelector(selectMetrics);

  useEffect(() => {
    dispatch(fetchDashboardMetrics());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <DashboardHeader user={user} onLogout={handleLogout} />

      <main className="p-8">
        {loading ? (
          <AnimatedLoadingSpinner message="Cargando dashboard..." />
        ) : (
          <>
            <MetricsGrid metrics={metrics} />
            <ChartsSection charts={{}} />
          </>
        )}
      </main>
    </div>
  );
}

export default DashboardMain;
