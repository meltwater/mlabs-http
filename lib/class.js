import EventEmitter from 'events'

import { v4 as uuidv4 } from 'uuid'
import { createLogger } from '@meltwater/mlabs-logger'

import {
  getLogResponseProps as _getLogResponseProps,
  getLogResponseData as _getLogResponseData,
  createChildLogger,
  makeSafe
} from './logging.js'

import {
  handleStart as metricsHandleStart,
  handleDone as metricsHandleDone,
  handleFail as metricsHandleFail,
  handleRetry as metricsHandleRetry,
  handleSuccess as metricsHandleSuccess
} from './metrics.js'

export class HttpClient {
  constructor ({
    got,
    metricPrefix,
    metricRegistry = null,
    name = 'http',
    healthPath = '/',
    healthPrefixUrl = null,
    getHealth = defaultGetHealth,
    responseType = 'json',
    resolveBodyOnly = true,
    reqId = uuidv4(),
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
    this.metricRegistry = metricRegistry
    this.metricPrefix = metricPrefix
    this.clientName = name
    this.responseType = responseType
    this.resolveBodyOnly = resolveBodyOnly
    this.log = log.child({ client: name, reqId, isHttpClient: true })
    this.reqIdHeader = { [reqIdHeader]: reqId }
    this.reqNameHeader = (n) => ({ [reqNameHeader]: n })
    this.responseLogLevel = responseLogLevel
    this.willLogOptions = willLogOptions
    this.willLogResponseProps = willLogResponseProps
    this.willLogResponseData = willLogResponseData
    this.getLogResponseProps = getLogResponseProps
    this.getLogResponseData = getLogResponseData
    this.healthPath = healthPath
    this.healthPrefixUrl = healthPrefixUrl
    this._health = getHealth
    this._createEvents()
  }

  getEmitter () {
    return this.emitter
  }

  stream (...args) {
    return this.got.stream(...args)
  }

  async health () {
    const health = () =>
      this._health(this, this.healthPath, this.healthPrefixUrl)
    return health()
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
    const { name, eventProps, resolveBodyOnly, responseType, url, options } =
      args
    const log = createChildLogger(this.log, args)
    try {
      log.info(`${name}: Start`)
      const got = this._createGot(args, log, eventProps)

      this.emitter.emit('start', eventProps)
      const data = await got(url, {
        ...options,
        resolveBodyOnly: false,
        responseType
      })
      this.emitter.emit('success', { data, ...eventProps })
      this.emitter.emit('done', { data, ...eventProps })
      this._logResponse({ ...args, data, log })

      if (resolveBodyOnly) return data.body
      return data
    } catch (err) {
      const { statusCode } = err.response || {}
      err.statusCode = statusCode
      this.emitter.emit('fail', { err, ...eventProps })
      this.emitter.emit('done', { err, ...eventProps })
      log.error({ err, statusCode }, `${name}: Fail`)
      throw err
    }
  }

  _getArgs (
    method,
    url,
    {
      resourceName,
      meta = {},
      logProps = {},
      willLogOptions = this.willLogOptions,
      responseLogLevel = this.responseLogLevel,
      responseType = this.responseType,
      resolveBodyOnly = this.resolveBodyOnly,
      willLogResponseProps = this.willLogResponseProps,
      willLogResponseData = this.willLogResponseData,
      getLogResponseProps = (data) => this.getLogResponseProps(data),
      getLogResponseData = (data) => this.getLogResponseData(data),
      ...options
    } = {}
  ) {
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
      responseType,
      resolveBodyOnly,
      willLogResponseProps,
      willLogResponseData,
      getLogResponseProps,
      getLogResponseData,
      options
    }
  }

  _createGot ({ name, method }, log, eventProps) {
    return this.got.extend({
      method,
      hooks: {
        beforeRetry: [this._createOnRetry({ name, log, eventProps })]
      },
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
    if (this.metricRegistry === null) return

    const args = {
      prefix: this.metricPrefix,
      name: this.clientName,
      register: this.metricRegistry
    }

    const emitter = this.emitter
    emitter.on('start', (x) => metricsHandleStart({ ...x, ...args }))
    emitter.on('fail', (x) => metricsHandleFail({ ...x, ...args }))
    emitter.on('success', (x) => metricsHandleSuccess({ ...x, ...args }))
    emitter.on('retry', (x) => metricsHandleRetry({ ...x, ...args }))
    emitter.on('done', (x) => metricsHandleDone({ ...x, ...args }))
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
    const { statusCode, isFromCache } = data

    const logProps = willLogResponseProps
      ? makeSafe(getLogResponseProps)(data)
      : {}

    const allLogProps = { ...logProps, statusCode, isFromCache }

    const props = willLogResponseData
      ? { ...allLogProps, data: makeSafe(getLogResponseData)(data) }
      : allLogProps

    log[responseLogLevel](props, `${name}: Success`)
  }

  _createOnRetry ({ name, log, eventProps }) {
    return (err, retryCount) => {
      const { statusCode } = err.response || {}
      err.statusCode = statusCode
      log.warn(
        { err, isRetry: true, statusCode, retryCount },
        `${name}: Retried`
      )
      this.emitter.emit('retry', { ...eventProps, err })
    }
  }
}

const defaultGetHealth = async (client, path, prefixUrl) => {
  const options = prefixUrl === null ? {} : { prefixUrl }
  await client.get(path, {
    ...options,
    resolveBodyOnly: false,
    responseType: 'buffer'
  })
  return true
}
