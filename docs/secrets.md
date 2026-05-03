# credentials & secrets management

## purpose

Projekt-Credentials, API-Keys und Secrets dürfen niemals im Frontend-Bundle oder im Repository landen.

## files

- `_secrets.json`: lokale, environment-spezifische Secrets-Datei (gitignored)
- `_secrets.example.json`: Template ohne echte Secrets (committed)

## access rules

- Secrets werden ausschließlich serverseitig gelesen.
- Frontend erhält niemals Secret-Werte via `window.X6_CONFIG` oder API-Responses.
- API-Endpunkte dürfen Secrets nur für Backend-zu-Backend-Kommunikation verwenden.

## structure

```json
{
  "services": {
    "example_api": {
      "base_url": "https://api.example.com",
      "api_key": "replace-me",
      "api_secret": "replace-me"
    }
  }
}
```

## helper functions

- `x_secrets_load()` loads `_secrets.json` as array.
- `x_secret_get('services.example_api.api_key')` reads dot-path values safely.

## environment strategy

- dev/stage/prod maintain their own `_secrets.json`.
- values are rotated outside the repository.
- if a required secret is missing, the backend endpoint must fail with a controlled configuration error.

## leak prevention

- `_secrets.json` is gitignored.
- Build/QA must scan generated `dist/*` files for obvious secret names/values before release.
