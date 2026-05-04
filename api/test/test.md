# test.md

## role

Dimension specification for `api/test/*` endpoints.

Each API dimension must provide one `<dimension>.md` file that describes the dimension endpoints.

## contract version

- version: `v1.0.0`
- compatibility: development/test-only helper contract

## endpoints

- `GET /api/test/foo` -> outputs its endpoint name as response payload: `"foo"`
- `GET /api/test/bar` -> outputs its endpoint name as response payload: `"bar"`
- `POST /api/test/upload` -> echoes uploaded file metadata for FormAjax upload testing

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
- `POST /api/test/upload`
  - body: multipart form data
  - fields: arbitrary file fields

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

`POST /api/test/upload`:

```json
{
  "success": true,
  "status": 200,
  "response": {
    "files": [
      {
        "field": "attachment",
        "name": "demo.pdf",
        "size": 12345,
        "type": "application/pdf"
      }
    ]
  },
  "errors": []
}
```

## error responses

- `POST /api/test/upload` returns logical `405` for wrong methods.
- Other framework routing errors are handled by `dist/api.php`.

## auth requirements

- none; test endpoints are public development helpers.

## validation rules

- `foo`/`bar`: no input validation; request body is ignored.
- `upload`: accepts multipart file fields and reports metadata only; no files are persisted.

## testability

- covered by API contract governance in `compiler/check_md_first.php`.
- manual smoke: request `/api/test/foo` and `/api/test/bar` through the configured API entrypoint and verify standard payload format.
