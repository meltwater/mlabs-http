# API Reference

## Top-Level Exports

- [`createClient(options)`](#createclientoptions)
- [`collectMetrics(options)`](#collectmetricsoptions)
- [`registerClient(container, client)`](#registerclientcontainer-client)
- [`registerClients(container, clients, defaults)`](#registerclientscontainer-clients-defaults)
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
- If `origin` is set, then `prefixUrl` will be set to `origin + path`.
- If `prefixUrl` is set, then `origin` and `path` are ignored.
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
    - `prefixUrl` (*string*): The [Got `prefixUrl`].
      Overrides `origin` and `path`.
      Default: none.
    - `bearerToken` (*string*): Token to send in the `authorization` header.
      Default: none.
    - `cache` (*boolean*): The [Got `cache`] option.
      Default: none.
    - `hooks` (*boolean*): The [Got `hooks`] option.
      Default: none.
    - `extend` (*object*): Passed to [`got.extend`] when creating the Got instance.

#### Returns

(*HttpClient*)

#### Examples

##### JSON requests

```js
import createHttpClient from '@meltwater/mlabs-http'

const http = createHttpClient({origin: 'https://httpbin.org'})

const body = await http.get('get')
await http.post('post', { json: { foo: 'bar' } })
```

##### Full response

```js
import createHttpClient from '@meltwater/mlabs-http'

const http = createHttpClient({
  resolveBodyOnly: false,
  origin: 'https://httpbin.org'
})

const { body, statusCode } = await http.get('get')

// or per request

const { body, statusCode } = await http.get('get', {
  resolveBodyOnly: false
})
```

##### With custom Got options

```js
import createHttpClient from '@meltwater/mlabs-http'

const http = createHttpClient({
  extend: {headers: {foo: 'bar'}},
  origin: 'https://httpbin.org'
})

const body = await http.get('get')
```

##### Control logging

```js
import createHttpClient from '@meltwater/mlabs-http'

const http = createHttpClient({
  origin: 'https://httpbin.org',
  responseLogLevel: 'info',
  getLogResponseProps: ({ body }) => ({ myIp: body.origin })
})

const body = await http.get('get', {
  meta: { user: { name: 'foo' } },
  logProps: { userId: 123 }
})

// all logs have { userId: 123, meta: { user: { name: 'foo' } } }
// success log also has { myIp: '127.0.0.1' }
```

---
### `registerClient(container, client)`

Register an [HttpClient] and its dependencies in the Awilix container.

The container must provide the dependencies `registry`, `log` and `reqId`.
The `reqId` will be sent in the `x-request-id` header.
The `registry` is passed as `metricRegistry` to the HttpClient.

For example, registering a client named `http`
will register the following dependencies:

- `httpCache`: A [quick-lru] cache.
- `httpHooks`: No default hooks.
- `httpClient`: The [HttpClient] (scoped).

Any of these dependencies may be overridden manually by registering
a compatible dependency under the corresponding name.

#### Arguments

1. `container` (*object* **required**): The [Awilix] container.
1. `client` (*object*):
    - `name` (*string*): The (unique) client name.
      The client will be registered as `${name}Client`.
      Default: `http`.
    - `origin` (*string*): Passed directly to [HttpClient].
    - `path` (*string*): Passed directly to [HttpClient].
    - `prefixUrl` (*string*): Passed directly to [HttpClient].
    - `token` (*string*): Passed as `bearerToken` to [HttpClient].
    - `createHooks` (*function*): Function that returns hooks (registered as dependency).
    - `cacheOptions` (*object*): Options passed directly to [quick-lru].
    - `clientOptions` (*object*): Options passed directly to [HttpClient].

#### Returns

(*undefined*)

#### Example

```js
registerClient(container, {
  name: 'foo',
  origin: 'https://example.com'
})

const client = container.resolve('fooClient')
```

---
### `registerClients(container, clients, defaults)`

Register each [HttpClient] and its dependencies in the Awilix container
using [`registerClient`](#registerclientcontainer-client).

#### Arguments

1. `container` (*object* **required**): The [Awilix] container.
2. `clients` (*object*):
    The clients to register.
    Each key will be used as the client `name`
    and the value will be passed as the second argument to
    [`registerClient`](#registerclientcontainer-client).
3. `defaults` (*object*):
   Options to apply to each client by default.

#### Returns

(*undefined*)

#### Example

```js
registerClients(container, {
  foo: { origin: 'https://example.com' },
  { token: 'auth-token' }
})

const client = container.resolve('fooClient')
```

---
### `collectMetrics(options)`

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

collectMetrics({
  register,
  prefix: 'my_prefix_',
  options: {
    'request_duration_milliseconds': {
      buckets: [0, 200, 300, 800]
    }
  }
})

const http = createClient({ metricRegistry: register })
await http.get('/get')

register.metrics()
```

## HttpClient

Wraps all [Got] methods (except `stream`) with an identical API:
`get`, `post`, `put`, `patch`, `head`, and `delete`.

Provides an additional method `health` which takes no arguments
and resolves `true` or rejects.
Configure with the `healthPath`, `healthPrefixUrl` and `getHealth` options.

- The default `responseType` is `json`.
- The default for `resolveBodyOnly` is `true`.
- All methods have a `meta` option to log additional properties to the `meta` key.
- All methods have a `logProps` option to log additional properties at the top-level.
- All methods have a `resourceName` option to group dynamic requests,
  e.g., if `url=/api/users/123` then set `resourceName=/api/users`.
- All methods have these additional options, which may be set per-request
  to override the default from the constructor (see below):
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
    - `name` (*string*): The client name (for logging).
      Default: http.
    - `metricRegistry` (*object*): [Prometheus Registry] to collect metrics.
      Default: `null` (metrics disabled).
    - `metricPrefix` (*object*): Prefix prepend to all metric names.
      Default: See [`collectMetrics`](#collectmetricsoptions).
    - `healthPath` (*string*): Path to use for the health check.
      Default: `''`.
    - `healthPrefixUrl` (*string*): Use a different `prefixUrl` for the health check.
      Default: use the same `prefixUrl` as the client.
    - `getHealth`: Function called for the `health` method.
      Receives the client instance and the `healthPath` as arguments.
      Default: a GET request to `healthPath`.
    - `reqId` (*string*): A request id to bind to the instance.
      Default: one will be generated.
    - `reqIdHeader` (*string*): Name of the header to use for the request id.
      Default: `x-request-id`.
    - `reqNameHeader` (*string*): Name of the header to use for the request name.
      Default: `x-request-name`.
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

Each handler is passed the following options in the first argument:

  - `prefix` (see [`collectMetrics`](#collectmetricsoptions))
  - `name` (see [`HttpClient`](#httpclient))
  - `resourceName` (see [`HttpClient`](#httpclient))
  - `method`
  - `data` (on success) or `err` (on fail)
      - Must contain `statusCode` and `timings` properties.
      - May contain `isFromCache` property.

### Handlers

- `metricsHandleStart`: Call immediately before request is started.
- `metricsHandleDone`: Call when request completes or errors.
- `metricsHandleFail`: Call when request fails; passed `err` property.
- `metricsHandleSuccess`: Call when request succeeds; passed `data` property.

[HttpClient]: #httpclient
[Got]: https://github.com/sindresorhus/got
[Got `json`]: https://github.com/sindresorhus/got#json
[Got `cache`]: https://github.com/sindresorhus/got#cache
[Got `hooks`]: https://github.com/sindresorhus/got#hooks
[Got `prefixUrl`]: https://github.com/sindresorhus/got#prefixurl
[`got.extend`]: https://github.com/sindresorhus/got#gotextendoptions
[URL origin]: https://nodejs.org/api/url.html#url_url_strings_and_url_objects
[Logger]: https://github.com/meltwater/mlabs-logger
[Prometheus Registry]: https://github.com/siimon/prom-client#multiple-registries
[Prometheus client]: https://github.com/siimon/prom-client
[quick-lru]: https://github.com/sindresorhus/quick-lru
