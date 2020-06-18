import got from 'got'

import { HttpClient } from './class'

export default ({
  bearerToken,
  extend,
  prefixUrl,
  origin,
  path = '',
  json = true,
  cache,
  hooks,
  ...options
} = {}) => {
  const defaultOptions = getGotOptions({
    bearerToken,
    prefixUrl,
    origin,
    path,
    cache,
    hooks,
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
  prefixUrl,
  origin,
  path = '',
  cache,
  hooks,
  json
} = {}) => {
  const url = getPrefixUrl({ origin, path, prefixUrl })
  const headers = getHeaders({ bearerToken })
  return {
    cache,
    hooks,
    headers,
    prefixUrl: url,
    json
  }
}

const getPrefixUrl = ({ origin, path, prefixUrl }) => {
  if (prefixUrl) return prefixUrl
  if (origin) return `${origin}${path}`
}

const getHeaders = ({ bearerToken }) => {
  const headers = bearerToken ? { authorization: `Bearer ${bearerToken}` } : {}

  return headers
}
