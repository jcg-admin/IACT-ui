import React from 'react';
import Chart from './Chart';

function ChartsSection({ charts }) {
  return (
    <div className="grid-2">
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">Sales Trend</h2>
        <Chart data={charts.sales} dataKey="value" />
      </div>
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4">User Growth</h2>
        <Chart data={charts.users} dataKey="value" />
      </div>
    </div>
  );
}

export default React.memo(ChartsSection);
