import PropTypes from 'prop-types';

/**
 * Metric Shape - Usado en MetricCard, MetricsGrid, etc
 */
export const metricShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  change: PropTypes.number.isRequired,
  timestamp: PropTypes.string,
});

/**
 * User Shape - Usado en auth state
 */
export const userShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
});

/**
 * Auth State Shape - Usado en auth selectors
 */
export const authStateShape = PropTypes.shape({
  isAuthenticated: PropTypes.bool.isRequired,
  user: userShape,
  token: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
});

/**
 * Dashboard State Shape - Usado en dashboard selectors
 */
export const dashboardStateShape = PropTypes.shape({
  metrics: PropTypes.arrayOf(metricShape).isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  filters: PropTypes.shape({
    startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
  lastUpdate: PropTypes.string,
});
