# sandbox & mock mode

## purpose

Der Sandbox-Modus ermöglicht Frontend- und Form-AJAX-Flows ohne echtes Backend.

Kanonische Verbindungen:

- API-Verträge stehen in `api/<dimension>/<dimension>.md` und `docs/x_api.md`.
- Form-/Upload-Fehler müssen denselben Response- und Field-Error-Contract nutzen wie Live-APIs.
- Secrets bleiben backend-only; Sandbox-Mocks dürfen keine echten Secret-Werte enthalten (`docs/secrets.md`).
- AI-/Developer-Workflow startet bei `agents.md` und `docs/md_first.md` statt bei Runtime-Mocks.

## config

```json
{
  "ApiMode": "live",
  "ApiScenario": "success"
}
```

Erlaubte Werte:

- `live`: echte API-Requests
- `sandbox`: `XApi` verwendet registrierte Mocks

`ApiScenario` wählt im Sandbox-Modus ein versioniertes Szenario aus `docs/sandbox_scenarios.json`. Wenn kein Szenario gesetzt ist, nutzt `XApi` `success`.

## scenario source of truth

Mock-Szenarien werden zuerst in `docs/sandbox_scenarios.json` definiert und danach in Runtime-Mocks geladen.

Pflichtstruktur:

- `version`: Contract-Version der Scenario-Datei.
- `defaultScenario`: Fallback-Szenario.
- `scenarios.<name>.description`: menschenlesbarer Zweck.
- `scenarios.<name>.endpoints.<METHOD> <path>`: Payload und optional Delay je Endpoint.
- `coverage.requiredScenarioTypes`: Mindesttypen für Release-QA (`success`, `validation-error`, `auth-error`, `timeout`, `upload-error`).

Endpoint-Pfade verwenden denselben relativen Pfad wie `XApi.request(...)`, z. B. `users/login`.

## load scenarios

`XApi.loadMockScenarios(config)` akzeptiert die JSON-Struktur aus `docs/sandbox_scenarios.json` oder eine daraus generierte Runtime-Konfiguration. Das aktuell aktive Szenario kommt aus:

1. `window.X6_CONFIG.ApiScenario`
2. `config.defaultScenario`
3. `success`

Manuelle Umschaltung ist per `XApi.setScenario('validation-error')` möglich.

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

Upload-Mock-Handler sollen realistische Metadaten zurückgeben:

```js
XApi.registerMock('test/upload', async ({ body }) => {
  const files = Array.from(body.entries())
    .filter(([, value]) => value instanceof File)
    .map(([field, file]) => ({ field, name: file.name, size: file.size, type: file.type }));

  return {
    success: true,
    status: 200,
    response: { files },
    errors: {}
  };
}, { method: 'POST', delay: 300 });
```

Validation-Error-Mocks müssen Field-Errors mit dem Upload-Feldnamen liefern, z. B. `{ attachment: 'file type not allowed' }`.

## external api proxy mocks

Sandbox-Mocks für credentialed external APIs simulieren immer den **Xtreme6 Backend-Proxy-Endpunkt**, nicht die fremde Upstream-URL.

Rules:

- Source-of-truth ist die externe Integrationsbeschreibung nach `docs/x_api.md` plus die wertfreie Service-Struktur in `docs/secrets.md`.
- Endpoint-Keys verwenden den Xtreme6-Pfad, z. B. `POST integrations/example_lookup`.
- Payloads nutzen den Standard-API-Contract (`success`, `status`, `response`, `errors`).
- Mocks dürfen keine echten Service-Namen enthalten, wenn diese vertraulich sind; öffentliche Demo-Namen wie `example_api` sind erlaubt.
- Mocks dürfen niemals Secret-Werte, Authorization-Header oder upstream debug dumps enthalten.
- Failure-Szenarien müssen mindestens missing credentials/config error, timeout, invalid upstream response und rate limit abbilden, sobald der Live-Proxy implementiert wird.

Example proxy mock payload:

```json
{
  "POST integrations/example_lookup": {
    "delay": 200,
    "payload": {
      "success": true,
      "status": 200,
      "response": {
        "provider": "example_api",
        "result": "sandbox external lookup"
      },
      "errors": {}
    }
  }
}
```

## standard scenarios

- success response
- validation error (`422`)
- auth error (`401`)
- rate limit (`429`)
- missing mock (`404`)
- external config error (`503`)
- external upstream error (`502`)
- external timeout (`504`)
- upload validation error (`422` with field errors)
- artificial delay via `options.delay`

## demo playbook

1. In `config.json` setzen: `"ApiMode": "sandbox"` und optional `"ApiScenario": "success"`.
2. App bauen: `php compiler/compile_scripts.php && php compiler/compile_production.php`.
3. Flow `success`: Login/Registration/Upload liefern erfolgreiche Mock-Payloads.
4. Flow `validation-error`: FormAjax zeigt Field-Errors und Summary ohne Live-Backend.
5. Flow `auth-error`: Login liefert `401` mit `credentials`-Error.
6. Flow `timeout`: Mocks liefern `504` nach Delay und testen Loading/Error-State.
7. Flow `upload-error`: Upload-Mock liefert Field-Error am Upload-Feld.
8. QA: `php compiler/report_sandbox_coverage.php` muss die Szenario- und Endpoint-Abdeckung bestätigen.
