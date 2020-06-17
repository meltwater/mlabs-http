import test from 'ava'

import createClient, { getGotOptions } from './factory'

test('createClient', (t) => {
  t.truthy(createClient())
  t.truthy(
    createClient({
      extend: { headers: { foo: 'bar' } }
    })
  )
})

test('getGotOptions: default', (t) => {
  t.snapshot(getGotOptions())
})

test('getGotOptions: baseUrl', (t) => {
  t.snapshot(getGotOptions({ baseUrl: 'https://example.com/foo' }))
})

test('getGotOptions: origin', (t) => {
  t.snapshot(getGotOptions({ origin: 'https://example.com' }))
})

test('getGotOptions: path', (t) => {
  t.snapshot(getGotOptions({ origin: 'https://example.com', path: '/bar' }))
})

test('getGotOptions: baseUrl override', (t) => {
  t.snapshot(
    getGotOptions({
      baseUrl: 'https://test.examples.com',
      origin: 'https://example.com',
      path: '/bar'
    })
  )
})

test('getGotOptions: bearerToken', (t) => {
  t.snapshot(
    getGotOptions({
      bearerToken: 'the-token'
    })
  )
})

test('getGotOptions: json', (t) => {
  t.snapshot(
    getGotOptions({
      json: false
    })
  )
})

test('getGotOptions: hooks', (t) => {
  t.snapshot(
    getGotOptions({
      hooks: { beforeRequest: [] }
    })
  )
})
