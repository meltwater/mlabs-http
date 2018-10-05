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
  const defaultOptions = getGotOptions({
    json,
    origin,
    path,
    baseUrl,
    bearerToken
  })

  const client = new HttpClient({
    got: got.extend(defaultOptions).extend(extend),
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

export const getGotOptions = ({
  bearerToken,
  baseUrl,
  origin,
  path = '',
  json
} = {}) => {
  const url = getBaseUrl({ origin, path, baseUrl })
  const headers = getHeaders({ bearerToken })
  return {
    headers,
    baseUrl: url,
    json
  }
}
