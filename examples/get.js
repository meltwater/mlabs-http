import { createClient } from '../lib'

export default ({ log, baseUrl }) => async (url = '/get') => {
  const client = createClient({ baseUrl, log })
  const { body } = await client.get(url, {
    resLogLevel: 'info'
  })
  return body
}
