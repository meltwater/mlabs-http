import { asFunction } from 'awilix'
import QuickLru from 'quick-lru'

import createHttpClient from './factory'

export const registerClient = (
  container,
  {
    name = 'http',
    origin,
    path,
    prefixUrl,
    token,
    createHooks = () => ({}),
    cacheOptions = {},
    clientOptions = {}
  } = {}
) => {
  if (!container) throw new Error('Missing container.')

  const clientName = `${name}Client`
  const cacheName = `${name}Cache`
  const hooksName = `${name}Hooks`

  const cache = () => new QuickLru({ maxSize: 1000, ...cacheOptions })

  const client = ({ cache, hooks, registry, reqId, log }) =>
    createHttpClient({
      reqId,
      log,
      name,
      origin,
      path,
      prefixUrl,
      bearerToken: token,
      metricRegistry: registry,
      cache,
      hooks,
      ...clientOptions
    })

  const clientDeps = (c) => ({
    cache: c.resolve(cacheName),
    hooks: c.resolve(hooksName)
  })

  container.register({
    [cacheName]: asFunction(cache).singleton(),
    [hooksName]: asFunction(createHooks).scoped(),
    [clientName]: asFunction(client).inject(clientDeps).scoped()
  })
}

export const registerClients = (container, clients = {}, defaults = {}) => {
  for (const [name, options] of Object.entries(clients)) {
    registerClient(container, { name, ...defaults, ...options })
  }
}
