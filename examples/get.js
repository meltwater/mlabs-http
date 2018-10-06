import { createClient } from '../lib'

export default ({ log, baseUrl }) => async (url = '/get') => {
  const client = createClient({ baseUrl, log })
  const { body } = await client.get(url, {
    responseLogLevel: 'info'
  })
  return body
}
