import test from 'ava'
import nock from 'nock'
import uuid4 from 'uuid/v4'
import { Registry } from 'prom-client'
import createLogger from '@meltwater/mlabs-logger'

import {
  createClient,
  collectMetrics
} from '../lib'

const metricsPrefix = 'test_'

test.beforeEach(t => {
  nock.disableNetConnect()

  const register = new Registry()

  collectMetrics({
    prefix: metricsPrefix,
    register,
    options: {
      'request_duration_milliseconds': {
        buckets: [0, 10000]
      }
    }
  })

  const api = 'https://example.com'

  const client = (t, options = {}) => createClient({
    extend: { retry: { retries: 0 } },
    baseUrl: api,
    resolveWithFullResponse: true,
    metrics: register,
    metricsPrefix,
    log: createLogger({ t }),
    ...options
  })

  t.context.api = api
  t.context.register = register
  t.context.client = client
  t.context.id = uuid4()
})

test('get', async t => {
  const { id, api, client } = t.context
  const data = { foo: 'bar' }
  nock(api).get(`/good/${id}`).times(3).reply(200, { data })
  nock(api).get(`/bad/${id}`).reply(500, { data })
  const http = client(t)
  await Promise.all([
    http.get(`/good/${id}`, { resourceName: '/good' }),
    http.get(`/good/${id}`, { resourceName: '/good' })
  ])
  try {
    await http.get(`/bad/${id}`, { resourceName: '/bad' })
  } catch (err) {}
  http.get(`/good/${id}`, { resourceName: '/good' }).catch(() => {})
  const metrics = t.context.register.metrics()

  // Remove metric line that depends on millisecond timing
  const m = metrics.split('\n')
  const snapshot = [...m.slice(0, 31), ...m.slice(32)].join('\n')

  t.snapshot(snapshot)
})
