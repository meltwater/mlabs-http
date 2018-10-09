import { Registry } from 'prom-client'

import { createClient, registerMetrics } from '../lib'

export default ({ log, baseUrl }) => async (url = '/get') => {
  const register = new Registry()
  registerMetrics({ register })

  const client = createClient({ baseUrl, metrics: register, log })
  const resourceName = '/get'
  await Promise.all([
    client.get(url, { resourceName }),
    client.get(url, { resourceName }),
    client.get(url, { resourceName })
  ])

  return register.metrics()
}
