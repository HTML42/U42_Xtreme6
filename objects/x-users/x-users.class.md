# x-users.class.md

## rolle
plural-frameworkklasse `x-users` für listen.

## php-regeln
- niemals `declare(strict_types=1);`
- niemals `final class`
- konstruktor-signatur immer: `public function __construct(int $id = 0)`
- runtime-cache: `$_CACHE`
- cache-key direkt via `json_encode(...)`

## js-regeln
- kein `import` und keine exports
- runtime-cache: `_CACHE`
- `load(id)` läuft async mit `await` für spätere api-listen

## standard-datenfelder (pflicht)
- `insert_date` (unix timestamp sekunden)
- `update_date` (unix timestamp sekunden)
- `delete_date` (unix timestamp sekunden)
