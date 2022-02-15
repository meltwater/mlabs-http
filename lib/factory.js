import defaultGot from 'got'

import { HttpClient } from './class.js'

export default ({
  bearerToken,
  extend = {},
  prefixUrl,
  origin,
  path = '',
  cache,
  hooks,
  got = defaultGot,
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
  const opts = {}
  if (cache !== undefined) opts.cache = cache
  if (hooks !== undefined) opts.hooks = hooks
  if (headers !== undefined) opts.headers = headers
  if (url !== undefined) opts.prefixUrl = url
  return opts
}

const getPrefixUrl = ({ origin, path, prefixUrl }) => {
  if (prefixUrl) return prefixUrl
  if (origin) return `${origin}${path}`
}

const getHeaders = ({ bearerToken }) => {
  const headers = bearerToken ? { authorization: `Bearer ${bearerToken}` } : {}

  return headers
}
