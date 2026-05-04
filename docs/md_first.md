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

### forms/formajax/uploads

- Quelle: `docs/forms/<form>.md`, Form-/Workflow-/Controller-Markdown passend zum Feature, plus API-Contract in `api/<dimension>/<dimension>.md`
- Abgeleitet/geführt:
  - Formular-Markup/Templates
  - `XApi.submitForm(...)` Nutzung
  - Upload-Regeln und Progress-Verhalten
  - Inline-Errors am Input und Error-Summary vor Submit
  - Translation-Keys für Labels, Help-Texte und Fehler
- Report: `php compiler/report_form_components.php` prüft Form-MDs, Komponenten, Template-Mapping und Translation-Keys.

### frontend/backend boundary

- Quelle: API-Markdown und Controller-Markdown
- Regel:
  - Frontend erreicht Backend ausschließlich via dokumentierte API-Endpunkte und `XApi`.
  - Keine direkten DB-/PHP-/Secret-Abhängigkeiten in `scripts/` oder `templates/`.

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
  - AI generation workflow checkpoints and runtime-only risk reporting

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
- generator schema
- properties/fields
- public methods
- validation rules
- persistence/API interactions
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
- ein Object-MD nicht alle Pflichtsektionen für Generator-Schema, Properties, Methoden, Validierung, Persistence und Tests enthält
- ein Objekt ohne Singular/Plural-Gegenstück existiert
- eine API-Dimension ohne `<dimension>.md` existiert
- eine API-Dimension nicht alle Pflichtsektionen für Versionierung, Request/Response, Errors, Auth, Validation und Testability enthält
- eine Model-Tabelle ohne `models/<table>.md` verwendet wird
- ein Controller ohne `.controller.md` existiert
- ein `templates/view.<controller>.<view>.js` ohne Route in `docs/routes.md` existiert
- eine deklarierte Route kein passendes View-Template hat
- ein `workflow: <name>` Verweis keine Datei `docs/workflows/<name>.md` hat
- ein Workflow-MD nicht alle Pflichtsektionen enthält
- ein verpflichtendes Governance-Dokument fehlt
- ein Frontend-Artefakt direkte Backend-/DB-/Secret-Zugriffe enthält statt `XApi` zu verwenden
- ein Formular keine dokumentierte FormAjax-/API-Quelle für Submit, Uploads und Error-Mapping hat
- ein Form-MD Pflichtsektionen, unterstützte Komponenten, Template-Mapping oder benötigte Translation-Keys vermissen lässt
- ein AI-generierter Task Runtime-/Dist-Artefakte ändert, ohne dass eine passende Markdown-Quelle, QA-Report und Manager-Abnahme im Diff sichtbar sind

## ai generation workflow

Standardablauf für AI-/Developer-Tasks:

1. `agents.md` lesen und passende Fachdocs aus der Routing-Tabelle bestimmen.
2. Markdown-Source-of-Truth ändern oder bestätigen, bevor Runtime/Compiler/Dist-Artefakte geändert werden.
3. Runtime/Compiler ableiten und nur danach `dist/*` neu bauen.
4. QA-Reports aus `docs/release_qa.md` non-interaktiv ausführen.
5. `php compiler/report_ai_generation.php` ausführen und Runtime-only Risiken prüfen.
6. `current_tasks.md` und `currentstate.md` erst nach grüner QA aktualisieren.
7. Review mit `git --no-pager diff --stat` und bei Bedarf `git --no-pager diff -- <path>` abschließen.

Checkpoint-Regeln:

- vor Generatorläufen: `git --no-pager diff --stat`, relevante MD-Quelle identifiziert.
- nach Generatorläufen: `php compiler/report_ai_generation.php`, generierte Dateien geprüft.
- vor Release-QA: alle notwendigen Compiler-/Report-Kommandos aus `docs/release_qa.md`.
- vor Framework-Update: keine uncommitted Runtime-only Änderungen ohne MD-Quelle.
