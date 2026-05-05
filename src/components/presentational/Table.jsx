/**
 * Table Component
 * Tabla reutilizable con:
 * - Sortable columns
 * - Selectable rows
 * - Responsive
 * - Actions column
 */

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import '@styles/components/_table.scss';

function Table({
  columns,
  data,
  onRowClick,
  onActionClick,
  loading = false,
  selectable = false,
  sortable = true,
}) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });
  const [selectedRows, setSelectedRows] = useState(new Set());

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;

      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortConfig]);

  const handleSort = (columnKey) => {
    if (!sortable) return;

    setSortConfig((prev) => ({
      key: columnKey,
      direction: prev.key === columnKey && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleRowSelect = (rowId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map((_, idx) => idx)));
    }
  };

  if (loading) {
    return (
      <div className="table-container">
        <p className="table-loading">Cargando...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="table-container">
        <p className="table-empty">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead className="table-header">
          <tr>
            {selectable && (
              <th className="table-cell table-cell--checkbox">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  className="table-checkbox"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`table-cell ${sortable ? 'table-cell--sortable' : ''}`}
                onClick={() => handleSort(col.key)}
                style={{ width: col.width || 'auto' }}
              >
                <div className="table-header-content">
                  <span>{col.label}</span>
                  {sortable && sortConfig.key === col.key && (
                    <span className="table-sort-icon">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
            {onActionClick && <th className="table-cell">Acciones</th>}
          </tr>
        </thead>
        <tbody className="table-body">
          {sortedData.map((row, idx) => (
            <tr
              key={idx}
              className="table-row"
              onClick={() => onRowClick?.(row)}
            >
              {selectable && (
                <td className="table-cell table-cell--checkbox">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(idx)}
                    onChange={() => handleRowSelect(idx)}
                    onClick={(e) => e.stopPropagation()}
                    className="table-checkbox"
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className="table-cell">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {onActionClick && (
                <td className="table-cell table-cell--actions">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      onActionClick(row);
                    }}
                  >
                    ⋮
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      width: PropTypes.string,
      render: PropTypes.func,
    })
  ).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRowClick: PropTypes.func,
  onActionClick: PropTypes.func,
  loading: PropTypes.bool,
  selectable: PropTypes.bool,
  sortable: PropTypes.bool,
};

export default Table;
