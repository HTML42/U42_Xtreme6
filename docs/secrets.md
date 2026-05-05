# credentials & secrets management

## purpose

Projekt-Credentials, API-Keys und Secrets dürfen niemals im Frontend-Bundle oder im Repository landen.

Diese Datei ist die kanonische Quelle für Secrets/Credentials. API-, Sandbox- oder Framework-Dokumente sollen hierher verlinken statt Secret-Regeln zu duplizieren.

## files

- `_secrets.json`: lokale, environment-spezifische Secrets-Datei (gitignored)
- `_secrets.example.json`: Template ohne echte Secrets (committed)
- `compiler/report_secret_usage.php`: QA-/Manager-Report für Secret-Provider, Service-Abhängigkeiten und fehlende Struktur, ohne Werte auszugeben.

## access rules

- Secrets werden ausschließlich serverseitig gelesen.
- Frontend erhält niemals Secret-Werte via `window.X6_CONFIG` oder API-Responses.
- API-Endpunkte dürfen Secrets nur für Backend-zu-Backend-Kommunikation verwenden.
- Externe APIs werden über Backend-Proxy-Endpunkte angebunden; das Frontend ruft nur die Xtreme6-API via `XApi` auf.
- Sandbox-/Mock-Szenarien dürfen Secret-Abhängigkeiten simulieren, aber keine echten Secret-Werte enthalten.

## provider interface

Alle Credential-Zugriffe laufen serverseitig über ein Provider-Interface. Runtime-Code darf nicht direkt `_secrets.json`, Environment-Variablen oder spätere Vault-SDKs lesen.

Provider contract:

- `provider.default`: Default-Provider für das Environment.
- `provider.environment`: logischer Environment-Name (`dev`, `stage`, `prod`).
- `services.<service>.provider`: optionaler Service-Override.
- `services.<service>.credentials`: lokale Secret-Werte oder Platzhalter im Example.
- `services.<service>.env`: Mapping von Credential-Pfad zu Environment-Variable.
- `services.<service>.required_secrets`: maschinenlesbare Liste benötigter Secret-Pfade ohne Werte.
- `services.<service>.proxy_endpoints`: dokumentierte Xtreme6-Backend-Proxy-Endpunkte, die diesen Service serverseitig verwenden.
- `services.<service>.rate_limits`: wertfreie lokale/upstream Rate-Limit-Notizen für QA und Manager-Review.
- `services.<service>.failure_strategy`: erwartete Fehlerklassen ohne Secret-Werte oder Upstream-Debugdaten.

Serverseitige Helper:

- `x_secrets_load()` lädt die Provider-Konfiguration.
- `x_secret_get('services.example_api.credentials.api_key')` liest einen einzelnen Secret-Wert per Dot-Path.
- `x_secret_service_report()` erzeugt einen wertfreien Report für QA/Manager.

Unterstützte Provider:

- `local_file`: liest aus `_secrets.json` (Default für lokale Entwicklung).
- `env`: liest konfigurierte Secret-Pfade aus Environment-Variablen.
- `vault`: reservierter Future-Provider; muss in Projekten explizit implementiert werden, bevor er produktiv genutzt wird.

## structure

```json
{
  "provider": {
    "default": "local_file",
    "environment": "dev"
  },
  "services": {
    "example_api": {
      "purpose": "Demo external API integration via backend proxy only",
      "provider": "local_file",
      "base_url": "https://api.example.com",
      "credentials": {
        "api_key": "replace-me",
        "api_secret": "replace-me"
      },
      "env": {
        "credentials.api_key": "EXAMPLE_API_KEY",
        "credentials.api_secret": "EXAMPLE_API_SECRET"
      },
      "required_secrets": {
        "api_key": "services.example_api.credentials.api_key",
        "api_secret": "services.example_api.credentials.api_secret"
      },
      "proxy_endpoints": [
        "/api/integrations/example_lookup"
      ],
      "rate_limits": {
        "local_proxy": "60 requests per IP per 15 minutes",
        "upstream": "document per service contract"
      },
      "failure_strategy": {
        "missing_credentials": "503 config error via standard API payload",
        "timeout": "504 timeout via standard API payload",
        "invalid_response": "502 upstream error via standard API payload",
        "rate_limit": "429 rate_limit via standard API payload"
      },
      "rotation": {
        "dev": "local developer-owned value",
        "stage": "stage secret store or environment variable",
        "prod": "production secret store or environment variable"
      }
    }
  }
}
```

## helper functions

- `x_secrets_load()` loads `_secrets.json` as array.
- `x_secret_get('services.example_api.api_key')` reads dot-path values safely.
- Prefer the structured path `services.<service>.credentials.<key>` for new integrations.
- Legacy direct service paths like `services.example_api.api_key` are read only as backward-compatible fallback.

## environment strategy

- dev/stage/prod maintain their own `_secrets.json`.
- values are rotated outside the repository.
- if a required secret is missing, the backend endpoint must fail with a controlled configuration error.
- `dev`: `local_file` is allowed for fast local setup.
- `stage`/`prod`: prefer `env` or future `vault`; `_secrets.json` may exist only as environment-local deploy artifact and is never committed.
- Rotation changes the environment-local value/provider only; markdown, API contracts and frontend code must not change for rotation.

## external api integration references

Credentialed external APIs must follow the backend-only proxy blueprint in `docs/x_api.md`.

- Each service in `_secrets.example.json` documents its purpose, placeholder credentials, required secret paths and proxy endpoint names without values.
- API Markdown for the concrete proxy endpoint documents request/response/failures and references only required secret **paths**, never values.
- `compiler/report_secret_usage.php` is the manager-readable dependency report and must print only provider names, credential key names, proxy endpoints and required secret paths.
- Sandbox definitions in `docs/sandbox.md` and `docs/sandbox_scenarios.json` simulate the proxy endpoint without real credentials.
- Missing credentials are runtime configuration failures and must return controlled API payloads instead of warnings, stack traces or raw upstream errors.

## leak prevention

- `_secrets.json` is gitignored.
- Build/QA must scan generated `dist/*` files for obvious secret names/values before release.
- `window.X6_CONFIG` may expose only public config keys documented in compiler output (`Language`, `FallbackLanguage`, `AvailableLanguages`, `ApiMode`).
- Private service names, credential key names and values must not be emitted into frontend bundles unless they are explicitly documented as public non-secret config.
- `compiler/check_secret_leaks.php` checks `dist/*` for forbidden secret patterns and configured secret values without printing those values.
- `compiler/report_secret_usage.php` documents which services require which secret paths/providers without printing values.
