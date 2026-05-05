import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { selectUser, selectDashboardLoading, selectMetrics, selectCharts } from '@redux/selectors'
import { setMetrics, setCharts, setDashboardLoading } from '@redux/slices/dashboardSlice'
import { logout } from '@redux/slices/authSlice'
import { mockFetchDashboardData } from '@mocks/dashboardMocks'
import DashboardHeader from '@components/presentational/DashboardHeader'
import MetricsGrid from '@components/presentational/MetricsGrid'
import ChartsSection from '@components/presentational/ChartsSection'
import { AnimatedLoadingSpinner } from '@components/animations'

function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const loading = useSelector(selectDashboardLoading);
  const metrics = useSelector(selectMetrics);
  const charts = useSelector(selectCharts);

  useEffect(() => {
    const fetchData = async () => {
      dispatch(setDashboardLoading(true));
      try {
        const data = await mockFetchDashboardData();
        dispatch(setMetrics(data.metrics));
        dispatch(setCharts(data.charts));
      } finally {
        dispatch(setDashboardLoading(false));
      }
    };

    fetchData();
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
            <ChartsSection charts={charts} />
          </>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
