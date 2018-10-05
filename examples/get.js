import { createHttpClient } from '../lib'

export default ({ log, baseUrl }) => async (url = '/get') => {
  const client = createHttpClient({ baseUrl, log })
  const { body } = await client.get(url)
  return body
}
