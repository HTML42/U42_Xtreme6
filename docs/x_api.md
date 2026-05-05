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

Recommended machine-readable endpoint lines:

- `- METHOD /api/<dimension>/<endpoint> -> description`
- Example: `- POST /api/users/login -> login with username and password`

Versioning rules:

- Contract versions use a simple semantic string, for example `v1.0.0`.
- Backward-compatible documentation/example additions may increment the patch version.
- Request/response shape changes must increment the minor version.
- Breaking endpoint or semantic behavior changes require a new major version and migration notes.

Testability rules:

- Each endpoint must document at least one success path and one error/method/validation path unless the endpoint is explicitly read-only with no input.
- Test commands or smoke coverage must be referenced from the descriptor or `docs/release_qa.md`.
- FE integrations must use the documented request body and standard response payload.
- FE controllers must only call endpoints documented in API markdown.
- `php compiler/report_api_contracts.php` validates endpoint docs, PHP endpoint files, FE `XApi` calls, and standard response contract usage.

Frontend/backend boundary:

- Frontend code must reach backend behavior only through documented API endpoints and `XApi`/`XApi.submitForm(...)`.
- `scripts/x_api.class.js` is the only frontend source file allowed to call `fetch(...)` or build `/api/...` URLs directly.
- Direct database access, PHP includes, backend file paths, or secrets in `scripts/` and `templates/` are forbidden.
- Credentialed external services must be called through backend API endpoints; the frontend never receives private credentials.
- API mode is configured via project config key `ApiMode` (`_config.json` with `_config.example.json` fallback) and exposed to runtime as `window.X6_CONFIG.ApiMode` with values `live` or `sandbox`.
- API base routing is standardized as `/api/<dimension>/<endpoint>` in frontend code; production deployments must serve/rewrite this to the `dist/api.php` router.
- `php compiler/check_frontend_boundary.php` validates these frontend/backend boundary rules non-destructively.

For sandbox/mock behavior, see `docs/sandbox.md`. For secrets, see `docs/secrets.md`.

## external api integration blueprint

External API integrations are **backend-only proxy features**. They must be specified in Markdown before any runtime endpoint, frontend call, or sandbox mock is added.

Minimum MD schema for every credentialed external integration:

- `service`: lowercase service identifier matching `services.<service>` in `_secrets.example.json` and environment-local `_secrets.json`.
- `purpose`: why the project calls the external API and which feature owns the integration.
- `backend_proxy_endpoint`: documented Xtreme6 endpoint, for example `/api/integrations/example_lookup`; frontend code calls only this endpoint through `XApi`.
- `external_upstream`: external base URL or logical upstream name; private host details may remain in server-side config when sensitive.
- `required_secrets`: value-free secret paths such as `services.example_api.credentials.api_key`; never include secret values.
- `rate_limits`: local proxy limits and known upstream limits, including retry/backoff rules.
- `request_mapping`: allowed frontend request fields and how the backend maps them to the upstream request.
- `response_mapping`: sanitized response fields returned to the frontend; upstream raw payloads must not leak by default.
- `failure_strategy`: behavior for missing credentials, upstream timeout, invalid upstream response, upstream auth failure and rate limit.
- `sandbox`: scenario names and mock endpoint payloads derived from the same integration MD.
- `testability`: report/smoke commands that prove secret usage, sandbox coverage and frontend/backend boundary.

Backend-only proxy pattern:

1. Frontend calls `XApi.request('integrations/example_lookup', ...)` or submits a form through `XApi.submitForm(...)`.
2. Xtreme6 API endpoint validates the request and resolves required credentials with `x_secret_get(...)` on the server.
3. Backend calls the external upstream with server-side credentials.
4. Backend maps upstream success/failure to the standard `x_api_payload(...)` shape.
5. Frontend receives only sanitized business data and standard field/global errors; no secret names, values or upstream debug dumps are returned.

Standard failure strategy:

- missing credentials: `success=false`, `status=503`, `errors.config = "external service not configured"`.
- upstream timeout: `success=false`, `status=504`, `errors.timeout = "external service timeout"`.
- invalid upstream response: `success=false`, `status=502`, `errors.upstream = "invalid external service response"`.
- upstream auth failure: `success=false`, `status=502`, `errors.upstream_auth = "external service authentication failed"`.
- upstream/local rate limit: `success=false`, `status=429`, `errors.rate_limit = "too many requests"`.

External integration QA must include:

- `php compiler/report_secret_usage.php` to list service, proxy endpoints and required secret paths without values.
- `php compiler/report_sandbox_coverage.php` when the proxy endpoint is documented in an API MD and has sandbox scenarios.
- `php compiler/check_frontend_boundary.php` to ensure frontend code still uses only `XApi` and no backend/secret references.
- `php compiler/check_secret_leaks.php` after build to ensure generated bundles contain no private service configuration.

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
- `x_api_validate_payload_shape(...)`

Both are defined in `x/x_functions.php`.

## security/auth reference

- rollout specification: `docs/security_auth.md`
