import { asFunction } from 'awilix'

import createClient from './factory'

export const registerClient = (container, {
  name = 'http',
  origin,
  path,
  baseUrl,
  token,
  metrics,
  clientOptions = {}
} = {}) => {
  if (!container) throw new Error('Missing container.')

  const clientName = `${name}Client`

  const client = ({ registry, reqId, log }) => createClient({
    reqId,
    log,
    name,
    origin,
    path,
    baseUrl,
    bearerToken: token,
    metrics: registry,
    ...clientOptions
  })

  container.register({
    [clientName]: asFunction(client).scoped()
  })
}

export const registerClients = (container, clients = {}, defaults = {}) => {
  for (const [name, options] of Object.entries(clients)) {
    registerClient(container, { name, ...defaults, ...options })
  }
}
