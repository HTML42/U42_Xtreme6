# users API

## endpoints

- `GET /api/users/index` -> list users (safe fields only)
- `POST /api/users/login` -> login with `username`, `password`
- `POST /api/users/registration` -> register with `username`, `email`, `password`, `password2`

## request/response examples

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
