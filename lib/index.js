export { HttpClient } from './class'
export {
  default,
  default as createClient
} from './factory'

export {
  metricNames,
  registerMetrics,
  metricsPrefix as defaultMetricsPrefix,
  handleStart as metricsHandleStart,
  handleDone as metricsHandleDone,
  handleFail as metricsHandleFail,
  handleSuccess as metricsHandleSuccess
} from './metrics'
