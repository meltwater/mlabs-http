import { Registry } from 'prom-client'

import { createClient, registerMetrics } from '../lib'

export default ({ log, baseUrl }) => async (url = '/get') => {
  const register = new Registry()
  registerMetrics({ register })

  const client = createClient({ baseUrl, metrics: register, log })

  const get = async (url = '/get') => {
    try {
      return await client.get(url, { resourceName: url })
    } catch (err) {}
  }

  await Promise.all([
    get(),
    get('/foo'),
    get()
  ])

  get()
  return register.metrics()
}
