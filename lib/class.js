import uuid4 from 'uuid/v4'
import createLogger from '@meltwater/mlabs-logger'

export class HttpClient {
  constructor ({
    got,
    name = 'http',
    reqId = uuid4(),
    reqIdHeader = 'x-request-id',
    reqNameHeader = 'x-request-name',
    resLogLevel = 'debug',
    willLogOptions = true,
    resolveWithFullResponse = false,
    log = createLogger()
  }) {
    this.got = got
    this.log = log.child({ client: name, reqId, isHttpClient: true })
    this.reqIdHeader = { [reqIdHeader]: reqId }
    this.reqNameHeader = n => ({ [reqNameHeader]: n })
    this.resLogLevel = resLogLevel
    this.willLogOptions = willLogOptions
    this.resolveWithFullResponse = resolveWithFullResponse
  }

  stream (...args) {
    return this.got.stream(...args)
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
    willLogOptions = this.willLogOptions,
    resLogLevel = this.resLogLevel,
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
      headers: { ...this.reqNameHeader(name), ...this.reqIdHeader }
    })
    try {
      log.info(`${name}: Start`)
      const data = await got(url, options)

      if (log.isLevelEnabled(resLogLevel)) {
        const logData = getLogData(data)
        log[resLogLevel]({ data: logData }, `${name}: Success`)
      }

      if (this.resolveWithFullResponse) return data
      return data.body
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

const getLogData = data => {
  const keys = [
    'allowHalfOpen',
    'complete',
    'domain',
    'fromCache',
    'headers',
    'httpVersion',
    'httpVersionMajor',
    'httpVersionMinor',
    'method',
    'readable',
    'requestUrl',
    'retryCount',
    'setTimeout',
    'statusCode',
    'statusMessage',
    'timings',
    'trailers',
    'upgrade',
    'url',
    'writable'
  ]
  const newData = {}
  for (const key of keys) newData[key] = data[key]
  return newData
}
