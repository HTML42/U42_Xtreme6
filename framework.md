# framework.md

## framework-konzept

xtreme webframework 6 ist md-driven. pro objekt ist die `.class.md` die source-of-truth, daraus entstehen php/js klasse plus tests.

## verzeichnisrollen

- `oblects/` — objektdefinitionen (singular/plural).
- `api/` — endpoint-dateien für anfragen an `/api/...`.
- `dist/` — auslieferung mit `.htaccess` und `execute.php` als request-einstieg.
- `compiler/` — zukünftige build-/compile-logik.
- `docs/` — menschenlesbare dokumentation.
- `x/` — framework-bibliothek.
- `scss/` — stylesheets.

## objektstandard

die objektordner sind:
- `oblects/x-user/`
- `oblects/x-users/`

`oblects/user/` und `oblects/users/` werden nicht mehr verwendet.

## singular-regel (`x-user`)

- dateiname: `x-user.class.php` und `x-user.class.js`.
- konstruktor startet mit `$id` als erstem parameter.
- pflichtmethoden in php **und** js:
  - `load($identification = null)`
  - `load_by_id($id)`
  - `load_by_name($name)`
- pflicht-cache in php/js:
  - php: `static $_CACHE = []`
  - js: `static _CACHE = {}`
- `load()` routing:
  - numeric → `load_by_id()`
  - string → `load_by_name()`
  - sonst → neue leere instanz

## plural-regel (`x-users`)

- dateiname: `x-users.class.php` und `x-users.class.js`.
- pflicht-cache in php/js:
  - php: `static $_CACHE = []`
  - js: `static _CACHE = {}`
- list/query-cache key: `method + ':' + json_encode(normalized_params)`.
- params vor cache-key immer normalisieren (sortierte keys).
- empfohlen: ids im plural-cache speichern, rückgabe über singular-loader auflösen.

## 5-dateien-vertrag pro objekt

pro objekt sind diese dateien verpflichtend:

1. `<name>.class.md`
2. `<name>.class.php`
3. `<name>.class.js`
4. `<name>.test.php`
5. `<name>.test.js`

## javascript-regel für compiler

- im gesamten projekt kein `import` in js-dateien.
- in class-dateien keine exports verwenden (`module.exports`/`export` verboten).
- klassen werden global registriert (z. b. `globalThis.XUser`).
- testdateien liegen neben den klassen und prüfen gegen die globalen klassen.
