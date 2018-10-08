import uuid4 from 'uuid/v4'
import createLogger from '@meltwater/mlabs-logger'

import {
  getLogResponseProps as _getLogResponseProps,
  getLogResponseData as _getLogResponseData,
  createChildLogger,
  makeSafe
} from './logging'

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
    willLogResponseProps = true,
    willLogResponseData = false,
    getLogResponseProps = _getLogResponseProps,
    getLogResponseData = _getLogResponseData,
    log = createLogger()
  }) {
    this.got = got
    this.resolveWithFullResponse = resolveWithFullResponse
    this.log = log.child({ client: name, reqId, isHttpClient: true })
    this.reqIdHeader = { [reqIdHeader]: reqId }
    this.reqNameHeader = n => ({ [reqNameHeader]: n })
    this.responseLogLevel = responseLogLevel
    this.willLogOptions = willLogOptions
    this.willLogResponseProps = willLogResponseProps
    this.willLogResponseData = willLogResponseData
    this.getLogResponseProps = getLogResponseProps
    this.getLogResponseData = getLogResponseData
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
    willLogResponseProps = this.willLogResponseProps,
    willLogResponseData = this.willLogResponseData,
    getLogResponseProps = data => this.getLogResponseProps(data),
    getLogResponseData = data => this.getLogResponseData(data),
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
      willLogResponseProps,
      willLogResponseData,
      getLogResponseProps,
      getLogResponseData,
      options
    }

    const log = createChildLogger(this.log, args)

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
    willLogResponseProps,
    willLogResponseData,
    getLogResponseProps,
    getLogResponseData,
    log
  }) {
    if (!log.isLevelEnabled(responseLogLevel)) return

    const logProps = willLogResponseProps
      ? makeSafe(getLogResponseProps)(data)
      : {}

    const props = willLogResponseData
      ? { ...logProps, data: makeSafe(getLogResponseData)(data) }
      : logProps

    log[responseLogLevel](props, `${name}: Success`)
  }
}
