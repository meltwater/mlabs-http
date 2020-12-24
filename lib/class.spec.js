import test from 'ava'
import nock from 'nock'
import got from 'got'
import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '@meltwater/mlabs-logger'

import { HttpClient } from './class.js'

test.beforeEach((t) => {
  nock.disableNetConnect()

  const api = 'https://example.com'
  const retry = { limit: 0 }

  const client = (t, options = {}) =>
    new HttpClient({
      got: got.extend({ retry, prefixUrl: api }),
      resolveBodyOnly: false,
      log: createLogger({ t }),
      ...options
    })

  t.context.api = api
  t.context.client = client
  t.context.id = uuidv4()
})

test('health: 200', async (t) => {
  const { id, api, client } = t.context
  nock(api).get(`/${id}`).reply(200)
  const http = client(t, { healthPath: id })
  const health = await http.health()
  t.true(health)
})

test('health: 200 text', async (t) => {
  const { id, api, client } = t.context
  nock(api).get(`/${id}`).reply(200, 'foo')
  const http = client(t, { healthPath: id })
  const health = await http.health()
  t.true(health)
})

test('health: 500', async (t) => {
  const { id, api, client } = t.context
  nock(api).get(`/${id}`).reply(500)
  const http = client(t, { healthPath: id })
  const {
    response: { statusCode }
  } = await t.throwsAsync(http.health())
  t.is(statusCode, 500)
})

test('health: 200 post', async (t) => {
  const { id, api, client } = t.context
  const data = { foo: 'bar' }
  const getHealth = async (client, healthPath) => {
    await client.post(healthPath, { json: data })
    return true
  }
  nock(api).post(`/${id}`).reply(200, { data })
  const http = client(t, { healthPath: id, getHealth })
  const health = await http.health()
  t.true(health)
})

test('get: 200', async (t) => {
  const { id, api, client } = t.context
  const data = { foo: 'bar' }
  nock(api).get(`/${id}`).reply(200, { data })
  const http = client(t)
  const { body, statusCode } = await http.get(id)
  t.is(statusCode, 200)
  t.deepEqual(body, { data })
})

test('get: resolveBodyOnly true', async (t) => {
  const { id, api, client } = t.context
  const data = { foo: 'bar' }
  nock(api).get(`/${id}`).reply(200, { data })
  const http = client(t, { resolveBodyOnly: true })
  const body = await http.get(id)
  t.deepEqual(body, { data })
})

test('get: 500', async (t) => {
  const { id, api, client } = t.context
  const data = { foo: 'bar' }
  nock(api).get(`/${id}`).reply(500, { data })
  const http = client(t)
  const {
    response: { statusCode, body }
  } = await t.throwsAsync(http.get(id))
  t.is(statusCode, 500)
  t.deepEqual(body, { data })
})
