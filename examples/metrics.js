import { Registry } from 'prom-client'

import { createHttpClient, collectMetrics } from '../lib'

export default ({ log, prefixUrl }) => async (url = '/get') => {
  const register = new Registry()
  collectMetrics({
    register,
    metricOptions: {
      request_duration_milliseconds: {
        buckets: [0, 200, 300, 800]
      }
    }
  })

  const client = createHttpClient({ prefixUrl, metricRegistry: register, log })

  const get = async (url = '/get') => {
    try {
      return await client.get(url, { resourceName: url })
    } catch (err) {
      log.error({ err }, 'Get: Fail')
    }
  }

  await Promise.all([get(), get('/foo'), get()])

  get().catch(() => {})
  return register.metrics()
}
