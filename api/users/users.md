# users API

## contract version

- version: `v1.0.0`
- compatibility: standard X6 users flow contract for list, login, and registration
- workflow: `users.registration`

## endpoints

- `GET /api/users/index` -> list users (safe fields only)
- `POST /api/users/login` -> login with `username`, `password`
- `POST /api/users/registration` -> register with `username`, `email`, `password`, `password2`

## request/response examples

## request

- `GET /api/users/index`
  - body: none
  - query/path params: none
- `POST /api/users/login`
  - body: `username`, `password`
- `POST /api/users/registration`
  - body: `username`, `email`, `password`, `password2`

## success response

### GET /api/users/index

success response:

```json
{
  "success": true,
  "status": 200,
  "response": [
    {
      "id": 3,
      "username": "demo",
      "email": "demo@example.com",
      "hash": "A1B2C3D4E5"
    }
  ],
  "errors": []
}
```

wrong method response:

```json
{
  "success": false,
  "status": 405,
  "response": null,
  "errors": {
    "method": "method not allowed"
  }
}
```

### POST /api/users/login

request body:

```json
{
  "username": "demo",
  "password": "secret"
}
```

success response:

```json
{
  "success": true,
  "status": 200,
  "response": {
    "id": 3,
    "username": "demo",
    "email": "demo@example.com",
    "hash": "A1B2C3D4E5",
    "lastlogin_date": 1777834000
  },
  "errors": []
}
```

validation error response:

```json
{
  "success": false,
  "status": 422,
  "response": null,
  "errors": {
    "username": "username is required",
    "password": "password is required"
  }
}
```

auth error response:

```json
{
  "success": false,
  "status": 401,
  "response": null,
  "errors": {
    "credentials": "invalid login"
  }
}
```

### POST /api/users/registration

request body:

```json
{
  "username": "demo",
  "email": "demo@example.com",
  "password": "secret",
  "password2": "secret"
}
```

success response:

```json
{
  "success": true,
  "status": 200,
  "response": {
    "id": 4,
    "username": "demo",
    "email": "demo@example.com",
    "hash": "F6G7H8I9J0"
  },
  "errors": []
}
```

validation/duplicate response:

```json
{
  "success": false,
  "status": 422,
  "response": null,
  "errors": {
    "email": "email already exists"
  }
}
```

## error responses

- `405` logical status for wrong HTTP methods.
- `422` logical status for validation errors.
- `401` logical status for invalid login credentials.

All responses still use HTTP status `200` and the standard payload shape from `docs/x_api.md`.

## auth requirements

- `GET /api/users/index`: currently public; must expose safe fields only.
- `POST /api/users/login`: public credential exchange.
- `POST /api/users/registration`: public account creation.

## validation rules

- `login.username`: required, normalized lowercase.
- `login.password`: required.
- `registration.username`: required, normalized lowercase, unique.
- `registration.email`: required, valid email, unique.
- `registration.password`: required.
- `registration.password2`: must match `password`.

## testability

- FE forms use `XApi.submitForm(...)` and therefore exercise the documented request/response shape.
- `compiler/smoke_database.php` covers registration, login, select and cleanup delete for the configured database engine.
- `compiler/check_md_first.php` validates required API contract sections.
