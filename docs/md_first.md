# md-first governance

## purpose

Xtreme6 ist ein KI-driven Framework. Markdown-Dateien sind die verbindliche Source-of-Truth für Objekte, Prozesse, Workflows, Datenmodelle und API-Verträge.

Runtime-Dateien (`*.php`, `*.js`, Tests, Bundles) sind abgeleitete Artefakte und dürfen nicht als primäre Spezifikation behandelt werden.

## mandatory rule

Jede neue oder geänderte Funktion muss zuerst in einer passenden Markdown-Datei beschrieben werden.

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

### workflows/processes

- Quelle: projektspezifische Markdown-Dateien, bevorzugt unter `docs/workflows/`
- Inhalt:
  - Ziel des Workflows
  - Inputs
  - Prozessschritte
  - API-/Objekt-Aufrufe
  - Nebenwirkungen
  - Success-/Failure-Pfade

## required api markdown sections

Jede API-Dimension muss mindestens enthalten:

- endpoints
- methods
- request body/query params
- success response
- error responses
- auth requirements
- validation rules

## required object markdown sections

Jedes Object-MD muss mindestens enthalten:

- role/purpose
- properties/fields
- public methods
- validation rules
- persistence/API interactions
- success/failure contracts
- test expectations

## build gate expectation

Ein Build-/QA-Check muss fehlschlagen, wenn:

- ein Object-Runtime-Artefakt ohne `.class.md` existiert
- eine API-Dimension ohne `<dimension>.md` existiert
- eine Model-Tabelle ohne `models/<table>.md` verwendet wird
- ein Controller ohne `.controller.md` existiert
