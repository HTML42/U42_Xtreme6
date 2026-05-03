# current state (xtreme6)

## stand 2026-05-03

## milestone 2026-05-03: framework finalization progress

### frontend: fertig

- routing-basis ist vorhanden (`scripts/x_router.class.js`) und controller/views werden grundsätzlich aufgelöst.
- template-system inkl. placeholder-rendering ist vorhanden (`scripts/x_template.class.js`, `templates/*`).
- i18n-basis ist vorhanden (`scripts/x_translation.class.js`, `translations/de/*`).
- api-client ist vorhanden (`scripts/x_api.class.js`) und liefert standardisierte payloads.
- login/registration views sind als templates vorhanden.
- login/registration controller submits laufen per `XApi.submitForm(...)` inkl. loading/success/error feedback.
- translation-governance prüft Pflicht-Keys und Route-Captions im Build.
- ui-primitives sind in `docs/ui_primitives.md` inventarisiert; Sidebar nutzt nur deklarierte Routen.

### frontend: fehlt noch

- breadcrumb primitive ist dokumentiert, aber noch nicht implementiert.
- route-level ui config ist dokumentiert, aber noch nicht compiler-erzwungen.
- slideshow primitive ist dokumentierte P2-Lücke.

### backend: fertig

- zentrale api-router-entry ist funktionsfähig (`api/index.php`, `dist/api.php`).
- api-bootstrap lädt framework + object runtime (`api/_includes.php`).
- standard-response-contract (`x_api_output`) ist umgesetzt.
- users-api ist vorhanden:
  - `GET /api/users/index`
  - `POST /api/users/login`
  - `POST /api/users/registration`
- release-qa smoke script existiert (`compiler/smoke_database.php`).

### backend: fehlt noch

- session/auth-token layer ist noch nicht implementiert (nur credential-check + login timestamp).
- rate-limit / brute-force schutz fehlt.
- feinere input-validierung und mail-verifikation fehlen.
- weitere domain-endpoints über test/users hinaus fehlen noch.

### datenbankabstraktion: stand

- abstraktions-layer ist aktiv über `XDB` mit engine-switch via `config.json` (`json`/`mysql`).
- json-driver (`x/x_db_json.class.php`) unterstützt select/insert/update/delete, auto-id und model-table bootstrap.
- mysql-driver (`x/x_db_mysql.class.php`) unterstützt select/insert/update/delete, modelbasiertes create-table und identifier-safety.
- user-objekte sind jetzt an die db-abstraktion angebunden (`XUser`, `XUsers`) für load/login/registration/duplikatprüfungen.
- smoke-test deckt Registrierung/Login/Select/Delete für die konfigurierte Engine ab; MySQL wird ohne lokale `_db.json` bewusst übersprungen.

### datenbankabstraktion: fehlt noch

- migrations-/schema-update-logik bei modelländerungen (aktuell nur create-if-missing).
- transaktionen/locking-strategie für komplexere write-flows.
- soft-delete-konzept konsistent über alle queries (derzeit nur feld vorhanden, keine globale filter-policy).

### release/qa: stand

- `docs/release_qa.md` definiert Smoke-Tests und Commit-/PR-Checkliste.
- `compiler/check_md_first.php`, `compiler/check_secret_leaks.php`, Compiler-Pipeline und `compiler/smoke_database.php` sind die aktuelle Mindest-QA.
- Workflow-MD-Governance ist aktiv: `docs/workflows/users.registration.md` dokumentiert den Users-Registration-Prozess, `compiler/check_md_first.php` prüft Workflow-Referenzen/Pflichtsektionen, und `compiler/report_workflow_traceability.php` erzeugt den Prozess-zu-API/Object-Report.
- Object-Generator-Governance ist aktiv: Object-MDs enthalten Generator-Schema/Properties/Methods/Validation/Persistence/Tests, `compiler/check_md_first.php` erzwingt Singular/Plural-Paare, und `compiler/report_object_generation.php` reportet Artefakt-Readiness vor Generatorläufen.
