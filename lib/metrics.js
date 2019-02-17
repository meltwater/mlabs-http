import {
  Histogram,
  Gauge,
  Counter
} from 'prom-client'

export const defaultPrefix = 'http_client_'

const sharedLabels = [
  'client',
  'resource',
  'method'
]

const doneLabels = [
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
  labelNames: doneLabels,
  type: Counter
}, {
  name: 'requests_failed_cached_total',
  help: 'Number of failed requests from cache',
  labelNames: doneLabels,
  type: Counter
}, {
  name: 'requests_completed_total',
  help: 'Number of successfully completed requests',
  labelNames: doneLabels,
  type: Counter
}, {
  name: 'requests_completed_cached_total',
  help: 'Number of successfully completed requests from cache',
  labelNames: doneLabels,
  type: Counter
}, {
  name: 'request_duration_milliseconds',
  help: 'Total request time in milliseconds',
  labelNames: doneLabels,
  buckets: [0, 20, 50, 100, 150, 200, 300, 500, 800, 1200],
  type: Histogram
}]

export const metricNames = new Set(defaultMetrics.map(({ name }) => name))

export const collectMetrics = ({
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
  const { fromCache = false } = args.data || {}
  metrics.requests_completed_total.inc(success)
  if (fromCache) metrics.requests_completed_cached_total.inc(success)
}

export const handleFail = ({
  prefix = defaultPrefix,
  register,
  ...args
}) => {
  const metrics = getMetrics(register, prefix)
  const { fail } = getLabels(args)
  const { fromCache = false } = args.err || {}
  metrics.requests_failed_total.inc(fail)
  if (fromCache) metrics.requests_failed_cached_total.inc(fail)
}

export const handleDone = ({
  prefix = defaultPrefix,
  register,
  ...args
}) => {
  const metrics = getMetrics(register, prefix)
  const { common } = getLabels(args)
  const { err = {}, data = {} } = args
  const timings = getTimings(data) || getTimings(err)

  metrics.requests_open.dec(common)

  if (!timings) return
  const duration = timings.phases.total
  if (duration !== null) metrics.request_duration_milliseconds.observe(common, duration)
}

const getLabels = ({
  name,
  resourceName,
  method,
  data,
  err
}) => {
  const common = {
    method: method.toLowerCase(),
    ...(name ? { client: name } : {}),
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

const getTimings = x => x && x.hasOwnProperty('timings') && x.timings
