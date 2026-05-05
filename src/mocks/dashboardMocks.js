export const mockMetrics = {
  totalUsers: {
    value: 12543,
    label: 'Total Users',
    change: '+12.5%',
    trend: 'up',
  },
  activeSession: {
    value: 2341,
    label: 'Active Sessions',
    change: '+8.3%',
    trend: 'up',
  },
  revenue: {
    value: '$125,430',
    label: 'Revenue',
    change: '+23.1%',
    trend: 'up',
  },
  conversionRate: {
    value: '3.24%',
    label: 'Conversion Rate',
    change: '-2.1%',
    trend: 'down',
  },
};

export const mockChartData = {
  sales: [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
    { name: 'Aug', value: 4200 },
  ],
  users: [
    { name: 'Week 1', value: 1200 },
    { name: 'Week 2', value: 1900 },
    { name: 'Week 3', value: 1500 },
    { name: 'Week 4', value: 2200 },
  ],
};

export const mockFetchDashboardData = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        metrics: mockMetrics,
        charts: mockChartData,
      });
    }, 500);
  });
};
