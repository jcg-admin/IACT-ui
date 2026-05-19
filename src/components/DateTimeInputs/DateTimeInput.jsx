/**
 * DateTimeInput.jsx
 * IACT v4.0 - Componente React para seleccionar fecha y/o hora
 * Reemplaza: bootstrap-datetimepicker, datepicker, timepicker
 * 
 * Props:
 *   - value: Date | null
 *   - onChange: (date: Date) => void
 *   - type: 'datetime' | 'date' | 'time' (default: 'datetime')
 *   - label: string (opcional)
 *   - disabled: boolean (default: false)
 *   - minDate: Date | null (opcional)
 *   - maxDate: Date | null (opcional)
 *   - placeholder: string (default: 'Selecciona...')
 *   - required: boolean (default: false)
 */

import React, { useState } from 'react';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import './DateTimeInput.scss';
import PropTypes from 'prop-types'

export default function DateTimeInput({
  value,
  onChange,
  type = 'datetime',
  label = '',
  disabled = false,
  minDate = null,
  maxDate = null,
  placeholder = 'Selecciona...',
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getFormat = () => {
    switch (type) {
      case 'date':
        return 'dd/MM/yyyy';
      case 'time':
        return 'HH:mm';
      case 'datetime':
      default:
        return 'dd/MM/yyyy HH:mm';
    }
  };

  const handleChange = (date) => {
    onChange(date);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className="date-time-input-wrapper">
      {label && (
        <label className={`label-control ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}

      <div className="date-time-input-container">
        <DatePicker
          value={value}
          onChange={handleChange}
          format={getFormat()}
          minDate={minDate}
          maxDate={maxDate}
          disabled={disabled}
          calendarClassName="calendar-dark"
          clearButtonClassName="clear-button"
          disableClock={type === 'date'}
          maxDetail={type === 'date' ? 'month' : 'minute'}
          onCalendarOpen={() => setIsOpen(true)}
          onCalendarClose={() => setIsOpen(false)}
          showLeadingZeros={true}
        />
        
        {value && !disabled && (
          <button
            className="clear-btn"
            onClick={handleClear}
            title="Limpiar"
            type="button"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
DateTimeInput.propTypes = {
  value:       PropTypes.string,
  onChange:    PropTypes.func.isRequired,
  type:        PropTypes.oneOf(['date', 'datetime-local', 'time']),
  label:       PropTypes.string,
  disabled:    PropTypes.bool,
  minDate:     PropTypes.string,
  maxDate:     PropTypes.string,
  placeholder: PropTypes.string,
  required:    PropTypes.bool,
}
