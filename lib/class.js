import uuid4 from 'uuid/v4'
import createLogger from '@meltwater/mlabs-logger'

export class HttpClient {
  constructor ({
    got,
    name = 'http',
    reqId = uuid4(),
    reqIdHeader = 'x-request-id',
    reqNameHeader = 'x-request-name',
    log = createLogger()
  }) {
    this.got = got
    this.log = log.child({ client: name, reqId, isHttpClient: true })
    this.reqIdHeader = { [reqIdHeader]: reqId }
    this.reqNameHeader = n => ({ [reqNameHeader]: n })
  }

  async get (...args) {
    return this._got('GET', ...args)
  }

  async post (...args) {
    return this._got('POST', ...args)
  }

  async put (...args) {
    return this._got('PUT', ...args)
  }

  async patch (...args) {
    return this._got('PATCH', ...args)
  }

  async head (...args) {
    return this._got('HEAD', ...args)
  }

  async delete (...args) {
    return this._got('DELETE', ...args)
  }

  async _got (method, url, {
    meta,
    willLogOptions = true,
    resLogLevel = 'debug',
    ...options
  } = {}) {
    const name = `${method} ${url}`
    const log = createChildLogger({
      name,
      method,
      url,
      meta,
      willLogOptions,
      options,
      log: this.log
    })
    const got = this.got.extend({
      method,
      headers: this.reqNameHeader(name)
    })
    try {
      log.info(`${name}: Start`)
      const data = await got(url, options)
      log[resLogLevel]({ data }, `${name}: Success`)
      return data
    } catch (err) {
      log.error({ err }, `${name}: Fail`)
      throw err
    }
  }
}

const createChildLogger = ({
  name,
  method,
  url,
  meta,
  willLogOptions,
  options,
  log
}) => {
  const allMeta = willLogOptions ? { ...options, ...meta } : meta
  const l = log.child({
    method,
    url,
    reqName: name,
    ...(Object.keys(allMeta).length === 0 ? {} : { meta: allMeta })
  })
  return l
}
