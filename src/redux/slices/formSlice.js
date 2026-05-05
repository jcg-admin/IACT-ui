/**
 * formSlice.js
 * IACT v4.0 - Redux slice para estado de formularios y filtros
 * Gestiona: dateStart, dateEnd, selectedOptions, filtros generales
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Filtros de fecha
  dateStart: null,
  dateEnd: null,

  // Opciones seleccionadas
  selectedAction: null,
  selectedSeverity: null,
  selectedStatus: null,
  selectedUser: null,
  selectedType: null,

  // Filtros generales
  filters: {
    action: null,
    severity: null,
    status: null,
    user: null,
    type: null,
    searchQuery: '',
  },

  // Estado de UI
  isLoading: false,
  error: null,
  success: false,
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    // Setear fechas
    setDateStart: (state, action) => {
      state.dateStart = action.payload;
    },
    setDateEnd: (state, action) => {
      state.dateEnd = action.payload;
    },

    // Setear selecciones
    setSelectedAction: (state, action) => {
      state.selectedAction = action.payload;
    },
    setSelectedSeverity: (state, action) => {
      state.selectedSeverity = action.payload;
    },
    setSelectedStatus: (state, action) => {
      state.selectedStatus = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setSelectedType: (state, action) => {
      state.selectedType = action.payload;
    },

    // Setear filtros
    setFilter: (state, action) => {
      const { name, value } = action.payload;
      state.filters[name] = value;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    // Búsqueda
    setSearchQuery: (state, action) => {
      state.filters.searchQuery = action.payload;
    },

    // Estado de carga
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
    },

    // Limpiar filtros
    resetFilters: (state) => {
      state.dateStart = null;
      state.dateEnd = null;
      state.selectedAction = null;
      state.selectedSeverity = null;
      state.selectedStatus = null;
      state.selectedUser = null;
      state.selectedType = null;
      state.filters = initialState.filters;
      state.error = null;
    },

    // Resetear estado completo
    resetForm: () => initialState,

    // Aplicar filtros (para filtros complejos)
    applyFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      state.isLoading = false;
      state.success = true;
    },
  },
});

// Actions
export const {
  setDateStart,
  setDateEnd,
  setSelectedAction,
  setSelectedSeverity,
  setSelectedStatus,
  setSelectedUser,
  setSelectedType,
  setFilter,
  setFilters,
  setSearchQuery,
  setLoading,
  setError,
  setSuccess,
  resetFilters,
  resetForm,
  applyFilters,
} = formSlice.actions;

// Selectors
export const selectDateStart = (state) => state.form.dateStart;
export const selectDateEnd = (state) => state.form.dateEnd;
export const selectSelectedAction = (state) => state.form.selectedAction;
export const selectSelectedSeverity = (state) => state.form.selectedSeverity;
export const selectSelectedStatus = (state) => state.form.selectedStatus;
export const selectSelectedUser = (state) => state.form.selectedUser;
export const selectSelectedType = (state) => state.form.selectedType;
export const selectFilters = (state) => state.form.filters;
export const selectSearchQuery = (state) => state.form.filters.searchQuery;
export const selectIsLoading = (state) => state.form.isLoading;
export const selectError = (state) => state.form.error;
export const selectSuccess = (state) => state.form.success;

// Selector para obtener todos los filtros activos
export const selectActiveFilters = (state) => {
  const { dateStart, dateEnd, selectedAction, selectedSeverity, filters } = state.form;
  return {
    dateStart,
    dateEnd,
    action: selectedAction?.value || null,
    severity: selectedSeverity?.value || null,
    ...filters,
  };
};

export default formSlice.reducer;
