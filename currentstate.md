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

- route-level ui config ist dokumentiert, aber noch nicht compiler-erzwungen.
- erweiterte route-level ui composition features bleiben P2/P3-Ausbau (Task 33), die Basis-Primitives sind vorhanden.

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
- Model-Schema-Governance ist aktiv: `XDB` validiert Insert/Update zentral gegen `models/*.md`; JSON und MySQL nutzen dieselben Model-Regeln, und `compiler/report_model_schema.php` gibt JSON-/MySQL-Dry-Run-Pläne aus.
- Relationship-Governance ist aktiv: `models/*.md` definiert Beziehungen oder explizit `none`; `compiler/report_model_relationships.php` validiert Relations, plant MySQL-FKs und beschreibt JSON-Referential-Integrity-Checks non-destruktiv.
- API-Contract-Governance ist aktiv: `compiler/report_api_contracts.php` validiert API-MD-Endpunkte gegen PHP-Dateien, `x_api_output` usage, FE-Controller-Aufrufe und `x_api_payload` Shape.
- FE/BE-Boundary-Governance ist aktiv: `compiler/check_frontend_boundary.php` verhindert direkte Backend-/DB-/Secret-/PHP-Zugriffe in `scripts/` und `templates/`; nur `scripts/x_api.class.js` darf `/api/...` via `fetch(...)` kapseln.
- Form-Komponenten-Governance ist aktiv: `docs/forms.md` definiert das Form-MD-Schema, `docs/forms/users.login.md` und `docs/forms/users.registration.md` führen bestehende Users-Forms, und `compiler/report_form_components.php` prüft Pflichtsektionen, Komponenten, Template-Mapping und Translation-Keys.
- FormAjax-UX-Runtime-Primitives sind aktiv: `XApi.renderFormErrors(...)`, `XApi.setFormState(...)` und `XApi.renderUploadProgress(...)` übernehmen zentrale Field-Errors, Summary-Fokus, `aria-invalid`/`aria-describedby`, Retry-/Upload-Progress-State und vermeiden Feature-spezifische Error-DOM-Logik; Login/Registration-Templates nutzen `.x_form_field`, `.x_form_input_error[data-error-for]`, `.x_form_error_summary_slot` und `.x_form_upload_progress`.
- Upload-Pipeline-Governance ist aktiv: `XApi.submitForm(...)` unterstützt Upload-Prevalidation für Anzahl/Größe/MIME, Progress-Callbacks und standardisiertes Field-Error-Mapping; `docs/forms/examples.upload.md` dokumentiert Upload-MD-Regeln und Sandbox-Mocks liefern realistische File-Metadaten.
- Globaler Form-Flow-Audit ist aktiv: `compiler/report_form_flows.php` inventarisiert Runtime-Forms, gleicht sie mit `docs/forms/*.md` ab und prüft FormAjax-Bindings, Error-Status-Regionen und Verbot klassischer `action`/Native-Submits.
- UI-Primitive-Runtime ist aktiv: Breadcrumb (`templates/breadcrumb.js`) und Slideshow (`templates/slideshow.js`) werden route-level durch `XFramework.getRouteUiConfig(...)` gesteuert; `compiler/report_ui_primitives.php` validiert primitive Templates, Route-UI-Konfiguration und Template-Links gegen `docs/routes.md`.
- Credentials-Provider-System ist aktiv: `docs/secrets.md` spezifiziert `local_file`, `env` und future `vault`, `_secrets.example.json` dokumentiert strukturierte externe Service-Credentials, `x_secret_get(...)` kapselt serverseitigen Zugriff, `compiler/check_secret_leaks.php` prüft Frontend-/Dist-Artefakte auf Secret-Leaks und `compiler/report_secret_usage.php` reportet Secret-Abhängigkeiten ohne Werte.
- Sandbox-Szenario-System ist aktiv: `docs/sandbox_scenarios.json` definiert versionierte Mock-Szenarien (`success`, `validation-error`, `auth-error`, `timeout`, `upload-error`), `XApi.loadMockScenarios(...)` lädt die Scenario-Registry per `ApiScenario`, und `compiler/report_sandbox_coverage.php` validiert Szenario-Typen sowie API-Endpoint-Abdeckung.
- AI-Generation-Workflow ist aktiv: `docs/md_first.md` und `docs/release_qa.md` definieren den Ablauf MD ändern -> Runtime/Compiler ableiten -> QA -> dist bauen -> Tasks/State aktualisieren; `compiler/report_ai_generation.php` macht Diff-Kategorien, Runtime-only Risiken, QA-Kommandos und Manager-Evidence sichtbar.
- Release-Gate-Automation ist aktiv: `compiler/release_gate.php` bündelt MD-first, Secret-Scan, Secret-Usage, Sandbox-Coverage, AI-Generation, Workflow/Object/Model/API/Form/UI-Reports, Compiler-Schritte, Post-Build-Secret-Scan und DB-Smoke in einem non-interactive Gate mit `dist/release_gate_report.json`; `compiler/report_ai_generation.php` ignoriert diesen selbst erzeugten Report als erwartetes Gate-Artefakt.
- AI-Dokumentationsrouting ist bereinigt: `agents.md` enthält eindeutige Routing-Zeilen für Sandbox, AI-Generation und Release-Gate; Detaildocs verlinken auf `agents.md`/`docs/md_first.md` statt AI-Prozessregeln mehrfach auszuschreiben.

## milestone 2026-05-04: task 31 formajax ux runtime primitives complete

- Developer: Markdown-Source-of-Truth für FormAjax UX in `docs/forms.md`, `docs/forms/users.login.md`, `docs/forms/users.registration.md`, `docs/forms/examples.upload.md`, `api/users/users.md` und `docs/styles.md` erweitert.
- Developer: Runtime abgeleitet in `scripts/x_api.class.js`, Users-Templates, `styles/forms.css` und deutschen Translation-Keys.
- QA: `php compiler/report_form_components.php`, `php compiler/report_form_flows.php`, `php compiler/report_api_contracts.php`, `php compiler/check_frontend_boundary.php`, JS-Syntaxchecks, Compiler-Schritte und `php compiler/release_gate.php` sind grün.
- QA-Fund/Fix: Upload-`maxFiles`-Fehler wurden zunächst global als `upload` gemappt; Fix ordnet sie nun feldgenau nach Upload-Fieldname zu, damit Inline-Error und Summary konsistent funktionieren.
- Manager: Task 31 ist erledigt; nächster P1-Task ist Task 32 `external api integration blueprint`.

## milestone 2026-05-05: task 32 external api integration blueprint complete

- Developer: `docs/x_api.md` definiert das MD-first Schema für credentialed external API integrations inklusive Service, Backend-Proxy-Endpoint, required secret paths, Rate-Limits, Request-/Response-Mapping, Sandbox und Testability.
- Developer: `docs/secrets.md` und `_secrets.example.json` führen wertfreie `proxy_endpoints`, `rate_limits` und `failure_strategy` für `example_api`; echte Werte bleiben environment-local in `_secrets.json`.
- Developer: `docs/sandbox.md` beschreibt externe API Proxy-Mocks gegen Xtreme6-Backend-Endpunkte statt gegen fremde Upstream-URLs.
- Developer: `compiler/report_secret_usage.php` reportet Proxy-Endpunkte, Rate-Limit-Hinweise und Failure-Strategie ohne Secret-Werte auszugeben.
- QA: `php compiler/report_secret_usage.php`, `php compiler/check_secret_leaks.php`, `php compiler/check_frontend_boundary.php` und `php compiler/report_sandbox_coverage.php` sind grün.
- QA-Fund/Fix: Ein erster Runtime-Ausbau in `x/x_functions.php` wäre updateanfällig gewesen; die Erweiterung wurde in den non-`x_` Compiler-Report verlagert, sodass x-Core unverändert bleibt.
- Manager: Task 32 ist erledigt; nächster P2-Task ist Task 33 `route-level ui composition features`.

## milestone 2026-05-05: task 33 route-level ui composition features complete

- Developer: `docs/routes.md` enthält route-level UI-Konfiguration für Header, Footer, Layout-Variante, Sidebar-Gruppe, Navigation, Breadcrumb-Hierarchie und Slideshow-Metadaten.
- Developer: `docs/ui_primitives.md` beschreibt die erweiterte MD-API für route-level UI-Komposition und verweist auf `docs/routes.md` als Source-of-Truth.
- Developer: `templates/header.js`, `templates/sidebar.js`, `templates/breadcrumb.js` und `templates/slideshow.js` nutzen dynamische Items/Params statt hartcodierter Linklisten; `XFramework.getRouteDefinitions()` und `getUiNavigationConfig()` spiegeln die Route-MD-Konfiguration in der Runtime.
- Developer: `compiler/report_ui_primitives.php` validiert Route-UI-Konfiguration, Navigation-/Sidebar-Routen, Slideshow-Target-Routen und i18n-Keys gegen deklarierte Routen und Translations.
- QA: `php compiler/report_ui_primitives.php`, `node --check scripts/x_framework.class.js`, `php compiler/compile_scripts.php`, `php compiler/compile_production.php`, `node --check dist/scripts--prod.js` und `node --check dist/app.js` sind grün.
- QA-Fund/Fix: Der erste UI-Report-Parser wertete `ui_navigation`-Items fälschlich als Route-Blöcke; Fix begrenzt die Auswertung strikt auf den `routes:`-Block. Zusätzlich wurde ein Runtime-Bug gefixt, bei dem deaktivierte Sidebars nach Routenwechsel hängen bleiben konnten.
- Manager: Task 33 ist erledigt; nächster P2-Task ist Task 34 `md traceability dashboard/report`.

## milestone 2026-05-05: task 34 md traceability dashboard/report complete

- Developer: `compiler/report_traceability_dashboard.php` erstellt einen domänenübergreifenden Manager-Report für Objects, Models, API, Workflows, Routes, Forms, UI-Primitives, Secrets und Sandbox.
- Developer: Der Report zeigt pro Feature Markdown-Quellen, Runtime-Artefakte, zugehörige QA-Kommandos und Status (`specified`, `generated`, `implemented`, `tested`, `release-ready`) und schreibt zusätzlich `dist/traceability_dashboard.json`.
- Developer: `docs/md_first.md` und `docs/release_qa.md` dokumentieren den Traceability-Dashboard-Workflow; `compiler/release_gate.php` führt den Report als blockierenden Gate-Schritt aus.
- QA: `php compiler/report_traceability_dashboard.php` und `php compiler/check_secret_leaks.php` sind grün; der Report zeigt 18 release-ready Features.
- QA-Fund/Fix: Die erste Route-Auswertung zählte `ui_navigation`-Routen doppelt; Fix begrenzt die Erkennung auf den `routes:`-Block und dedupliziert Routen. Eine zu breite Secret-Leak-Ausnahme für `traceability_dashboard.json` wurde entfernt.
- Manager: Task 34 ist erledigt; nächster P2-Task ist Task 35 `framework final qa playbooks`.

## milestone 2026-05-05: task 35.1 domain feature playbook complete

- Developer: `docs/release_qa.md` enthält jetzt das Playbook `new domain feature flow` für neue first-party Domain-Features von Scope-/Reuse-Entscheidung über Object-Pair, Model, API, Workflow, Route, Form und Translations bis zu Runtime-Ableitung und Release-QA.
- QA: `php compiler/check_md_first.php`, `php compiler/report_ai_generation.php` und `php compiler/release_gate.php` sind grün; das Release-Gate lief mit 21/21 bestandenen Checks.
- QA-Fund/Fix: Die erste Playbook-Formulierung mit `Workflow:` wurde vom MD-first Workflow-Referenzparser als konkreter Workflow-Name interpretiert; die Zeile wurde parser-sicher zu `Workflow markdown:` umformuliert.
- Manager: Task 35.1 ist erledigt; nächster offener P2-Task ist Task 35.2 `credentialed external API feature playbook`.

## milestone 2026-05-05: task 35.2 credentialed external api playbook complete

- Developer: `docs/release_qa.md` enthält jetzt das Playbook `credentialed external api feature` für private externe API-Integrationen mit MD-first API-Vertrag, wertfreier Secret-Struktur, Backend-Proxy, FE-`XApi`-Boundary, Sandbox-Mocks und Leak-Checks.
- QA: `php compiler/check_md_first.php`, `php compiler/report_secret_usage.php`, `php compiler/check_secret_leaks.php`, `php compiler/report_sandbox_coverage.php`, `php compiler/report_api_contracts.php`, `php compiler/check_frontend_boundary.php`, `php compiler/report_ai_generation.php` und `php compiler/release_gate.php` sind grün; das Release-Gate lief mit 21/21 bestandenen Checks.
- QA-Fund/Fix: Die erste gezielte QA-Liste enthielt zwar Secret-/Sandbox-/Boundary-Checks, aber nicht explizit `php compiler/check_md_first.php`; der MD-first Check wurde als erster Zielcheck ergänzt.
- Manager: Task 35.2 ist erledigt; nächster offener P2-Task ist Task 35.3 `UI-Feature playbook`.

## milestone 2026-05-05: task 35.3 ui feature playbook complete

- Developer: `docs/release_qa.md` enthält jetzt das Playbook `ui feature flow` für route-level UI-Features mit Primitive-Reuse-Entscheidung, `docs/routes.md` UI-Konfiguration, Navigation/Breadcrumb/Sidebar/Slideshow-Regeln, i18n/a11y/SEO-Erwartungen und Runtime-Ableitung.
- QA: `php compiler/check_md_first.php`, `php compiler/report_ui_primitives.php`, `php compiler/check_frontend_boundary.php`, `php compiler/report_ai_generation.php`, `php compiler/compile_scripts.php`, `php compiler/compile_production.php` und `php compiler/release_gate.php` sind grün; das Release-Gate lief mit 21/21 bestandenen Checks.
- QA-Fund/Fix: Das Playbook wurde direkt mit expliziten `--no-pager` Diff-Regeln und gezielten UI-/Boundary-/Compile-Checks formuliert; keine weiteren Bugs offen.
- Manager: Task 35.3 ist erledigt; nächster offener P2-Task ist Task 35.4 `Form/Upload-Feature playbook`.

## milestone 2026-05-05: task 35.4 form/upload feature playbook complete

- Developer: `docs/release_qa.md` enthält jetzt das Playbook `form/upload feature flow` für FormAjax- und Upload-Features mit Scope-Entscheidung, `docs/forms/<form>.md`, API-Contract, Upload-Regeln, Error-Mapping, Sandbox-Mocks, Translations und Runtime-Ableitung über zentrale `XApi`-Form-Primitives.
- QA: `php compiler/check_md_first.php`, `php compiler/report_form_components.php`, `php compiler/report_form_flows.php`, `php compiler/report_api_contracts.php`, `php compiler/report_sandbox_coverage.php`, `php compiler/check_frontend_boundary.php`, `php compiler/report_ai_generation.php`, `php compiler/compile_scripts.php`, `php compiler/compile_production.php` und `php compiler/release_gate.php` sind grün; das Release-Gate lief mit 21/21 bestandenen Checks.
- QA-Fund/Fix: Die erste QA zeigte fehlende Task-/State-Evidence im AI-Generation-Report; `current_tasks.md` und `currentstate.md` wurden mit Manager-Evidence aktualisiert.
- Manager: Task 35.4 ist erledigt; nächster offener P2-Task ist Task 35.5 `Playbooks auf non-interactive QA-Kommandos und --no-pager Git-Nutzung prüfen`.
