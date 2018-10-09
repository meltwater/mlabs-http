import {
  Counter
} from 'prom-client'

const defaultPrefix = 'http_client_'

const metrics = [{
  name: 'requests_total',
  help: 'Number of initiated requests',
  type: Counter
}]

export const metricNames = Object.keys(metrics)

export const registerMetrics = ({
  prefix = defaultPrefix,
  register
}) => {
  const registry = register
  const prefixedMetrics = getPrefixedMetrics(prefix)

  for (const { prefixedName, type: MetricType, ...args } of prefixedMetrics) {
    const metric = new MetricType({ ...args, name: prefixedName })
    registry.registerMetric(metric)
  }
}

export const handleStart = ({
  prefix = defaultPrefix,
  register,
  name,
  url,
  method
}) => {
  const metrics = getMetrics(register, prefix)
  metrics.requests_total.inc()
}

export const handleSuccess = ({
  prefix = defaultPrefix,
  register,
  name,
  url,
  method
}) => {
  const metrics = getMetrics(register, prefix)
  return metrics
}

export const handleFail = ({
  prefix = defaultPrefix,
  register,
  name,
  url,
  method
}) => {
  const metrics = getMetrics(register, prefix)
  return metrics
}

const getPrefixedMetrics = prefix => metrics.map(
  ({ name, ...rest }) => ({ prefixedName: `${prefix}${name}`, name, ...rest })
)

const getMetrics = (register, prefix) => {
  const getMetric = ({ name, prefixedName }) => ({
    [name]: register.getSingleMetric(prefixedName)
  })
  const prefixedMetrics = getPrefixedMetrics(prefix)
  const singleMetrics = prefixedMetrics.map(getMetric)
  return Object.assign(...singleMetrics)
}
