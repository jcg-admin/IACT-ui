import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import apiService from '../../services/apiService'

export const fetchSavedFilters = createAsyncThunk(
  'savedFilters/fetchSavedFilters',
  async (_, { rejectWithValue }) => {
    try {
      return await apiService.get('/api/reports/saved-filters/')
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const saveFilter = createAsyncThunk(
  'savedFilters/saveFilter',
  async ({ name, filters }, { rejectWithValue }) => {
    try {
      return await apiService.post('/api/reports/saved-filters/', { name, filters })
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const deleteFilter = createAsyncThunk(
  'savedFilters/deleteFilter',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/api/reports/saved-filters/${id}/`)
      return id
    } catch (error) {
      return rejectWithValue(error.message)
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
  },
})

export default savedFiltersSlice.reducer

const selectState = (state) => state.savedFilters

export const selectSavedFilters = createSelector(selectState, (s) => s.savedFilters)
export const selectSavedFiltersLoading = createSelector(selectState, (s) => s.loading)
