import { createHttpClient } from '../index.js'

export default ({ log, prefixUrl }) => async (url = 'get') => {
  const client = createHttpClient({ prefixUrl, log })
  return client.get(url, {
    responseLogLevel: 'info'
  })
}
