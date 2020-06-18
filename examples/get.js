import { createClient } from '../lib'

export default ({ log, prefixUrl }) => async (url = 'get') => {
  const client = createClient({ prefixUrl, log })
  return client.get(url, {
    responseLogLevel: 'info'
  })
}
