import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit'
import sharesService from '../../services/sharesGateway'

export const createShare = createAsyncThunk(
  'shares/createShare',
  async (payload, { rejectWithValue }) => {
    try {
      return await sharesService.createShare(payload)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null, code: error.response?.data?.code ?? null })
    }
  }
)

export const revokeShare = createAsyncThunk(
  'shares/revokeShare',
  async (shareId, { rejectWithValue }) => {
    try {
      await sharesService.revokeShare(shareId)
      return shareId
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const fetchSharesSent = createAsyncThunk(
  'shares/fetchSharesSent',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await sharesService.getSharesSent(params)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

export const fetchSharesReceived = createAsyncThunk(
  'shares/fetchSharesReceived',
  async (params = {}, { rejectWithValue }) => {
    try {
      return await sharesService.getSharesReceived(params)
    } catch (error) {
      return rejectWithValue({ message: error.message, statusCode: error.response?.status ?? null })
    }
  }
)

const sharesSlice = createSlice({
  name: 'shares',
  initialState: {
    sent: [],
    received: [],
    loading: false,
    error: null,
    createStatus: null,
  },
  reducers: {
    resetCreateStatus: (state) => {
      state.createStatus = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null }
    const rejected = (state, action) => { state.loading = false; state.error = action.payload }

    builder
      .addCase(createShare.pending, (state) => { state.createStatus = 'pending'; state.error = null })
      .addCase(createShare.fulfilled, (state, action) => {
        state.createStatus = 'success'
        state.sent.unshift(action.payload)
      })
      .addCase(createShare.rejected, (state, action) => {
        state.createStatus = 'error'
        state.error = action.payload
      })

      .addCase(revokeShare.pending, pending)
      .addCase(revokeShare.fulfilled, (state, action) => {
        state.loading = false
        const share = state.sent.find((s) => s.id === action.payload)
        if (share) share.revoked_at = new Date().toISOString()
      })
      .addCase(revokeShare.rejected, rejected)

      .addCase(fetchSharesSent.pending, pending)
      .addCase(fetchSharesSent.fulfilled, (state, action) => {
        state.loading = false
        state.sent = action.payload?.results ?? action.payload ?? []
      })
      .addCase(fetchSharesSent.rejected, rejected)

      .addCase(fetchSharesReceived.pending, pending)
      .addCase(fetchSharesReceived.fulfilled, (state, action) => {
        state.loading = false
        state.received = action.payload?.results ?? action.payload ?? []
      })
      .addCase(fetchSharesReceived.rejected, rejected)
  },
})

export const { resetCreateStatus } = sharesSlice.actions
export default sharesSlice.reducer

const selectSharesState = (state) => state.shares

export const selectSharesSent = createSelector(selectSharesState, (s) => s.sent)
export const selectSharesReceived = createSelector(selectSharesState, (s) => s.received)
export const selectSharesLoading = createSelector(selectSharesState, (s) => s.loading)
export const selectSharesError = createSelector(selectSharesState, (s) => s.error)
export const selectShareCreateStatus = createSelector(selectSharesState, (s) => s.createStatus)
