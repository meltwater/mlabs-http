import { createClient } from '../lib'

export default ({ log, baseUrl }) => async (url = '/get') => {
  const client = createClient({ baseUrl, log })
  return client.get(url, {
    responseLogLevel: 'info'
  })
}
