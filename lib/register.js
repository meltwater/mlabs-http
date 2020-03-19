import { asFunction } from 'awilix'
import QuickLru from 'quick-lru'

import createClient from './factory'

export const registerClient = (
  container,
  {
    name = 'http',
    origin,
    path,
    baseUrl,
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
    createClient({
      reqId,
      log,
      name,
      origin,
      path,
      baseUrl,
      bearerToken: token,
      metricRegistry: registry,
      cache,
      hooks,
      ...clientOptions
    })

  const clientDeps = c => ({
    cache: c.resolve(cacheName),
    hooks: c.resolve(hooksName)
  })

  container.register({
    [cacheName]: asFunction(cache).singleton(),
    [hooksName]: asFunction(createHooks).scoped(),
    [clientName]: asFunction(client)
      .inject(clientDeps)
      .scoped()
  })
}

export const registerClients = (container, clients = {}, defaults = {}) => {
  for (const [name, options] of Object.entries(clients)) {
    registerClient(container, { name, ...defaults, ...options })
  }
}
