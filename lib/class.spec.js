import test from 'ava'
import nock from 'nock'
import got from 'got'
import uuid4 from 'uuid/v4'
import createLogger from '@meltwater/mlabs-logger'

import { HttpClient } from './class'

test.beforeEach(t => {
  nock.disableNetConnect()

  const api = 'https://example.com'
  const retry = { retries: 0 }

  const client = (t, options = {}) => new HttpClient({
    got: got.extend({ retry, json: true, baseUrl: api }),
    resolveWithFullResponse: true,
    log: createLogger({ t }),
    ...options
  })

  t.context.api = api
  t.context.client = client
  t.context.id = uuid4()
})

test('get: 200', async t => {
  const { id, api, client } = t.context
  const data = { foo: 'bar' }
  nock(api).get(`/${id}`).reply(200, { data })
  const http = client(t)
  const { body, statusCode } = await http.get(`/${id}`)
  t.is(statusCode, 200)
  t.deepEqual(body, { data })
})

test('get: resolveWithFullResponse false', async t => {
  const { id, api, client } = t.context
  const data = { foo: 'bar' }
  nock(api).get(`/${id}`).reply(200, { data })
  const http = client(t, { resolveWithFullResponse: false })
  const body = await http.get(`/${id}`)
  t.deepEqual(body, { data })
})

test('get: 500', async t => {
  const { id, api, client } = t.context
  const data = { foo: 'bar' }
  nock(api).get(`/${id}`).reply(500, { data })
  const http = client(t)
  const { statusCode, body } = await t.throwsAsync(http.get(`/${id}`))
  t.is(statusCode, 500)
  t.deepEqual(body, { data })
})
