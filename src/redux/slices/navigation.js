/**
 * navigation.slice — IACT v2 (nuevo)
 *
 * Menú y módulos de navegación dinámica (UC_PERM_08).
 * Sincronizado con navigationGateway.js (T2.6).
 */
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import navigationService from '../../services/navigationGateway'

export const fetchNavigationMenu = createAsyncThunk(
  'navigation/fetchNavigationMenu',
  async (params = {}, { rejectWithValue }) => {
    try { return await navigationService.getNavigationMenu(params) }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

export const fetchNavigationModules = createAsyncThunk(
  'navigation/fetchNavigationModules',
  async (params = {}, { rejectWithValue }) => {
    try { return await navigationService.getNavigationModules(params) }
    catch (e) { return rejectWithValue({ message: e.message }) }
  }
)

const navigationSlice = createSlice({
  name: 'navigation',
  initialState: {
    menu:    [],
    modules: [],
    loading: false,
    error:   null,
  },
  reducers: {
    clearNavError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNavigationMenu.pending,   (s) => { s.loading = true;  s.error = null })
      .addCase(fetchNavigationMenu.fulfilled, (s,a) => { s.loading = false; s.menu = a.payload?.menu ?? a.payload ?? [] })
      .addCase(fetchNavigationMenu.rejected,  (s,a) => { s.loading = false; s.error = a.payload })
      .addCase(fetchNavigationModules.pending,   (s) => { s.loading = true;  s.error = null })
      .addCase(fetchNavigationModules.fulfilled, (s,a) => { s.loading = false; s.modules = a.payload?.modules ?? a.payload ?? [] })
      .addCase(fetchNavigationModules.rejected,  (s,a) => { s.loading = false; s.error = a.payload })
  },
})

export const { clearNavError } = navigationSlice.actions
const sel = (s) => s.navigation
export const selectNavMenu    = createSelector(sel, (s) => s.menu)
export const selectNavModules = createSelector(sel, (s) => s.modules)
export const selectNavLoading = createSelector(sel, (s) => s.loading)
export const selectNavError   = createSelector(sel, (s) => s.error)

export default navigationSlice.reducer
