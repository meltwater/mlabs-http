import test from 'ava'
import nock from 'nock'
import got from 'got'
import createLogger from '@meltwater/mlabs-logger'

import { HttpClient } from './class'

test.beforeEach(t => {
  nock.disableNetConnect()

  const api = 'https://example.com'

  const client = (t, reqId) => new HttpClient({
    resLogLevel: 'info',
    got: got.extend({ baseUrl: api }),
    log: createLogger({ t })
  })

  t.context.api = api
  t.context.client = client
})

test('get', async t => {
  const { api, client } = t.context
  const data = { foo: 'bar' }
  nock(api).get('/').reply(200, { data })
  await client(t).get('/')
  t.pass()
})
