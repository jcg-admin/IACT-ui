import React from 'react';
import MetricCard from './MetricCard';
import PropTypes from 'prop-types'

function MetricsGrid({ metrics }) {
  return (
    <div className="grid-4 gap-4 mb-8">
      {Object.entries(metrics).map(([key, metric]) => (
        <MetricCard key={key} metric={metric} />
      ))}
    </div>
  );
}

export default React.memo(MetricsGrid);
MetricsGrid.propTypes = {
  metrics: PropTypes.array,
}
