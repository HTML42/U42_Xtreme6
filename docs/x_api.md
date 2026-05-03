# x_api.md

## role of this file

Technical API reference for xtreme6.

- defines API routing model, dimension structure, include bootstrap, and response contract.
- if conflicts occur, `agents.md` has priority.

## api entrypoint and routing

API requests are routed through `dist/api.php`.

- direct access to project-root `api/` files is not intended.
- web requests should target `dist/api/...` and are rewritten to `dist/api.php`.
- first segment after `/api/` is interpreted as `dimension`.
- second segment after `/api/` is interpreted as `endpoint`.
- if second segment is missing, endpoint defaults to `index`.

Examples:

- `api/users` -> loads `api/users/index.php`
- `api/test/foo` -> loads `api/test/foo.php`
- `api/test/foo/bla/blubb` -> loads `api/test/foo.php` and forwards all segments as params.

Forwarded params contract:

- `X_API_PARAMS` (global) contains all path segments as array, e.g. `["test", "foo", "bla", "blubb"]`.
- `X_API_DIMENSION` and `X_API_ENDPOINT` contain resolved target values.

## api include bootstrap

API endpoints should include `api/_includes.php`.

This bootstrap loads:

- all required php framework files from `x/`
- object runtime (`dist/objects--prod.php`) for server-side object/business logic

This prevents redundant include blocks in every endpoint file.

## api dimensions

API is organized by dimensions:

- dimension = first-level folder in `api/`
- endpoint = php file inside dimension folder

Every API dimension must provide a markdown descriptor:

- required naming: `<dimension>.md`
- location: inside same dimension folder
- purpose: describe endpoints and behavior contract of this dimension.

Required API descriptor sections:

- `## contract version`
- `## endpoints`
- `## request`
- `## success response`
- `## error responses`
- `## auth requirements`
- `## validation rules`
- `## testability`

Versioning rules:

- Contract versions use a simple semantic string, for example `v1.0.0`.
- Backward-compatible documentation/example additions may increment the patch version.
- Request/response shape changes must increment the minor version.
- Breaking endpoint or semantic behavior changes require a new major version and migration notes.

Testability rules:

- Each endpoint must document at least one success path and one error/method/validation path unless the endpoint is explicitly read-only with no input.
- Test commands or smoke coverage must be referenced from the descriptor or `docs/release_qa.md`.
- FE integrations must use the documented request body and standard response payload.

Example:

- `api/test/test.md`

## response format contract (x5-compatible)

All API responses use HTTP status code `200` and return JSON payload:

```json
{
  "success": false,
  "status": 200,
  "response": null,
  "errors": []
}
```

Meaning:

- `success`: `true|false`, indicates business-logic completion state
- `status`: logical status indicator (defaults often to `200`)
- `response`: `null` on errors/unused; otherwise scalar/array/object
- `errors`: array of errors (prefer keyed entries by input names)

Helper functions:

- `x_api_payload(...)`
- `x_api_output(...)`

Both are defined in `x/x_functions.php`.

## security/auth reference

- rollout specification: `docs/security_auth.md`
