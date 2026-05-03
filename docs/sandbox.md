# sandbox & mock mode

## purpose

Der Sandbox-Modus ermöglicht Frontend- und Form-AJAX-Flows ohne echtes Backend.

## config

```json
{
  "ApiMode": "live"
}
```

Erlaubte Werte:

- `live`: echte API-Requests
- `sandbox`: `XApi` verwendet registrierte Mocks

## register mock

```js
XApi.registerMock('users/login', {
  success: true,
  status: 200,
  response: { id: 1, username: 'demo', login: true },
  errors: {}
}, { method: 'POST', delay: 300 });
```

## dynamic mock

```js
XApi.registerMock('users/registration', async ({ body }) => {
  if (!body.email) {
    return {
      success: false,
      status: 422,
      response: null,
      errors: { email: 'email is required' }
    };
  }

  return {
    success: true,
    status: 200,
    response: { id: 2, username: body.username },
    errors: {}
  };
}, { method: 'POST' });
```

## upload mocks

`XApi.submitForm(...)` übergibt bei Uploads `FormData` als `body` an den Mock-Handler. Dadurch können Upload-Responses ohne Server simuliert werden.

## standard scenarios

- success response
- validation error (`422`)
- auth error (`401`)
- rate limit (`429`)
- missing mock (`404`)
- artificial delay via `options.delay`
