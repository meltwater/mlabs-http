# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [5.0.0] / 2022-04-03

### Changed

- Update to awilix v7.

## [4.0.0] / 2022-02-14

### Changed

- (**Breaking**) Update to Got version 12.
    - Required Node.js >=14.
    - This package is now pure ESM.
- Update to quick-lru v6.
- Update to mlabs-logger v9.
- Update to awilix v6.
- Update to prom-client v14.

## [3.2.0] / 2021-05-09

### Added

- New option `got` to `createHttpClient`.

## [3.1.1] / 2021-03-03

### Fixed

- Downgrade quick-lru to v5 to avoid ES module issue.

## [3.1.0] / 2021-03-03

### Added

- New metric `requests_retried_total.`
- New metric hook `metricsHandleRetry`.
- New `retry` event emitted.

### Changed

- Log `statusCode` on retry warning.
- Metric `request_duration_milliseconds` now includes retry timings.
- Update quick-lru to v6.

## [3.0.0] / 2020-12-24

### Added

- Publish as both ES and CommonJS module.

### Changed

- (**Breaking**) Renamed export `createClient` to `createHttpClient`.
- (**Breaking**) Update prom-client to v13.
- (**Breaking**) Use Conditional Exports to provide ES or CommonJS module.
  Cannot import or require internal paths.
- (**Breaking**) Drop support for Node.js versions before 12.13.0.

### Removed

- (**Breaking**) The `default` export.

## [2.0.1] / 2020-11-17

### Changed

- Update all dependencies and test on Node Fermium.
- License to MIT.

## [2.0.0] / 2020-07-21

### Changed

- (**Breaking**) Update to Got v11.
  - Replaced `baseUrl` with `prefixUrl` to match Got update.
  - Replaced `healthBaseUrl` with `healthPrefixUrl` to match.
  - Remove `json` option in favor
    of passing `responseType` in `extend` option.
    The default `responseType` is `json`.
  - Metrics handler `data` property `fromCache` renamed to `isFromCache`.
  - The new Got error structure now puts many properties that use to be on the
    root object under `response`.
    The directly effects the errors thrown by the `HttpClient`.
    However, the `statusCode` is now copied to the root error object
    for convenience.

## [1.6.0] / 2020-06-18

### Changed

- Update all dependencies (except to Got).

## [1.5.0] / 2020-03-19

### Changed

- Update all dependencies (except to Got).

## [1.4.0] / 2019-04-11

### Changed

- Open source under the Apache License, Version 2.0!

## [1.3.0] / 2019-03-07

### Changed

- Update to Got v9.6.0.

### Added

- Option `healthBaseUrl` to override health check `baseUrl`.
- Register Got hooks via `createHooks` option.
- Allow passing `hooks` to `createClient` to be added to default got options.

### Fixed

- Throw informative error if metrics are not registered.

## [1.2.0] / 2019-02-16

### Added

- Register and use quick-lru cache with `registerClient`.
- Log `fromCache` at top level.
- New metrics:
  - `http_client_requests_completed_cached_total`
  - `http_client_requests_failed_cached_total`

### Fixed

- Handle error with metrics and cached response.

## [1.1.1] / 2018-12-17

### Changed

- Update to [makenew-node-lib] v5.3.0.

## [1.1.0] / 2018-10-30

### Added

- Log warning on retry.

### Changed

- Update Got to v9.3.0.

### Fixed

- Metric timings work with Got v9.3.0.
- Error contains body with Got v9.3.0.

## 1.0.0 / 2018-10-22

- Initial release.

[makenew-node-lib]: https://github.com/meltwater/makenew-node-lib

[Unreleased]: https://github.com/meltwater/mlabs-http/compare/v5.0.0...HEAD
[5.0.0]: https://github.com/meltwater/mlabs-http/compare/v4.0.0...v5.0.0
[4.0.0]: https://github.com/meltwater/mlabs-http/compare/v3.2.0...v4.0.0
[3.2.0]: https://github.com/meltwater/mlabs-http/compare/v3.1.1...v3.2.0
[3.1.1]: https://github.com/meltwater/mlabs-http/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/meltwater/mlabs-http/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/meltwater/mlabs-http/compare/v2.0.1...v3.0.0
[2.0.1]: https://github.com/meltwater/mlabs-http/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/meltwater/mlabs-http/compare/v1.6.0...v2.0.0
[1.6.0]: https://github.com/meltwater/mlabs-http/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/meltwater/mlabs-http/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/meltwater/mlabs-http/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/meltwater/mlabs-http/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/meltwater/mlabs-http/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/meltwater/mlabs-http/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/meltwater/mlabs-http/compare/v1.0.0...v1.1.0
