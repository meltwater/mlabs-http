import { HttpClient } from '../lib'

export default ({ log, baseUrl }) => async (url = '/get') => {
  const client = new HttpClient({ baseUrl })
  const { body } = await client.get(url)
  return body
}
