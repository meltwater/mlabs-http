import { createClient } from '../lib'

export default ({ log, baseUrl }) => async (url = '/post') => {
  const client = createClient({ baseUrl, log })
  await client.post(url, {
    body: { foo: 'bar' },
    responseLogLevel: 'info'
  })
}