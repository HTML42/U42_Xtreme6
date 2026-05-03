# md-first governance

## purpose

Markdown-Dateien sind die verbindliche Source-of-Truth für Objekte, Prozesse, Workflows, Datenmodelle und API-Verträge.

Runtime-Dateien (`*.php`, `*.js`, Tests, Bundles) sind abgeleitete Artefakte und dürfen nicht als primäre Spezifikation behandelt werden.

Für die Auswahl der passenden Dokumentation gilt zuerst `agents.md` → **task documentation routing**. Dieses Dokument beschreibt danach nur die Source-of-Truth-Zuordnung und Build-Gates.

## mandatory rule

Jede neue oder geänderte Funktion muss zuerst in einer passenden Markdown-Datei beschrieben werden.

Dokumentation soll nicht mehrfach ausgeschrieben werden: Wenn eine Regel bereits in einer kanonischen Datei steht, wird sie verlinkt statt kopiert.

## source mapping

### objects

- Quelle: `objects/<object>/<object>.class.md`
- Abgeleitet:
  - `objects/<object>/<object>.class.php`
  - `objects/<object>/<object>.class.js`
  - `objects/<object>/<object>.test.php`
  - `objects/<object>/<object>.test.js`

### api dimensions

- Quelle: `api/<dimension>/<dimension>.md`
- Abgeleitet/geführt:
  - `api/<dimension>/<endpoint>.php`
  - Request/Response/Errors
  - Auth-/Validation-Regeln

### database models

- Quelle: `models/<table>.md`
- Abgeleitet/geführt:
  - DB-Felder
  - Typen, Defaults, Constraints
  - Validierung
  - Beziehungen
  - Engine-Schema für JSON/MySQL

### routes/controllers/templates

- Quelle: `docs/routes.md`
- zusätzliche Controller-Quelle: `scripts/controllers/<controller>.controller.md`
- Abgeleitet/geführt:
  - `scripts/controllers/<controller>.controller.js`
  - `templates/view.<controller>.<view>.js`
  - benötigte Translation-Keys

### project governance documents

- Quelle/Steuerung:
  - `docs/md_first.md`
  - `docs/routes.md`
  - `docs/ui_primitives.md`
  - `docs/release_qa.md`
- Geführt:
  - route-driven templates/controllers
  - ui primitive runtime/templates
  - release qa checks and task acceptance

### workflows/processes

- Quelle: projektspezifische Markdown-Dateien unter `docs/workflows/<workflow>.md`
- Naming: lowercase dot-separated workflow names, e.g. `users.registration.md`
- Inhalt:
  - Ziel des Workflows
  - Inputs
  - Prozessschritte
  - API-/Objekt-Aufrufe
  - Nebenwirkungen
  - Success-/Failure-Pfade
- Traceability: Workflow-MDs müssen die betroffenen API-Endpunkte, Objektmethoden und Frontend-Controller/Templates nennen.
- Report: `php compiler/report_workflow_traceability.php` gibt eine lesbare Prozess-zu-API/Object-Übersicht aus.

## required api markdown sections

Jede API-Dimension muss mindestens enthalten:

- contract version
- endpoints
- methods
- request body/query params
- success response
- error responses
- auth requirements
- validation rules
- testability

## required object markdown sections

Jedes Object-MD muss mindestens enthalten:

- role/purpose
- properties/fields
- public methods
- validation rules
- persistence/API interactions
- success/failure contracts
- test expectations

## required workflow markdown sections

Jedes Workflow-MD unter `docs/workflows/` muss mindestens enthalten:

- goal
- inputs
- steps
- api calls
- object calls
- side effects
- success path
- failure paths
- traceability

## build gate expectation

Ein Build-/QA-Check muss fehlschlagen, wenn:

- ein Object-Runtime-Artefakt ohne `.class.md` existiert
- eine API-Dimension ohne `<dimension>.md` existiert
- eine API-Dimension nicht alle Pflichtsektionen für Versionierung, Request/Response, Errors, Auth, Validation und Testability enthält
- eine Model-Tabelle ohne `models/<table>.md` verwendet wird
- ein Controller ohne `.controller.md` existiert
- ein `templates/view.<controller>.<view>.js` ohne Route in `docs/routes.md` existiert
- eine deklarierte Route kein passendes View-Template hat
- ein `workflow: <name>` Verweis keine Datei `docs/workflows/<name>.md` hat
- ein Workflow-MD nicht alle Pflichtsektionen enthält
- ein verpflichtendes Governance-Dokument fehlt
