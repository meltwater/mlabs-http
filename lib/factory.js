import got from 'got'

import { HttpClient } from './class'

export default ({
  bearerToken,
  extend,
  baseUrl,
  origin,
  path = '',
  json = true,
  cache,
  ...options
} = {}) => {
  const defaultOptions = getGotOptions({
    bearerToken,
    baseUrl,
    origin,
    path,
    cache,
    json
  })

  const client = new HttpClient({
    got: got.extend(defaultOptions).extend(extend),
    ...options
  })

  return client
}

export const getGotOptions = ({
  bearerToken,
  baseUrl,
  origin,
  path = '',
  cache,
  json
} = {}) => {
  const url = getBaseUrl({ origin, path, baseUrl })
  const headers = getHeaders({ bearerToken })
  return {
    cache,
    headers,
    baseUrl: url,
    json
  }
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
