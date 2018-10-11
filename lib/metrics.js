import {
  Histogram,
  Gauge,
  Counter
} from 'prom-client'

const defaultPrefix = 'http_client_'

const sharedLabels = [
  'resource',
  'method'
]

const doneLabelsbels = [
  'status_code'
]

const defaultMetrics = [{
  name: 'requests_total',
  help: 'Number of initiated requests',
  type: Counter
}, {
  name: 'requests_open',
  help: 'Number of open requests',
  type: Gauge
}, {
  name: 'requests_failed_total',
  help: 'Number of failed requests',
  labelNames: doneLabelsbels,
  type: Counter
}, {
  name: 'requests_completed_total',
  help: 'Number of successfully completed requests',
  labelNames: doneLabelsbels,
  type: Counter
}, {
  name: 'request_duration_milliseconds',
  help: 'Total request time in milliseconds',
  labelNames: doneLabelsbels,
  buckets: [0, 20, 50, 100, 150, 200, 300, 500, 800, 1200],
  type: Histogram
}]

export const metricNames = new Set(defaultMetrics.map(({ name }) => name))

export const registerMetrics = ({
  prefix = defaultPrefix,
  metricOptions = {},
  register
}) => {
  const registry = register
  const metrics = createMetrics(metricOptions)
  const prefixedMetrics = getPrefixedMetrics(metrics, prefix)

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
  const { common } = getLabels(args)
  metrics.requests_total.inc(common)
  metrics.requests_open.inc(common)
}

export const handleSuccess = ({
  prefix = defaultPrefix,
  register,
  ...args
}) => {
  const metrics = getMetrics(register, prefix)
  const { success } = getLabels(args)
  metrics.requests_completed_total.inc(success)
}

export const handleFail = ({
  prefix = defaultPrefix,
  register,
  ...args
}) => {
  const metrics = getMetrics(register, prefix)
  const { fail } = getLabels(args)
  metrics.requests_failed_total.inc(fail)
}

export const handleDone = ({
  prefix = defaultPrefix,
  register,
  ...args
}) => {
  const metrics = getMetrics(register, prefix)
  const { common } = getLabels(args)
  const { err, data } = args
  const timings = data.timings || err.timings
  metrics.request_duration_milliseconds.observe(common, timings.phases.total)
  metrics.requests_open.dec(common)
}

const getLabels = ({
  resourceName,
  name,
  url,
  method,
  data,
  err
}) => {
  const common = {
    method,
    ...(resourceName ? { resource: resourceName } : {})
  }

  const getFail = () => {
    const { statusCode } = err
    return {
      ...common,
      ...(!isNil(statusCode) ? { 'status_code': statusCode } : {})
    }
  }

  const getSuccess = () => {
    const { statusCode } = data
    return {
      ...common,
      ...(!isNil(statusCode) ? { 'status_code': statusCode } : {})
    }
  }

  return {
    common,
    success: data ? getSuccess() : common,
    fail: err ? getFail() : common
  }
}

const isNil = x => x == null

const getPrefixedMetrics = (metrics, prefix) => metrics.map(
  ({ name, ...rest }) => ({ prefixedName: `${prefix}${name}`, name, ...rest })
)

const getMetrics = (register, prefix) => {
  const getMetric = ({ name, prefixedName }) => ({
    [name]: register.getSingleMetric(prefixedName)
  })
  const prefixedMetrics = getPrefixedMetrics(defaultMetrics, prefix)
  const singleMetrics = prefixedMetrics.map(getMetric)
  return Object.assign(...singleMetrics)
}

const createMetrics = options => defaultMetrics.map(
  metric => ({ ...metric, ...options[metric.name] })
)
