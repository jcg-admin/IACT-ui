/**
 * MetricsCard Component
 * 
 * Display single metric with trend
 */

import React from 'react'
import PropTypes from 'prop-types'

export default function MetricsCard({ title, value, icon, trend, trendType }) {
  return (
    <div className="metrics-card">
      <div className="card-header">
        <span className="icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className="card-value">
        <span className="value">{value}</span>
        <span className={`trend trend-${trendType}`}>
          {trend}
        </span>
      </div>
    </div>
  )
}
MetricsCard.propTypes = {
  title:     PropTypes.string.isRequired,
  value:     PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon:      PropTypes.string,
  trend:     PropTypes.number,
  trendType: PropTypes.oneOf(['up', 'down', 'neutral']),
}
