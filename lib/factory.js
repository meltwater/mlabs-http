import got from 'got'

import { HttpClient } from './class'

export default ({
  bearerToken,
  extend,
  baseUrl,
  origin,
  path = '',
  json = true,
  ...options
}) => {
  const url = getBaseUrl({ origin, path, baseUrl })
  const headers = getHeaders({ bearerToken })
  const defaultGot = got.extend({
    headers,
    baseUrl: url,
    json
  })

  const client = new HttpClient({
    got: defaultGot.extend(extend),
    ...options
  })

  return client
}

const getBaseUrl = ({ origin, path, baseUrl }) => {
  if (baseUrl) return baseUrl
  if (origin) return `${origin}${path}`
}

const getHeaders = ({ bearerToken }) => {
  const headers = bearerToken
    ? { authorization: `Bearer ${bearerToken}` }
    : {}

  return headers
}
