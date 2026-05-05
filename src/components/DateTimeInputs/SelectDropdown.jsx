/**
 * SelectDropdown.jsx
 * IACT v4.0 - Componente React Select para dropdowns
 * Reemplaza: bootstrap-selectpicker
 * 
 * Props:
 *   - options: Array<{ value: string|number, label: string }>
 *   - value: Option | Array<Option> | null
 *   - onChange: (value) => void
 *   - isMulti: boolean (default: false)
 *   - isClearable: boolean (default: true)
 *   - isSearchable: boolean (default: true)
 *   - isDisabled: boolean (default: false)
 *   - placeholder: string (default: 'Selecciona...')
 *   - label: string (opcional)
 *   - required: boolean (default: false)
 */

import React from 'react';
import Select from 'react-select';
import './SelectDropdown.scss';

const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: '#1f2937',
    borderColor: state.isFocused ? '#0ea5e9' : '#374151',
    color: '#fff',
    minHeight: '42px',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(14, 165, 233, 0.1)' : 'none',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: state.isDisabled ? '#374151' : '#0ea5e9',
    },
  }),

  input: (base) => ({
    ...base,
    color: '#fff',
    caretColor: '#0ea5e9',
    fontSize: '14px',
  }),

  placeholder: (base) => ({
    ...base,
    color: '#6b7280',
    fontSize: '14px',
  }),

  singleValue: (base) => ({
    ...base,
    color: '#fff',
    fontSize: '14px',
  }),

  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#0ea5e9'
      : state.isFocused
        ? '#374151'
        : '#111827',
    color: state.isSelected ? '#fff' : '#fff',
    cursor: state.isDisabled ? 'not-allowed' : 'pointer',
    padding: '12px 16px',
    fontSize: '14px',
    transition: 'all 0.15s ease',
    '&:hover': state.isDisabled ? {} : {
      backgroundColor: '#0ea5e9',
      color: '#fff',
    },
  }),

  menu: (base) => ({
    ...base,
    backgroundColor: '#111827',
    border: '1px solid #374151',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
    borderRadius: '4px',
    zIndex: 1000,
  }),

  menuList: (base) => ({
    ...base,
    maxHeight: '300px',
    padding: 0,
    scrollBehavior: 'smooth',

    '::-webkit-scrollbar': {
      width: '8px',
    },

    '::-webkit-scrollbar-track': {
      background: '#1f2937',
    },

    '::-webkit-scrollbar-thumb': {
      background: '#374151',
      borderRadius: '4px',

      ':hover': {
        background: '#4b5563',
      },
    },
  }),

  multiValue: (base) => ({
    ...base,
    backgroundColor: '#0ea5e9',
    borderRadius: '4px',
    padding: '2px 6px',
  }),

  multiValueLabel: (base) => ({
    ...base,
    color: '#fff',
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: 500,
  }),

  multiValueRemove: (base) => ({
    ...base,
    color: '#fff',
    cursor: 'pointer',
    paddingLeft: '4px',
    paddingRight: '4px',
    transition: 'all 0.2s ease',

    '&:hover': {
      backgroundColor: '#dc2626',
      color: '#fff',
    },
  }),

  clearIndicator: (base) => ({
    ...base,
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px 8px',

    '&:hover': {
      color: '#dc2626',
    },
  }),

  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? '#0ea5e9' : '#9ca3af',
    cursor: 'pointer',
    padding: '4px 8px',
    transition: 'color 0.2s ease',

    '&:hover': {
      color: '#0ea5e9',
    },
  }),

  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: '#374151',
  }),

  loadingMessage: (base) => ({
    ...base,
    color: '#9ca3af',
    fontSize: '14px',
    padding: '12px 16px',
  }),

  noOptionsMessage: (base) => ({
    ...base,
    color: '#9ca3af',
    fontSize: '14px',
    padding: '12px 16px',
    backgroundColor: '#111827',
  }),
};

export default function SelectDropdown({
  options = [],
  value = null,
  onChange,
  isMulti = false,
  isClearable = true,
  isSearchable = true,
  isDisabled = false,
  placeholder = 'Selecciona...',
  label = '',
  required = false,
  noOptionsMessage = () => 'Sin opciones',
}) {
  return (
    <div className="select-dropdown-wrapper">
      {label && (
        <label className={`label-control ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}

      <Select
        options={options}
        value={value}
        onChange={onChange}
        isMulti={isMulti}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isDisabled={isDisabled}
        placeholder={placeholder}
        styles={customStyles}
        classNamePrefix="react-select"
        noOptionsMessage={noOptionsMessage}
        theme={(theme) => ({
          ...theme,
          borderRadius: 4,
          colors: {
            ...theme.colors,
            primary: '#0ea5e9',
            primary75: '#06b6d4',
            primary50: '#22d3ee',
            primary25: '#cffafe',
            danger: '#dc2626',
            dangerLight: '#fee2e2',
          },
        })}
        isOptionDisabled={(option) => option.disabled}
        formatOptionLabel={(option) => option.label}
        getOptionLabel={(option) => option?.label || ''}
        getOptionValue={(option) => option?.value || ''}
      />
    </div>
  );
}
