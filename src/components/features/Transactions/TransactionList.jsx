/**
 * TransactionList Component
 * Muestra lista de transacciones
 * Con filtrado, búsqueda y exportación
 */

import React, { useState, useEffect } from 'react';
import Table from '@ui/presentational/Table';
import { useToast } from '../../context/ToastContext';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  const mockTransactions = [
    { id: 1, date: '2026-04-25', description: 'Pago de nómina', amount: 5000, type: 'income', status: 'Completado' },
    { id: 2, date: '2026-04-24', description: 'Compra de equipos', amount: 1200, type: 'expense', status: 'Completado' },
    { id: 3, date: '2026-04-23', description: 'Reembolso cliente', amount: 350, type: 'income', status: 'Pendiente' },
    { id: 4, date: '2026-04-22', description: 'Servicios generales', amount: 800, type: 'expense', status: 'Completado' },
    { id: 5, date: '2026-04-21', description: 'Venta de productos', amount: 2500, type: 'income', status: 'Completado' },
    { id: 6, date: '2026-04-20', description: 'Consultoría externa', amount: 1500, type: 'expense', status: 'Rechazado' },
    { id: 7, date: '2026-04-19', description: 'Ingresos de inversión', amount: 3000, type: 'income', status: 'Completado' },
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setTransactions(mockTransactions);
      setLoading(false);
    }, 500);
  }, []);

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const columns = [
    { key: 'date', label: 'Fecha', width: '100px' },
    { key: 'description', label: 'Descripción' },
    {
      key: 'amount',
      label: 'Monto',
      width: '100px',
      render: (value, row) => (
        <span style={{ color: row.type === 'income' ? '#10b981' : '#ef4444' }}>
          {row.type === 'income' ? '+' : '-'}${value}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value) => {
        const colors = {
          'Completado': '#065f46',
          'Pendiente': '#78350f',
          'Rechazado': '#7f1d1d',
        };
        const textColors = {
          'Completado': '#d1fae5',
          'Pendiente': '#fef3c7',
          'Rechazado': '#fee2e2',
        };
        return (
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: colors[value],
            color: textColors[value],
            fontSize: '12px'
          }}>
            {value}
          </span>
        );
      }
    },
  ];

  const handleExportCSV = () => {
    const csv = [
      ['Fecha', 'Descripción', 'Monto', 'Estado'],
      ...filteredTransactions.map(t => [t.date, t.description, t.amount, t.status])
    ]
      .map(row => row.join(','))
      .join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('CSV exportado', 'success');
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2>Transacciones</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            padding: '16px',
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            border: '1px solid #1f2937'
          }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Ingresos</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '24px', color: '#10b981', fontWeight: 'bold' }}>
              +${totalIncome}
            </p>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            border: '1px solid #1f2937'
          }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Gastos</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '24px', color: '#ef4444', fontWeight: 'bold' }}>
              -${totalExpense}
            </p>
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            border: '1px solid #1f2937'
          }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Balance</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '24px', color: '#0ea5e9', fontWeight: 'bold' }}>
              ${totalIncome - totalExpense}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar transacción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #1f2937',
              backgroundColor: '#0f172a',
              color: '#f3f4f6',
              flex: 1,
              minWidth: '200px',
            }}
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #1f2937',
              backgroundColor: '#0f172a',
              color: '#f3f4f6',
            }}
          >
            <option value="all">Todas</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
          </select>

          <button
            onClick={handleExportCSV}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Exportar CSV
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredTransactions}
        loading={loading}
        sortable={true}
      />
    </div>
  );
}

export default TransactionList;
