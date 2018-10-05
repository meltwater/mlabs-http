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

[Got `json`]: https://github.com/sindresorhus/got#json
[Got `baseUrl`]: https://github.com/sindresorhus/got#baseurl
[`got.extend`]: https://github.com/sindresorhus/got#gotextendoptions
