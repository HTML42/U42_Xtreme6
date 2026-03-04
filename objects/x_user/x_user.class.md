# x-user.class.md

## rolle
singular-frameworkklasse `x-user`.

## php-regeln
- niemals `declare(strict_types=1);`
- niemals `final class`
- php-dateien starten immer mit `<?php` und enden immer mit `?>`
- keine `include`, `include_once`, `require` oder `require_once` in php-klassen
- konstruktor-signatur immer: `public function __construct(int $id = 0)`
- pflichtmethoden:
  - `load($identification = null)`
  - `load_by_id($id)`
  - `load_by_name($name)`
- runtime-cache: `$_CACHE`
- cache-key kann direkt mit `json_encode(...)` gebaut werden

## js-regeln
- kein `import` und keine exports
- runtime-cache: `_CACHE`
- nur `load(id)` als async funktion mit `await` für spätere api-anfragen

## standard-datenfelder (pflicht)
- `id`
- `insert_date` (unix timestamp sekunden)
- `update_date` (unix timestamp sekunden)
- `delete_date` (unix timestamp sekunden)

## ausgeschlossen
- kein `update()`
- kein `toarray()`
- keine `validate()` methode
- kein statisches seed-array mit beispieldaten
