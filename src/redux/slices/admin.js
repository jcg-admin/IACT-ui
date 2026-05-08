/**
 * Admin Slice
 *
 * Gestión de estado para administración de catálogos RBAC.
 * Incluye thunks RTK para CRUD de funciones y AGRs.
 */

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import adminService from '../../services/adminService'

// ── Thunks — Funciones RBAC ──────────────────────────────────────────────────

/** Obtiene el catálogo completo de funciones RBAC. */
export const fetchFunctions = createAsyncThunk(
  'admin/fetchFunctions',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getFunctions()
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

/** Crea una nueva función RBAC. */
export const createFunction = createAsyncThunk(
  'admin/createFunction',
  async (data, { rejectWithValue }) => {
    try {
      return await adminService.createFunction(data)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

/** Actualiza una función RBAC existente. */
export const updateFunction = createAsyncThunk(
  'admin/updateFunction',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await adminService.updateFunction(id, data)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

/** Desactiva una función RBAC (soft-delete). */
export const deactivateFunction = createAsyncThunk(
  'admin/deactivateFunction',
  async (id, { rejectWithValue }) => {
    try {
      return await adminService.deactivateFunction(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

// ── Thunks — AGRs ────────────────────────────────────────────────────────────

/** Obtiene el catálogo completo de AGRs. */
export const fetchAGRCatalog = createAsyncThunk(
  'admin/fetchAGRCatalog',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getAGRCatalog()
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

/** Crea un nuevo AGR. */
export const createAGR = createAsyncThunk(
  'admin/createAGR',
  async (data, { rejectWithValue }) => {
    try {
      return await adminService.createAGR(data)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

/** Actualiza un AGR existente. */
export const updateAGR = createAsyncThunk(
  'admin/updateAGR',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await adminService.updateAGR(id, data)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

/** Desactiva un AGR (soft-delete). */
export const deactivateAGR = createAsyncThunk(
  'admin/deactivateAGR',
  async (id, { rejectWithValue }) => {
    try {
      return await adminService.deactivateAGR(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────────────────────

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    functions: [],
    agrs: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // fetchFunctions
    builder
      .addCase(fetchFunctions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFunctions.fulfilled, (state, action) => {
        const payload = action.payload
        state.functions = payload.results ?? payload
        state.loading = false
      })
      .addCase(fetchFunctions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // createFunction
    builder
      .addCase(createFunction.fulfilled, (state, action) => {
        state.functions.push(action.payload)
      })
      .addCase(createFunction.rejected, (state, action) => {
        state.error = action.payload
      })

    // updateFunction
    builder
      .addCase(updateFunction.fulfilled, (state, action) => {
        const updated = action.payload
        const idx = state.functions.findIndex((f) => f.id === updated.id)
        if (idx !== -1) state.functions[idx] = updated
      })
      .addCase(updateFunction.rejected, (state, action) => {
        state.error = action.payload
      })

    // deactivateFunction
    builder
      .addCase(deactivateFunction.fulfilled, (state, action) => {
        const updated = action.payload
        const idx = state.functions.findIndex((f) => f.id === updated.id)
        if (idx !== -1) state.functions[idx] = updated
      })
      .addCase(deactivateFunction.rejected, (state, action) => {
        state.error = action.payload
      })

    // fetchAGRCatalog
    builder
      .addCase(fetchAGRCatalog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAGRCatalog.fulfilled, (state, action) => {
        const payload = action.payload
        state.agrs = payload.results ?? payload
        state.loading = false
      })
      .addCase(fetchAGRCatalog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // createAGR
    builder
      .addCase(createAGR.fulfilled, (state, action) => {
        state.agrs.push(action.payload)
      })
      .addCase(createAGR.rejected, (state, action) => {
        state.error = action.payload
      })

    // updateAGR
    builder
      .addCase(updateAGR.fulfilled, (state, action) => {
        const updated = action.payload
        const idx = state.agrs.findIndex((a) => a.id === updated.id)
        if (idx !== -1) state.agrs[idx] = updated
      })
      .addCase(updateAGR.rejected, (state, action) => {
        state.error = action.payload
      })

    // deactivateAGR
    builder
      .addCase(deactivateAGR.fulfilled, (state, action) => {
        const updated = action.payload
        const idx = state.agrs.findIndex((a) => a.id === updated.id)
        if (idx !== -1) state.agrs[idx] = updated
      })
      .addCase(deactivateAGR.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

// ── Selectores ────────────────────────────────────────────────────────────────

const selectAdminState = (state) => state.admin

export const selectFunctions = createSelector(selectAdminState, (s) => s.functions)
export const selectAGRs = createSelector(selectAdminState, (s) => s.agrs)
export const selectAdminLoading = createSelector(selectAdminState, (s) => s.loading)
export const selectAdminError = createSelector(selectAdminState, (s) => s.error)

export default adminSlice.reducer
