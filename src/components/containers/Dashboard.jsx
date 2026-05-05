import React from 'react';
import { useSelector } from 'react-redux';
import MetricsGrid from '@components/presentational/MetricsGrid';
import ChartsSection from '@components/presentational/ChartsSection';

const mockMetrics = [
  { id: 1, label: 'Total Usuarios', value: '1,234', change: '+12%', trend: 'up' },
  { id: 2, label: 'Activos Hoy', value: '567', change: '+5%', trend: 'up' },
  { id: 3, label: 'Tasa Crecimiento', value: '23%', change: '-2%', trend: 'down' },
  { id: 4, label: 'Revenue', value: '$45.2K', change: '+18%', trend: 'up' },
];

const mockCharts = [
  {
    id: 1,
    title: 'Usuarios por Mes',
    type: 'line',
    data: [
      { month: 'Ene', value: 400 },
      { month: 'Feb', value: 450 },
      { month: 'Mar', value: 520 },
      { month: 'Abr', value: 580 },
    ],
  },
  {
    id: 2,
    title: 'Distribucion por Role',
    type: 'pie',
    data: [
      { name: 'Admin', value: 20 },
      { name: 'User', value: 60 },
      { name: 'Guest', value: 20 },
    ],
  },
];

function Dashboard() {
  const { user } = useSelector(state => state.auth);

  return (
    <div className="p-lg">
      <div>
        <h1>Bienvenido, {user?.first_name || 'Usuario'}</h1>
        <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>
          Aqui esta un resumen de tu dashboard
        </p>
      </div>

      <MetricsGrid metrics={mockMetrics} />

      <div style={{ marginTop: '32px' }}>
        <h2>Graficos</h2>
        <div className="grid-2">
          {mockCharts.map(chart => (
            <div key={chart.id} className="card">
              <div className="card-header">
                <h3 className="card-title">{chart.title}</h3>
              </div>
              <div className="card-body">
                <div style={{ height: '300px', background: '#111827', borderRadius: '8px' }}>
                  Grafico: {chart.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
