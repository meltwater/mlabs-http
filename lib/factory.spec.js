import test from 'ava'

import createHttpClient, { getGotOptions } from './factory.js'

test('createHttpClient', (t) => {
  t.truthy(createHttpClient())
  t.truthy(
    createHttpClient({
      extend: { headers: { foo: 'bar' } }
    })
  )
})

test('getGotOptions: default', (t) => {
  t.snapshot(getGotOptions())
})

test('getGotOptions: prefixUrl', (t) => {
  t.snapshot(getGotOptions({ prefixUrl: 'https://example.com/foo' }))
})

test('getGotOptions: origin', (t) => {
  t.snapshot(getGotOptions({ origin: 'https://example.com' }))
})

test('getGotOptions: path', (t) => {
  t.snapshot(getGotOptions({ origin: 'https://example.com', path: '/bar' }))
})

test('getGotOptions: prefixUrl override', (t) => {
  t.snapshot(
    getGotOptions({
      prefixUrl: 'https://test.examples.com',
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

test('getGotOptions: hooks', (t) => {
  t.snapshot(
    getGotOptions({
      hooks: { beforeRequest: [] }
    })
  )
})
