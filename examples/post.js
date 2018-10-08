import { createClient } from '../lib'

export default ({ log, baseUrl }) => async (url = '/post') => {
  const client = createClient({ baseUrl, log })
  return client.post(url, {
    body: { foo: 'bar' },
    logProps: { fooId: 123 },
    meta: { fooName: 'fooman' },
    responseLogLevel: 'info'
  })
}
