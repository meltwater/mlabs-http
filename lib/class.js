import uuid4 from 'uuid/v4'
import createLogger from '@meltwater/mlabs-logger'

export class HttpClient {
  constructor ({
    got,
    name = 'http',
    resolveWithFullResponse = false,
    reqId = uuid4(),
    reqIdHeader = 'x-request-id',
    reqNameHeader = 'x-request-name',
    responseLogLevel = 'debug',
    willLogOptions = true,
    willLogResponse = false,
    getLogProps = _getLogProps,
    getLogData = _getLogData,
    log = createLogger()
  }) {
    this.got = got
    this.resolveWithFullResponse = resolveWithFullResponse
    this.log = log.child({ client: name, reqId, isHttpClient: true })
    this.reqIdHeader = { [reqIdHeader]: reqId }
    this.reqNameHeader = n => ({ [reqNameHeader]: n })
    this.responseLogLevel = responseLogLevel
    this.willLogOptions = willLogOptions
    this.willLogResponse = willLogResponse
    this.getLogProps = getLogProps
    this.getLogData = getLogData
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
    meta = {},
    logProps = {},
    willLogOptions = this.willLogOptions,
    responseLogLevel = this.responseLogLevel,
    resolveWithFullResponse = this.resolveWithFullResponse,
    willLogResponse = this.willLogResponse,
    getLogProps = data => this.getLogProps(data),
    getLogData = data => this.getLogData(data),
    ...options
  } = {}) {
    const name = `${method} ${url}`

    const args = {
      name,
      method,
      url,
      meta,
      logProps,
      willLogOptions,
      responseLogLevel,
      resolveWithFullResponse,
      willLogResponse,
      getLogProps,
      getLogData,
      options
    }

    const log = createChildLogger({
      ...args,
      log: this.log
    })

    try {
      log.info(`${name}: Start`)
      const got = this._createGot(args)

      const data = await got(url, options)
      this._logResponse({ ...args, data, log })

      if (resolveWithFullResponse) return data
      return data.body
    } catch (err) {
      log.error({ err }, `${name}: Fail`)
      throw err
    }
  }

  _createGot ({ name, method }) {
    return this.got.extend({
      method,
      headers: {
        ...this.reqNameHeader(name),
        ...this.reqIdHeader
      }
    })
  }

  _logResponse ({
    name,
    data,
    responseLogLevel,
    willLogResponse,
    getLogProps,
    getLogData,
    log
  }) {
    if (!log.isLevelEnabled(responseLogLevel)) return

    const logProps = getLogProps(data)

    const props = willLogResponse
      ? { ...logProps, data: getLogData(data) }
      : logProps

    log[responseLogLevel](props, `${name}: Success`)
  }
}

const createChildLogger = ({
  name,
  method,
  url,
  meta,
  logProps,
  willLogOptions,
  options,
  log
}) => {
  const allMeta = willLogOptions ? { ...options, ...meta } : meta
  const l = log.child({
    method,
    url,
    reqName: name,
    ...logProps,
    ...(Object.keys(allMeta).length === 0 ? {} : { meta: allMeta })
  })
  return l
}

const _getLogProps = data => ({})

const _getLogData = data => {
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
