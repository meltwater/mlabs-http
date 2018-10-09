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
  labelNames: doneLabelsbels,
  type: Counter
}, {
  name: 'requests_success_total',
  help: 'Number of successful requests',
  labelNames: doneLabelsbels,
  type: Counter
}, {
  name: 'requests_duration_milliseconds',
  help: 'Total request time in milliseconds',
  labelNames: doneLabelsbels,
  buckets: [0, 20, 50, 100, 150, 200, 300, 500, 800, 1200],
  type: Histogram
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
  const { common } = getLabels(args)
  metrics.requests_total.inc(common)
  metrics.requests_open_total.inc(common)
}

export const handleSuccess = ({
  prefix = defaultPrefix,
  register,
  ...args
}) => {
  const metrics = getMetrics(register, prefix)
  const { success } = getLabels(args)
  metrics.requests_success_total.inc(success)
}

export const handleFail = ({
  prefix = defaultPrefix,
  register,
  ...args
}) => {
  const metrics = getMetrics(register, prefix)
  const { fail } = getLabels(args)
  metrics.requests_fail_total.inc(fail)
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
  console.log('>>>', timings)
  metrics.requests_duration_milliseconds.observe(common, timings.phases.total)
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
