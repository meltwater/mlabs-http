import { Registry } from 'prom-client'

import { createClient, registerMetrics } from '../lib'

export default ({ log, baseUrl }) => async (url = '/get') => {
  const register = new Registry()
  registerMetrics({
    register,
    options: {
      'request_duration_milliseconds': {
        buckets: [0, 200, 300, 800]
      }
    }
  })

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

  get().catch(() => {})
  return register.metrics()
}
