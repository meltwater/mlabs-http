import {
  Counter
} from 'prom-client'

const defaultPrefix = 'mlabs_http_'

export const metricNames = [
  'requests_open',
  'requests_success',
  'requests_error',
  'requests_total'
]

export const registerMetrics = ({
  prefix = defaultPrefix,
  register
}) => {
  const registry = register

  registry.registerMetric(
    new Counter({
      name: `${prefix}requests_total`,
      help: `${prefix}requests_total`
    })
  )
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
}

export const handleFail = ({
  prefix = defaultPrefix,
  register,
  name,
  url,
  method
}) => {
  const metrics = getMetrics(register, prefix)
}

const getMetrics = (register, prefix) => {
  const getMetric = n => register.getSingleMetric(n)
  const metrics = metricNames
    .map(k => ({ n: `${prefix}${k}`, k }))
    .map(({ n, k }) => ({ [k]: getMetric(n) }))
  return Object.assign(...metrics)
}
