# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- Update to Got v9.6.0.

### Added

- Option `healthBaseUrl` to override health check `baseUrl`.

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

[Unreleased]: https://github.com/meltwater/mlabs-http/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/meltwater/mlabs-http/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/meltwater/mlabs-http/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/meltwater/mlabs-http/compare/v1.0.0...v1.1.0
