import { Registry } from 'prom-client'

import { createClient, registerMetrics } from '../lib'

export default ({ log, baseUrl }) => async (url = '/get') => {
  const register = new Registry()
  registerMetrics({ register })

  const client = createClient({ baseUrl, metrics: register, log })
  const resource = '/get'
  await Promise.all([
    client.get(url, { resource }),
    client.get(url, { resource }),
    client.get(url, { resource })
  ])

  return register.metrics()
}
