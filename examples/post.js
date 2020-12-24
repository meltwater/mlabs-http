import { createHttpClient } from '../index.js'

export default ({ log, prefixUrl }) => async (url = '/post') => {
  const client = createHttpClient({ prefixUrl, log })
  return client.post(url, {
    body: { foo: 'bar' },
    logProps: { fooId: 123 },
    meta: { fooName: 'fooman' },
    responseLogLevel: 'info'
  })
}
