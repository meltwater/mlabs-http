import {
  Counter
} from 'prom-client'

const defaultPrefix = 'mlabs_http_'

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

export const updateMetrics = ({
  prefix = defaultPrefix,
  url,
  method,
  name,
  register,
  data
}) => {
  register.getSingleMetric(`${prefix}requests_total`).inc()
}
