# current state (xtreme6)

## stand 2026-05-03

## frontend: fertig

- routing-basis ist vorhanden (`scripts/x_router.class.js`) und controller/views werden grundsätzlich aufgelöst.
- template-system inkl. placeholder-rendering ist vorhanden (`scripts/x_template.class.js`, `templates/*`).
- i18n-basis ist vorhanden (`scripts/x_translation.class.js`, `translations/de/*`).
- api-client ist vorhanden (`scripts/x_api.class.js`) und liefert standardisierte payloads.
- login/registration views sind als templates vorhanden.

## frontend: fehlt noch

- controller-logik für login/registration ist aktuell nur stub/logging (`scripts/controllers/users.controller.js`).
- form-submit handling für login/registration inkl. `XApi.request(...)` fehlt.
- ui-state für success/error handling der api antworten fehlt.

## backend: fertig

- zentrale api-router-entry ist funktionsfähig (`api/index.php`, `dist/api.php`).
- api-bootstrap lädt framework + object runtime (`api/_includes.php`).
- standard-response-contract (`x_api_output`) ist umgesetzt.
- users-api ist vorhanden:
  - `GET /api/users/index`
  - `POST /api/users/login`
  - `POST /api/users/registration`

## backend: fehlt noch

- session/auth-token layer ist noch nicht implementiert (nur credential-check + login timestamp).
- rate-limit / brute-force schutz fehlt.
- feinere input-validierung und mail-verifikation fehlen.
- weitere domain-endpoints über test/users hinaus fehlen noch.

## datenbankabstraktion: stand

- abstraktions-layer ist aktiv über `XDB` mit engine-switch via `config.json` (`json`/`mysql`).
- json-driver (`x/x_db_json.class.php`) unterstützt select/insert/update/delete, auto-id und model-table bootstrap.
- mysql-driver (`x/x_db_mysql.class.php`) unterstützt select/insert/update/delete, modelbasiertes create-table und identifier-safety.
- user-objekte sind jetzt an die db-abstraktion angebunden (`XUser`, `XUsers`) für load/login/registration/duplikatprüfungen.

## datenbankabstraktion: fehlt noch

- migrations-/schema-update-logik bei modelländerungen (aktuell nur create-if-missing).
- transaktionen/locking-strategie für komplexere write-flows.
- soft-delete-konzept konsistent über alle queries (derzeit nur feld vorhanden, keine globale filter-policy).
