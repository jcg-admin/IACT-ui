import { createSlice, createSelector } from '@reduxjs/toolkit'

const initialState = {
  contexts: {},
}

const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    incrementContext(state, action) {
      const ctx = action.payload
      state.contexts[ctx] = (state.contexts[ctx] ?? 0) + 1
    },
    decrementContext(state, action) {
      const ctx = action.payload
      const current = state.contexts[ctx] ?? 0
      if (current <= 1) {
        delete state.contexts[ctx]
      } else {
        state.contexts[ctx] = current - 1
      }
    },
  },
})

export const { incrementContext, decrementContext } = loadingSlice.actions
export default loadingSlice.reducer

export const selectIsLoading = (context) => (state) =>
  (state.loading?.contexts[context] ?? 0) > 0

export const selectAnyLoading = createSelector(
  (state) => state.loading.contexts,
  (contexts) => Object.values(contexts).some((count) => count > 0)
)
