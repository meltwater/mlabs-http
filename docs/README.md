# API Reference

## Top-Level Exports

- [`createClient(options)`](#createclientoptions)
- [`registerMetrics(options)`](#registermetricsoptions)
- [`HttpClient(options)`](#httpclient)
- [Metric handlers](#metrichandlers)
    - `metricsHandleStart`
    - `metricsHandleDone`
    - `metricsHandleFail`
    - `metricsHandleSuccess`

### Importing

Every function described above is a top-level export.
You can import any of them like this:

```js
import { createClient } from '@meltwater/mlabs-http'
```

### Constants

- `metricNames`: Un-prefixed metric names.

---
### `createClient(options)`

Create an [HttpClient] with an API compatible with [Got].

- A new Got instance will be created for the HttpClient.
- If `origin` is set, then `baseUrl` will be set to `origin + path`.
- If `baseUrl` is set, then `origin` and `path` are ignored.
- Use the `extend` option to pass default options to Got
  These options are merged with [`got.extend`].
- Additional options are passed to [HttpClient].

#### Arguments

1. `options` (*object*):
   Any additional options are passed directly to the [HttpClient].
    - `origin` (*string*): The HTTP server [URL origin].
      Default: none.
    - `path` (*string*): The path to prefix all requests with.
      Only used when `origin` is set.
      Default: none.
    - `baseUrl` (*string*): The [Got `baseUrl`].
      Overrides `origin` and `path`.
      Default: none.
    - `bearerToken` (*string*): Token to send in the `authorization` header.
      Default: none.
    - `json` (*boolean*): The [Got `json`] option.
      Default: true.
    - `extend` (*object*): Passed to [`got.extend`] when creating the Got instance.

#### Returns

(*HttpClient*)

#### Examples

##### JSON requests

```js
import createHttpClient from '@meltwater/mlabs-http'

const http = createHttpClient({origin: 'https://httpbin.org'})

const body = await http.get('/get')
await http.post('/post', {body: {foo: 'bar'}})
```

##### Full response

```js
import createHttpClient from '@meltwater/mlabs-http'

const http = createHttpClient({
  resolveWithFullResponse: true,
  origin: 'https://httpbin.org'
})

const { body, statusCode } = await http.get('/get')

// or per request

const http = createHttpClient({
  resolveWithFullResponse: false,
  origin: 'https://httpbin.org'
})

const { body, statusCode } = await http.get('/get', {
  resolveWithFullResponse: true
})
```

##### With custom Got options

```js
import createHttpClient from '@meltwater/mlabs-http'

const http = createHttpClient({
  extend: {headers: {foo: 'bar'}},
  origin: 'https://httpbin.org'
})

const body = await http.get('/get')
```

##### Control logging

```js
import createHttpClient from '@meltwater/mlabs-http'

const http = createHttpClient({
  origin: 'https://httpbin.org',
  responseLogLevel: 'info',
  getLogResponseProps: ({body}) => ({myIp: body.origin})
})

const body = await http.get('/get', {
  meta: {user: {name: 'foo'}},
  logProps: {userId: 123}
})

// all logs have {userId: 123, meta: {user: {name: 'foo'}}}
// success log also has {myIp: '127.0.0.1'}
```

---
### `registerMetrics(options)`

Collect metrics with [Prometheus client].

Call this function once with a [Prometheus Registry] instance
and pass the same Registry instance to each HttpClient that should
send metrics to this Registry.

The list of (un-prefixed) metric names is exported as `metricNames`.

#### Arguments

1. `options` (*object*):
    - `register` (*object* **required**):
      [Prometheus registry] to use for metrics.
    - `prefix` (*string*): Prefix to prepend to all metric names.
      Default: `http_client_`.
    - `metricOptions` (*object*): Override options for each metric.
      Default: no overrides.

#### Returns

(*undefined*)

#### Examples

```js
const register = new Registry()

registerMetrics({
  register,
  prefix: 'my_prefix_',
  options: {
    'request_duration_milliseconds': {
      buckets: [0, 200, 300, 800]
    }
  }
})

const http = createClient({ metrics: register })
await http.get('/get')

register.metrics()
```

## HttpClient

Wraps all [Got] methods (except `stream`) with an identical API:
`get`, `post`, `put`, `patch`, `head`, and `delete`.

- Methods return a Promise with the response body
  and not the whole Got response object
  (this is different then the default Got behavior).
  Use `resolveWithFullResponse` to get the full response.
- All methods have a `meta` option to log additional properties to the `meta` key.
- All methods have a `logProps` option to log additional properties at the top-level.
- All methods have a `resourceName` option to group dynamic requests,
  e.g., if `url=/api/users/123` then set `resourceName=/api/users`.
- All methods have these additional options, which may be set per-request
  to override the default from the constructor (see below):
    - `resolveWithFullResponse`
    - `responseLogLevel`
    - `willLogOptions`
    - `willLogResponseProps`
    - `willLogResponseData`
    - `getLogResponseProps`
    - `getLogResponseData`

### Constructor

1. `options` (*object*):
    - `got` (*object* **required**):
      The [Got] instance to use for requests.
    - `metrics` (*object*): [Prometheus Registry] to collect metrics.
      Default: `null` (metrics disabled).
    - `name` (*string*): The client name (for logging).
      Default: http.
    - `reqId` (*string*): A request id to bind to the instance.
      Default: one will be generated.
    - `reqIdHeader` (*string*): Name of the header to use for the request id.
      Default: `x-request-id`.
    - `reqNameHeader` (*string*): Name of the header to use for the request name.
      Default: `x-request-name`.
    - `resolveWithFullResponse` (*boolean*): If true, return the full response from [Got],
      otherwise only return the response body.
      Default: false.
    - `responseLogLevel` (*string*): Log level to log successful responses.
      If this level is active, then successful responses
      will be logged according to the other log response options.
      Default: debug.
    - `willLogOptions` (*boolean*): If true, log all options under `meta`.
      Default: true.
    - `willLogResponseProps` (*boolean*): If true, log props returned
      by `getLogResponseProps`.
      Only relevant if `responseLogLevel` is an active level.
      Default: true.
    - `willLogResponseData` (*boolean*): If true, log `data` returned
      by `getLogResponseData`.
      Only relevant if `responseLogLevel` is an active level.
      Default: false.
    - `getLogResponseProps` (*function*): Receives the full response from Got
      and returns an object whose properties will be logged at the top level.
      Only relevant if `responseLogLevel` is an active level.
      Default: no additional props are logged.
    - `getLogResponseData` (*function*): Receives the full response from Got
      and returns an object whose properties will be logged under `data`.
      Only relevant if `responseLogLevel` is an active level
      and `willLogResponseData` is set.
      Default: logs a relevant subset of the full Got response.
    - `log` (*object*): A [Logger].
      Default: a new logger.

## Metric Handlers

Handlers for updating metrics.
Provided for libraries that want to register and track similar metrics.

Each handlers is passed the following options in it's first argument:

  - `prefix` (see [`registerMetrics`](#registermetricsoptions))
  - `resourceName` (see [`registerMetrics`](#registermetricsoptions))
  - `method` (see)
  - `data` (on success) or `err` (on fail)
      - Must contain `statusCode` and `timings` properties.

### Handlers

- `metricsHandleStart`: Call immediately before request is started.
- `metricsHandleDone`: Call when request completes or errors.
- `metricsHandleFail`: Call when request fails; passed `err` property.
- `metricsHandleSuccess`: Call when request succeeds; passed `data` property.

[HttpClient]: #httpclient
[Got]: https://github.com/sindresorhus/got
[Got `json`]: https://github.com/sindresorhus/got#json
[Got `baseUrl`]: https://github.com/sindresorhus/got#baseurl
[`got.extend`]: https://github.com/sindresorhus/got#gotextendoptions
[URL origin]: https://nodejs.org/api/url.html#url_url_strings_and_url_objects
[Logger]: https://github.com/meltwater/mlabs-logger
[Prometheus Registry]: https://github.com/siimon/prom-client#multiple-registries
[Prometheus client]: https://github.com/siimon/prom-client
