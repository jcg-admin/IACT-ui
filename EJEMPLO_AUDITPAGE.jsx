/**
 * EJEMPLO: AuditPage.jsx - Uso de DateTimeInput y SelectDropdown
 * 
 * Este archivo muestra cómo usar los nuevos componentes React + Redux
 * en la página de Auditoria del sistema.
 * 
 * REEMPLAZA EL CÓDIGO ANTERIOR CON ESTA VERSIÓN
 */

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Componentes
import DateTimeInput from '../../components/DateTimeInputs/DateTimeInput';
import SelectDropdown from '../../components/DateTimeInputs/SelectDropdown';

// Redux
import {
  setDateStart,
  setDateEnd,
  setSelectedAction,
  setSelectedSeverity,
  resetFilters,
  selectDateStart,
  selectDateEnd,
  selectSelectedAction,
  selectSelectedSeverity,
  selectIsLoading,
} from '../../redux/slices/formSlice';

// Servicios/Thunks
// import { fetchAuditLogs } from '../../redux/slices/auditSlice';

export default function AuditPage() {
  const dispatch = useDispatch();

  // Estado local
  const [showFilters, setShowFilters] = useState(true);

  // Estado del formulario desde Redux
  const dateStart = useSelector(selectDateStart);
  const dateEnd = useSelector(selectDateEnd);
  const selectedAction = useSelector(selectSelectedAction);
  const selectedSeverity = useSelector(selectSelectedSeverity);
  const isLoading = useSelector(selectIsLoading);

  // Opciones para los selects
  const actionOptions = [
    { value: 'CREATE', label: 'Crear' },
    { value: 'UPDATE', label: 'Actualizar' },
    { value: 'DELETE', label: 'Eliminar' },
    { value: 'ASSIGN', label: 'Asignar' },
    { value: 'REVOKE', label: 'Revocar' },
    { value: 'VIEW', label: 'Ver' },
  ];

  const severityOptions = [
    { value: 'CRITICAL', label: 'Crítica' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'LOW', label: 'Baja' },
    { value: 'INFO', label: 'Información' },
  ];

  // Manejadores
  const handleDateStartChange = (date) => {
    dispatch(setDateStart(date));
  };

  const handleDateEndChange = (date) => {
    dispatch(setDateEnd(date));
  };

  const handleActionChange = (option) => {
    dispatch(setSelectedAction(option));
  };

  const handleSeverityChange = (option) => {
    dispatch(setSelectedSeverity(option));
  };

  const handleFilter = () => {
    console.log('🔍 Filtrando con:', {
      dateStart,
      dateEnd,
      action: selectedAction?.value,
      severity: selectedSeverity?.value,
    });

    // Aquí llamar al thunk para obtener datos filtrados
    // dispatch(fetchAuditLogs({
    //   dateStart,
    //   dateEnd,
    //   action: selectedAction?.value,
    //   severity: selectedSeverity?.value,
    // }));
  };

  const handleReset = () => {
    dispatch(resetFilters());
    console.log('✨ Filtros limpiados');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          color: '#fff',
          fontSize: '28px',
          fontWeight: 700,
          margin: 0,
        }}>
          📋 Auditoria del Sistema
        </h1>
        <p style={{
          color: '#9ca3af',
          fontSize: '14px',
          marginTop: '8px',
        }}>
          Visualiza y filtra todos los eventos de auditoria del sistema
        </p>
      </div>

      {/* Botón para mostrar/ocultar filtros */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        style={{
          marginBottom: '16px',
          padding: '8px 16px',
          backgroundColor: '#1f2937',
          color: '#0ea5e9',
          border: '1px solid #374151',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          transition: 'all 0.2s ease',
        }}
      >
        {showFilters ? '▼ Ocultar filtros' : '▶ Mostrar filtros'}
      </button>

      {/* Filtros */}
      {showFilters && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
          padding: '20px',
          backgroundColor: '#111827',
          borderRadius: '8px',
          border: '1px solid #374151',
        }}>
          {/* Fecha inicio */}
          <DateTimeInput
            type="date"
            label="Desde:"
            value={dateStart}
            onChange={handleDateStartChange}
            placeholder="Selecciona fecha inicio"
            maxDate={new Date()}
          />

          {/* Fecha fin */}
          <DateTimeInput
            type="date"
            label="Hasta:"
            value={dateEnd}
            onChange={handleDateEndChange}
            minDate={dateStart}
            maxDate={new Date()}
            placeholder="Selecciona fecha fin"
          />

          {/* Acción */}
          <SelectDropdown
            label="Acción:"
            options={actionOptions}
            value={selectedAction}
            onChange={handleActionChange}
            isClearable={true}
            isSearchable={true}
            placeholder="Todas las acciones"
          />

          {/* Severidad */}
          <SelectDropdown
            label="Severidad:"
            options={severityOptions}
            value={selectedSeverity}
            onChange={handleSeverityChange}
            isClearable={true}
            isSearchable={true}
            placeholder="Todas las severidades"
          />

          {/* Botones de acción */}
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-end',
          }}>
            <button
              onClick={handleFilter}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 20px',
                backgroundColor: '#0ea5e9',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.target.style.backgroundColor = '#0284c7';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.target.style.backgroundColor = '#0ea5e9';
              }}
            >
              {isLoading ? '🔄 Cargando...' : '🔍 Filtrar'}
            </button>

            <button
              onClick={handleReset}
              disabled={
                !dateStart &&
                !dateEnd &&
                !selectedAction &&
                !selectedSeverity
              }
              style={{
                padding: '10px 16px',
                backgroundColor: '#1f2937',
                color: '#9ca3af',
                border: '1px solid #374151',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
                transition: 'all 0.2s ease',
                opacity: (!dateStart && !dateEnd && !selectedAction && !selectedSeverity) ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (dateStart || dateEnd || selectedAction || selectedSeverity) {
                  e.target.style.backgroundColor = '#374151';
                  e.target.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#1f2937';
                e.target.style.color = '#9ca3af';
              }}
            >
              ✨ Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Resumen de filtros aplicados */}
      {(dateStart || dateEnd || selectedAction || selectedSeverity) && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#374151',
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '12px',
          color: '#9ca3af',
        }}>
          <strong style={{ color: '#fff' }}>Filtros aplicados:</strong>
          {dateStart && ` Desde: ${dateStart.toLocaleDateString('es-ES')} |`}
          {dateEnd && ` Hasta: ${dateEnd.toLocaleDateString('es-ES')} |`}
          {selectedAction && ` Acción: ${selectedAction.label} |`}
          {selectedSeverity && ` Severidad: ${selectedSeverity.label}`}
        </div>
      )}

      {/* Tabla de resultados */}
      <div style={{
        backgroundColor: '#111827',
        borderRadius: '8px',
        border: '1px solid #374151',
        padding: '20px',
        minHeight: '400px',
      }}>
        <h3 style={{
          color: '#fff',
          fontSize: '16px',
          fontWeight: 600,
          marginTop: 0,
          marginBottom: '16px',
        }}>
          Resultados de la búsqueda
        </h3>

        {isLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
            color: '#9ca3af',
          }}>
            <span>🔄 Cargando datos...</span>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '14px',
            padding: '40px 20px',
          }}>
            <p>📊 Los datos filtrados aparecerán aquí</p>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Usa los filtros de arriba para buscar eventos específicos
            </p>

            {/* Tabla vacía de ejemplo */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '16px',
              opacity: 0.3,
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #374151' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#9ca3af' }}>Fecha/Hora</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#9ca3af' }}>Usuario</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#9ca3af' }}>Acción</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#9ca3af' }}>Severidad</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: '#9ca3af' }}>Detalles</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #374151' }}>
                  <td style={{ padding: '12px' }}>2026-04-27 10:30</td>
                  <td style={{ padding: '12px' }}>admin@iact.com</td>
                  <td style={{ padding: '12px' }}>UPDATE</td>
                  <td style={{ padding: '12px' }}>MEDIUM</td>
                  <td style={{ padding: '12px' }}>Actualización de permisos</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '24px',
        padding: '12px',
        borderTop: '1px solid #374151',
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'center',
      }}>
        IACT v4.0 - Auditoria • © 2026 • Componentes React + Redux
      </div>
    </div>
  );
}

/**
 * NOTAS DE IMPLEMENTACIÓN:
 * 
 * 1. Este componente usa los nuevos componentes React + Redux
 * 2. Reemplaza completamente el enfoque jQuery anterior
 * 3. Los estilos dark mode están incluidos automáticamente
 * 4. El estado se gestiona completamente con Redux
 * 5. Los datos se cargarían con un thunk de auditSlice
 * 
 * PRÓXIMOS PASOS:
 * - Descomentar la línea de fetchAuditLogs
 * - Conectar con auditSlice para obtener datos reales
 * - Implementar paginación
 * - Agregar exportación a CSV/PDF
 * - Implementar búsqueda en tiempo real
 */
