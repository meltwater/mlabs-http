import { Registry } from 'prom-client'

import { createClient, registerMetrics } from '../lib'

export default ({ log, baseUrl }) => async (url = '/get') => {
  const register = new Registry()
  registerMetrics({ register })

  const client = createClient({ baseUrl, metrics: register, log })
  await Promise.all([
    client.get(url),
    client.get(url),
    client.get(url)
  ])

  return register.metrics()
}
