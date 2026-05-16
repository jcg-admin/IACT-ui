import React from 'react';
import PropTypes from 'prop-types'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function Chart({ data, dataKey = 'value' }) {
  if (!data || data.length === 0) {
    return <div className="text-slate-400">No data available</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
        <XAxis dataKey="name" stroke="#94a3b8" />
        <YAxis stroke="#94a3b8" />
        <Tooltip
          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
          labelStyle={{ color: '#fff' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="#3b82f6"
          dot={false}
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default React.memo(Chart);
Chart.propTypes = {
  data:    PropTypes.array,
  dataKey: PropTypes.string,
}
