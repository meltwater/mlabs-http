import got from 'got'

import { HttpClient } from './class'

export default ({
  bearerToken,
  extend = {},
  prefixUrl,
  origin,
  path = '',
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
    hooks
  })

  const { responseType, resolveBodyOnly, ...extendRest } = extend

  const client = new HttpClient({
    got: got.extend(defaultOptions, extendRest),
    responseType,
    resolveBodyOnly,
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
  hooks
} = {}) => {
  const url = getPrefixUrl({ origin, path, prefixUrl })
  const headers = getHeaders({ bearerToken })
  return {
    cache,
    hooks,
    headers,
    prefixUrl: url
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
