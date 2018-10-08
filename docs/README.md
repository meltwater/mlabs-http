# API Reference

## Top-Level Exports

- [`createClient(options)`](#createclientoptions)
- [`HttpClient(options)`](#httpclientoptions)

### Importing

Every function described above is a top-level export.
You can import any of them like this:

```js
import { createClient } from '@meltwater/mlabs-http'
```

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
  getLogProps: ({body}) => ({myIp: body.origin})
})

const body = await http.get('/get', {
  meta: {user: {name: 'foo'}},
  logProps: {userId: 123}
})

// all logs have {userId, meta: {user: {name: 'foo'}}}
// success log also has {myIp: '127.0.0.1'}
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
- All methods have these additional options, which may be set per-request
  to override the default from the constructor (see below):
    - `resolveWithFullResponse`
    - `responseLogLevel`
    - `willLogOptions`
    - `willLogResponse`

### Constructor

1. `options` (*object*):
    - `got` (*object* **required**):
      The [Got] instance to use for requests.
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
      will be logged according to `willLogResponse`.
      Default: debug.
    - `willLogOptions` (*boolean*): If true, log all options under `meta`.
      Default: true.
    - `willLogResponse` (*boolean*): If true, log full response on success,
      otherwise only log a message.
      Only relevant if `responseLogLevel` is an active level.
      Default: false.
    - `getLogProps` (*function*):
      Receives the full response from Got and returns an object
      whose properties will be logged at the top level.
      Only relevant if `responseLogLevel` is an active level.
      Default: no additional props are logged.
    - `getLogData` (*function*):
      Receives the full response from Got and returns an object
      whose properties will be logged under `data`.
      Only relevant if `responseLogLevel` is an active level
      and `willLogResponse` is set.
      Default: logs a relevant subset of the full Got response.
    - `log` (*object*): A [Logger].
      Default: a new logger.

[HttpClient]: #httpclient
[Got]: https://github.com/sindresorhus/got
[Got `json`]: https://github.com/sindresorhus/got#json
[Got `baseUrl`]: https://github.com/sindresorhus/got#baseurl
[`got.extend`]: https://github.com/sindresorhus/got#gotextendoptions
[URL origin]: https://nodejs.org/api/url.html#url_url_strings_and_url_objects
[Logger]: https://github.com/meltwater/mlabs-logger
