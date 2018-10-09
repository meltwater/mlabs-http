import {
  Gauge,
  Counter
} from 'prom-client'

const defaultPrefix = 'http_client_'

const sharedLabels = [
  'resource',
  'method',
  'status_code'
]

const metrics = [{
  name: 'requests_total',
  help: 'Number of initiated requests',
  type: Counter
}, {
  name: 'requests_open_total',
  help: 'Number of open requests',
  type: Gauge
}, {
  name: 'requests_fail_total',
  help: 'Number of failed requests',
  type: Counter
}, {
  name: 'requests_success_total',
  help: 'Number of successful requests',
  type: Counter
}]

export const metricNames = Object.keys(metrics)

export const registerMetrics = ({
  prefix = defaultPrefix,
  register
}) => {
  const registry = register
  const prefixedMetrics = getPrefixedMetrics(prefix)

  for (const prefixedMetric of prefixedMetrics) {
    const { prefixedName, labelNames = [], type: MetricType, ...args } = prefixedMetric
    const metric = new MetricType({
      ...args,
      labelNames: [...sharedLabels, ...labelNames],
      name: prefixedName
    })
    registry.registerMetric(metric)
  }
}

export const handleStart = ({
  prefix = defaultPrefix,
  register,
  ...args
}) => {
  const metrics = getMetrics(register, prefix)
  const labels = getLabels(args)
  metrics.requests_total.inc(labels)
  metrics.requests_open_total.inc(labels)
}

export const handleSuccess = ({
  prefix = defaultPrefix,
  register,
  ...args
}) => {
  const metrics = getMetrics(register, prefix)
  const labels = getLabels(args)
  metrics.requests_success_total.inc(labels)
  metrics.requests_open_total.dec(labels)
}

export const handleFail = ({
  prefix = defaultPrefix,
  register,
  ...args
}) => {
  const metrics = getMetrics(register, prefix)
  const labels = getLabels(args)
  metrics.requests_fail_total.inc(labels)
  metrics.requests_open_total.dec(labels)
}

const getLabels = ({
  resourceName,
  name,
  url,
  method
}) => {
  return {
    method,
    ...(resourceName ? { resource: resourceName } : {})
  }
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
