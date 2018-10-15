import { asFunction } from 'awilix'

import createClient from './factory'

export const registerClient = (container, {
  name = 'http',
  clientOptions = {}
} = {}) => {
  if (!container) throw new Error('Missing container.')

  const clientName = `${name}Client`

  const client = ({ reqId, log }) => createClient({
    name,
    reqId,
    log,
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
