# test.md

## role

Dimension specification for `api/test/*` endpoints.

Each API dimension must provide one `<dimension>.md` file that describes the dimension endpoints.

## contract version

- version: `v1.0.0`
- compatibility: development/test-only helper contract

## endpoints

### foo (`api/test/foo.php`)
- outputs its endpoint name as response payload: `"foo"`

### bar (`api/test/bar.php`)
- outputs its endpoint name as response payload: `"bar"`

## request

- `GET /api/test/foo`
  - body: none
  - query/path params: ignored
- `GET /api/test/bar`
  - body: none
  - query/path params: ignored

## success response

`GET /api/test/foo`:

```json
{
  "success": true,
  "status": 200,
  "response": "foo",
  "errors": []
}
```

`GET /api/test/bar`:

```json
{
  "success": true,
  "status": 200,
  "response": "bar",
  "errors": []
}
```

## error responses

- no endpoint-specific error responses; framework routing errors are handled by `dist/api.php`.

## auth requirements

- none; test endpoints are public development helpers.

## validation rules

- no input validation; request body is ignored.

## testability

- covered by API contract governance in `compiler/check_md_first.php`.
- manual smoke: request `/api/test/foo` and `/api/test/bar` through the configured API entrypoint and verify standard payload format.
