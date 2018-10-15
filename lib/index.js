export { HttpClient } from './class'
export {
  default,
  default as createClient
} from './factory'

export {
  registerClient,
  registerClients
} from './register'

export {
  metricNames,
  registerMetrics,
  handleStart as metricsHandleStart,
  handleDone as metricsHandleDone,
  handleFail as metricsHandleFail,
  handleSuccess as metricsHandleSuccess
} from './metrics'
