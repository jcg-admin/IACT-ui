import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import apiService from '../../services/apiClient'

export const fetchSavedFilters = createAsyncThunk(
  'savedFilters/fetchSavedFilters',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.get('/api/me/filters/')
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const saveFilter = createAsyncThunk(
  'savedFilters/saveFilter',
  async ({ name, filters }, { rejectWithValue }) => {
    try {
      return await apiService.post('/api/me/filters/', { name, filters })
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const deleteFilter = createAsyncThunk(
  'savedFilters/deleteFilter',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/api/me/filters/${id}/`)
      return id
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const updateFilter = createAsyncThunk(
  'savedFilters/updateFilter',
  async ({ id, name, filters }, { rejectWithValue }) => {
    try {
      return await apiService.patch(`/api/me/filters/${id}/`, { name, filters })
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const setDefaultFilter = createAsyncThunk(
  'savedFilters/setDefaultFilter',
  async (id, { rejectWithValue }) => {
    try {
      return await apiService.patch(`/api/me/filters/${id}/`, { is_default: true })
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

const savedFiltersSlice = createSlice({
  name: 'savedFilters',
  initialState: {
    savedFilters: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSavedFilters.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchSavedFilters.fulfilled, (state, action) => {
        state.loading = false
        state.savedFilters = action.payload?.results ?? action.payload ?? []
      })
      .addCase(fetchSavedFilters.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(saveFilter.pending, (state) => { state.loading = true })
      .addCase(saveFilter.fulfilled, (state, action) => {
        state.loading = false
        state.savedFilters.push(action.payload)
      })
      .addCase(saveFilter.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(deleteFilter.pending, (state) => { state.loading = true })
      .addCase(deleteFilter.fulfilled, (state, action) => {
        state.loading = false
        state.savedFilters = state.savedFilters.filter((f) => f.id !== action.payload)
      })
      .addCase(deleteFilter.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(updateFilter.pending, (state) => { state.loading = true })
      .addCase(updateFilter.fulfilled, (state, action) => {
        state.loading = false
        const idx = state.savedFilters.findIndex((f) => f.id === action.payload.id)
        if (idx !== -1) state.savedFilters[idx] = action.payload
      })
      .addCase(updateFilter.rejected, (state, action) => { state.loading = false; state.error = action.payload })

      .addCase(setDefaultFilter.fulfilled, (state, action) => {
        state.savedFilters = state.savedFilters.map((f) => ({
          ...f,
          is_default: f.id === action.payload.id,
        }))
      })
  },
})

export default savedFiltersSlice.reducer

const selectState = (state) => state.savedFilters

export const selectSavedFilters = createSelector(selectState, (s) => s.savedFilters)
export const selectSavedFiltersLoading = createSelector(selectState, (s) => s.loading)
