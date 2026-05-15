// Hooks barrel export
// Organized into domain-specific and utility hooks

// Domain hooks - Business logic specific
export {
  useIdentity,
  useJobs,
  useExport,
  useForm,
  useJobStatus,
  useMetrics,
  useLocalTransaction, // T5.2: sustituye a useTransaction (API inexistente)
  useRealTimeChannel,
  useAlertFeed,
  usePasswordStrength,
  useMenuToggle,
  useRequest
} from './domain'

// Utility hooks - Reusable generic hooks
export {
  useAsync,
  useBreakpoint,
  useClickAway,
  useDebounce,
  useInterval,
  useKeyPress,
  useLocalStorage,
  useMediaQuery,
  useMountedState,
  usePrevious,
  useThrottle,
  useTimeout
} from './utils'
