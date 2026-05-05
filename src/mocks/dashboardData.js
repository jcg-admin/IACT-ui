// Mock dashboard data

export const mockMetrics = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '$125,430',
    trend: '+12.5%',
    color: '#4ade80',
  },
  {
    id: 'users',
    label: 'Active Users',
    value: '8,234',
    trend: '+8.2%',
    color: '#3b82f6',
  },
  {
    id: 'conversion',
    label: 'Conversion Rate',
    value: '3.24%',
    trend: '-1.2%',
    color: '#f97316',
  },
  {
    id: 'retention',
    label: 'Retention Rate',
    value: '92.5%',
    trend: '+4.1%',
    color: '#a855f7',
  },
];

export const mockChartData = [
  { month: 'Jan', revenue: 4000, users: 2400, sales: 2400 },
  { month: 'Feb', revenue: 3000, users: 1398, sales: 2210 },
  { month: 'Mar', revenue: 2000, users: 9800, sales: 2290 },
  { month: 'Apr', revenue: 2780, users: 3908, sales: 2000 },
  { month: 'May', revenue: 1890, users: 4800, sales: 2181 },
  { month: 'Jun', revenue: 2390, users: 3800, sales: 2500 },
];

export const mockDashboardData = {
  metrics: mockMetrics,
  chartData: mockChartData,
  lastUpdated: new Date().toISOString(),
};
