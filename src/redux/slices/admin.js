/**
 * Admin Slice
 *
 * Gestión de estado para administración de catálogos RBAC.
 * Incluye thunks RTK para CRUD de funciones y AGRs.
 */

import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import adminService from '../../services/adminGateway'

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

// ── Thunks — Reglas SoD (UC-ADM-01) ─────────────────────────────────────────

export const fetchAdminSeparationRules = createAsyncThunk(
  'admin/fetchAdminSeparationRules',
  async (_, { rejectWithValue }) => {
    try {
      return await adminService.getSeparationRules()
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const createSeparationRule = createAsyncThunk(
  'admin/createSeparationRule',
  async (data, { rejectWithValue }) => {
    try {
      return await adminService.createSeparationRule(data)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const updateSeparationRule = createAsyncThunk(
  'admin/updateSeparationRule',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await adminService.updateSeparationRule(id, data)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const toggleSeparationRuleStatus = createAsyncThunk(
  'admin/toggleSeparationRuleStatus',
  async (id, { rejectWithValue }) => {
    try {
      return await adminService.toggleSeparationRuleStatus(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

// ── Thunks — MenuItems (UC-ADM-04/05) ────────────────────────────────────────

export const fetchMenuItems = createAsyncThunk(
  'admin/fetchMenuItems',
  async (filters = {}, { rejectWithValue }) => {
    try {
      return await adminService.getMenuItems(filters)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const createMenuItem = createAsyncThunk(
  'admin/createMenuItem',
  async (data, { rejectWithValue }) => {
    try {
      return await adminService.createMenuItem(data)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const updateMenuItem = createAsyncThunk(
  'admin/updateMenuItem',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      return await adminService.updateMenuItem(id, data)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const publishMenuItem = createAsyncThunk(
  'admin/publishMenuItem',
  async (id, { rejectWithValue }) => {
    try {
      return await adminService.publishMenuItem(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const deprecateMenuItem = createAsyncThunk(
  'admin/deprecateMenuItem',
  async (id, { rejectWithValue }) => {
    try {
      return await adminService.deprecateMenuItem(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const reactivateMenuItem = createAsyncThunk(
  'admin/reactivateMenuItem',
  async (id, { rejectWithValue }) => {
    try {
      return await adminService.reactivateMenuItem(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const archiveMenuItem = createAsyncThunk(
  'admin/archiveMenuItem',
  async (id, { rejectWithValue }) => {
    try {
      return await adminService.archiveMenuItem(id)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

// ── Thunks — Composición de AGR de sistema (UC-ADM-03) ───────────────────────

export const fetchAGRComposition = createAsyncThunk(
  'admin/fetchAGRComposition',
  async (agrId, { rejectWithValue }) => {
    try {
      const data = await adminService.getAGRComposition(agrId)
      return { agrId, ...data }
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const addFunctionToAGR = createAsyncThunk(
  'admin/addFunctionToAGR',
  async ({ agrId, functionCodename }, { rejectWithValue }) => {
    try {
      const data = await adminService.addFunctionToAGR(agrId, functionCodename)
      return { agrId, functionCodename, ...data }
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const removeFunctionFromAGR = createAsyncThunk(
  'admin/removeFunctionFromAGR',
  async ({ agrId, functionCodename }, { rejectWithValue }) => {
    try {
      await adminService.removeFunctionFromAGR(agrId, functionCodename)
      return { agrId, functionCodename }
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const fetchAGRImpact = createAsyncThunk(
  'admin/fetchAGRImpact',
  async (agrId, { rejectWithValue }) => {
    try {
      const data = await adminService.getAGRImpact(agrId)
      return { agrId, ...data }
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

// ── Thunks — Bulk reorder + block-archive (UC-ADM-04/05) ─────────────────────

export const bulkReorderMenuItems = createAsyncThunk(
  'admin/bulkReorderMenuItems',
  async (items, { rejectWithValue }) => {
    try {
      return await adminService.bulkReorderMenuItems(items)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const blockAutoArchive = createAsyncThunk(
  'admin/blockAutoArchive',
  async ({ id, blockReason }, { rejectWithValue }) => {
    try {
      return await adminService.blockAutoArchive(id, blockReason)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const unblockAutoArchive = createAsyncThunk(
  'admin/unblockAutoArchive',
  async (id, { rejectWithValue }) => {
    try {
      return await adminService.unblockAutoArchive(id)
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
    separationRules: [],
    menuItems: [],
    systemGroupCompositions: {},
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

    // fetchAdminSeparationRules
    builder
      .addCase(fetchAdminSeparationRules.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchAdminSeparationRules.fulfilled, (state, action) => {
        state.separationRules = action.payload?.results ?? action.payload ?? []
        state.loading = false
      })
      .addCase(fetchAdminSeparationRules.rejected, (state, action) => { state.loading = false; state.error = action.payload })

    builder
      .addCase(createSeparationRule.fulfilled, (state, action) => { state.separationRules.push(action.payload) })
      .addCase(createSeparationRule.rejected, (state, action) => { state.error = action.payload })

    builder
      .addCase(updateSeparationRule.fulfilled, (state, action) => {
        const idx = state.separationRules.findIndex((r) => r.id === action.payload.id)
        if (idx !== -1) state.separationRules[idx] = action.payload
      })
      .addCase(updateSeparationRule.rejected, (state, action) => { state.error = action.payload })

    builder
      .addCase(toggleSeparationRuleStatus.fulfilled, (state, action) => {
        const idx = state.separationRules.findIndex((r) => r.id === action.payload.id)
        if (idx !== -1) state.separationRules[idx] = action.payload
      })
      .addCase(toggleSeparationRuleStatus.rejected, (state, action) => { state.error = action.payload })

    // fetchMenuItems
    builder
      .addCase(fetchMenuItems.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchMenuItems.fulfilled, (state, action) => {
        state.menuItems = action.payload?.results ?? action.payload ?? []
        state.loading = false
      })
      .addCase(fetchMenuItems.rejected, (state, action) => { state.loading = false; state.error = action.payload })

    builder
      .addCase(createMenuItem.fulfilled, (state, action) => { state.menuItems.push(action.payload) })
      .addCase(createMenuItem.rejected, (state, action) => { state.error = action.payload })

    builder
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        const idx = state.menuItems.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.menuItems[idx] = action.payload
      })
      .addCase(updateMenuItem.rejected, (state, action) => { state.error = action.payload })

    const updateMenuItemInState = (state, action) => {
      const idx = state.menuItems.findIndex((i) => i.id === action.payload.id)
      if (idx !== -1) state.menuItems[idx] = action.payload
    }

    builder
      .addCase(publishMenuItem.fulfilled, updateMenuItemInState)
      .addCase(publishMenuItem.rejected, (state, action) => { state.error = action.payload })

    builder
      .addCase(deprecateMenuItem.fulfilled, updateMenuItemInState)
      .addCase(deprecateMenuItem.rejected, (state, action) => { state.error = action.payload })

    builder
      .addCase(reactivateMenuItem.fulfilled, updateMenuItemInState)
      .addCase(reactivateMenuItem.rejected, (state, action) => { state.error = action.payload })

    builder
      .addCase(archiveMenuItem.fulfilled, updateMenuItemInState)
      .addCase(archiveMenuItem.rejected, (state, action) => { state.error = action.payload })

    // fetchAGRComposition
    builder
      .addCase(fetchAGRComposition.fulfilled, (state, action) => {
        const { agrId, functions } = action.payload
        if (!state.systemGroupCompositions[agrId]) state.systemGroupCompositions[agrId] = {}
        state.systemGroupCompositions[agrId].functions = functions ?? []
        state.systemGroupCompositions[agrId].error = null
      })
      .addCase(fetchAGRComposition.rejected, (state, action) => { state.error = action.payload })

    // addFunctionToAGR
    builder
      .addCase(addFunctionToAGR.fulfilled, (state, action) => {
        const { agrId, functionCodename } = action.payload
        if (!state.systemGroupCompositions[agrId]) state.systemGroupCompositions[agrId] = { functions: [] }
        const fns = state.systemGroupCompositions[agrId].functions
        if (!fns.includes(functionCodename)) fns.push(functionCodename)
      })
      .addCase(addFunctionToAGR.rejected, (state, action) => { state.error = action.payload })

    // removeFunctionFromAGR
    builder
      .addCase(removeFunctionFromAGR.fulfilled, (state, action) => {
        const { agrId, functionCodename } = action.payload
        if (state.systemGroupCompositions[agrId]?.functions) {
          state.systemGroupCompositions[agrId].functions =
            state.systemGroupCompositions[agrId].functions.filter(f => f !== functionCodename)
        }
      })
      .addCase(removeFunctionFromAGR.rejected, (state, action) => { state.error = action.payload })

    // fetchAGRImpact
    builder
      .addCase(fetchAGRImpact.fulfilled, (state, action) => {
        const { agrId, ...impact } = action.payload
        if (!state.systemGroupCompositions[agrId]) state.systemGroupCompositions[agrId] = {}
        state.systemGroupCompositions[agrId].impact = impact
      })
      .addCase(fetchAGRImpact.rejected, (state, action) => { state.error = action.payload })

    // bulkReorderMenuItems
    builder
      .addCase(bulkReorderMenuItems.fulfilled, (state, action) => {
        const updated = action.payload?.items ?? []
        updated.forEach(({ id, display_order }) => {
          const item = state.menuItems.find(i => i.id === id)
          if (item) item.display_order = display_order
        })
      })
      .addCase(bulkReorderMenuItems.rejected, (state, action) => { state.error = action.payload })

    // blockAutoArchive
    builder
      .addCase(blockAutoArchive.fulfilled, (state, action) => {
        const updated = action.payload
        const idx = state.menuItems.findIndex(i => i.id === updated.id)
        if (idx !== -1) state.menuItems[idx] = updated
      })
      .addCase(blockAutoArchive.rejected, (state, action) => { state.error = action.payload })

    // unblockAutoArchive
    builder
      .addCase(unblockAutoArchive.fulfilled, (state, action) => {
        const updated = action.payload
        const idx = state.menuItems.findIndex(i => i.id === updated.id)
        if (idx !== -1) state.menuItems[idx] = updated
      })
      .addCase(unblockAutoArchive.rejected, (state, action) => { state.error = action.payload })
  },
})

// ── Selectores ────────────────────────────────────────────────────────────────

const selectAdminState = (state) => state.admin

export const selectFunctions = createSelector(selectAdminState, (s) => s.functions)
export const selectAGRs = createSelector(selectAdminState, (s) => s.agrs)
export const selectAdminSeparationRules = createSelector(selectAdminState, (s) => s.separationRules)
export const selectMenuItems = createSelector(selectAdminState, (s) => s.menuItems)
export const selectAdminLoading = createSelector(selectAdminState, (s) => s.loading)
export const selectAdminError = createSelector(selectAdminState, (s) => s.error)
export const selectAGRComposition = (agrId) => (state) =>
  state.admin.systemGroupCompositions[agrId] ?? { functions: [], impact: null }

export default adminSlice.reducer
