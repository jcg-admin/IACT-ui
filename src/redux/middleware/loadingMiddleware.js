import { incrementContext, decrementContext } from '@redux/slices/loadingSlice'

// Contexts that manage their own loading state or use auth-level spinners
const SILENT_CONTEXTS = new Set(['auth', 'session'])

export const loadingMiddleware = (store) => (next) => (action) => {
  if (!action.type) return next(action)

  const context = action.type.split('/')[0]

  if (!SILENT_CONTEXTS.has(context)) {
    if (action.type.endsWith('/pending')) {
      store.dispatch(incrementContext(context))
    } else if (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')) {
      store.dispatch(decrementContext(context))
    }
  }

  return next(action)
}

export default loadingMiddleware
