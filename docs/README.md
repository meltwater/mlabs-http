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

- A new got instance will be created for the HttpClient.
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
      Only used when `origin`
      Default: none.
    - `baseUrl` (*string*): The [Got `baseUrl`].
      Default: none.
    - `bearerToken` (*string*): Token to send in the `authorization` header.
      Default: none.
    - `json` (*boolean*): The [Got `json`] option.
      Default: true.
    - `extend` (*object*): Passed to [`got.extend`] when creating the got instance.

#### Returns

(*HttpClient*)

## HttpClient

- Wraps all [Got] methods (except `stream`) with an identical API:
  `get`, `post`, `put`, `patch`, `head`, and `delete`.
- Methods return a Promise with the response body
  and not the whole Got response object
  (this is different then the default Got behavior).
  Use `resolveWithFullResponse` to get the full response.
- All methods have a `meta` option to log additional properties to the `meta` key.
- All methods have these additional options, which may be set per-request
  to override the default from the constructor (see below):
    - `resolveWithFullResponse`
    - `resLogLevel`
    - `willLogOptions`

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
    - `willLogOptions` (*boolean*): If true, log all options under `meta`.
      Default: true.
    - `resLogLevel` (*string*): Log level to log successful responses.
      If this level is active, then successful responses
      will be logged with the full response.
      Default: debug.
    - `log` (*object*): A [Logger].
      Default: a new logger.

[Got]: https://github.com/sindresorhus/got
[Got `json`]: https://github.com/sindresorhus/got#json
[Got `baseUrl`]: https://github.com/sindresorhus/got#baseurl
[`got.extend`]: https://github.com/sindresorhus/got#gotextendoptions
