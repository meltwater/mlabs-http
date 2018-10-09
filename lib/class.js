import EventEmitter from 'events'

import uuid4 from 'uuid/v4'
import createLogger from '@meltwater/mlabs-logger'

import {
  getLogResponseProps as _getLogResponseProps,
  getLogResponseData as _getLogResponseData,
  createChildLogger,
  makeSafe
} from './logging'

import {
  handleStart as metricsHandleStart,
  handleDone as metricsHandleDone,
  handleFail as metricsHandleFail,
  handleSuccess as metricsHandleSuccess
} from './metrics'

export class HttpClient {
  constructor ({
    got,
    metrics = null,
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
    this.metrics = metrics
    this.clientName = name
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
    this._createEvents()
  }

  getEmitter () {
    return this.emitter
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

  async _got (...gotArgs) {
    const args = this._getArgs(...gotArgs)
    const { name, eventProps, resolveWithFullResponse, url, options } = args
    const log = createChildLogger(this.log, args)

    try {
      log.info(`${name}: Start`)
      const got = this._createGot(args)

      this.emitter.emit('start', eventProps)
      const data = await got(url, options)
      this.emitter.emit('success', { data, ...eventProps })
      this.emitter.emit('done', { data, ...eventProps })
      this._logResponse({ ...args, data, log })

      if (resolveWithFullResponse) return data
      return data.body
    } catch (err) {
      this.emitter.emit('fail', { err, ...eventProps })
      this.emitter.emit('done', { err, ...eventProps })
      log.error({ err }, `${name}: Fail`)
      throw err
    }
  }

  _getArgs (method, url, {
    resourceName,
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
    const name = `${method} ${resourceName || url}`
    const eventProps = {
      resourceName,
      method
    }

    return {
      name,
      method,
      url,
      resourceName,
      meta,
      logProps,
      eventProps,
      willLogOptions,
      responseLogLevel,
      resolveWithFullResponse,
      willLogResponseProps,
      willLogResponseData,
      getLogResponseProps,
      getLogResponseData,
      options
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

  _createEvents () {
    const emitter = new EventEmitter()
    this.emitter = emitter
    this._subscribeMetrics()
  }

  _subscribeMetrics () {
    if (this.metrics === null) return

    const args = {
      name: this.clientName,
      register: this.metrics
    }

    const emitter = this.emitter
    emitter.on('start', x => metricsHandleStart({ ...x, ...args }))
    emitter.on('fail', x => metricsHandleFail({ ...x, ...args }))
    emitter.on('success', x => metricsHandleSuccess({ ...x, ...args }))
    emitter.on('done', x => metricsHandleDone({ ...x, ...args }))
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
