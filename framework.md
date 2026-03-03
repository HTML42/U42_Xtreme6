# framework.md

## framework-konzept

xtreme webframework 6 ist md-driven. pro objekt ist die `.class.md` die source-of-truth.

## verzeichnisrollen

- `objects/` — objektdefinitionen (singular/plural).
- `api/` — endpoint-dateien für anfragen an `/api/...`.
- `dist/` — auslieferung mit `.htaccess` und `execute.php`.
- `compiler/` — build-/compile-logik.
- `docs/` — menschenlesbare dokumentation.
- `x/` — framework-bibliothek.
- `scss/` — stylesheets.

## objektstandard

aktive objektordner:
- `objects/x-user/`
- `objects/x-users/`

## php-klassenregeln

- niemals `declare(strict_types=1);`
- niemals `final class`
- konstruktor immer: `public function __construct(int $id = 0)`
- singular pflichtmethoden:
  - `load($identification = null)`
  - `load_by_id($id)`
  - `load_by_name($name)`
- runtime cache: `$_CACHE`
- cache-keys nativ per `json_encode(...)`
- keine `update()`, keine `toarray()`, keine `validate()`

## js-klassenregeln

- kein `import`, kein `require`, keine exports in class-dateien
- runtime cache: `_CACHE`
- singular lädt über `async load(id)` mit `await`
- plural lädt listen über `async load(id)` mit `await`

## standard-zeitstempel-felder (pflicht)

jedes datenbankobjekt muss haben:
- `insert_date` (unix timestamp in sekunden)
- `update_date` (unix timestamp in sekunden)
- `delete_date` (unix timestamp in sekunden)

## testdateien

testdateien sind aktuell platzhalter ohne imports/requires.
