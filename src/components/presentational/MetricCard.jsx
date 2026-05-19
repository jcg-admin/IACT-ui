import React from 'react';
import PropTypes from 'prop-types'

function MetricCard({ metric }) {
  const trendColor = metric.trend === 'up' ? 'badge-success' : 'badge-error';

  return (
    <div className="card card-interactive">
      <div className="card-body">
        <h3 className="card-subtitle">{metric.label}</h3>
        <p style={{ fontSize: '32px', fontWeight: 'bold', marginTop: '8px' }}>
          {metric.value}
        </p>
        <span className={`badge ${trendColor} mt-md`}>
          {metric.change}
        </span>
      </div>
    </div>
  );
}

export default React.memo(MetricCard);
MetricCard.propTypes = {
  metric: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
}
