# xtreme6 dokumentation

## verzeichnisstruktur

- `objects/` – objekte (singular/plural), aktuell `x-user` und `x-users`.
- `api/` – endpoints.
- `dist/` – auslieferung.
- `compiler/` – compiler-/build-komponenten.
- `docs/` – menschenlesbare dokumentation.
- `x/` – framework-bibliothek.
- `scss/` – styling.

## pflichtregeln

- kein `declare(strict_types=1);`
- keine `final class`
- php-konstruktor immer: `public function __construct(int $id = 0)`
- standardfelder: `insert_date`, `update_date`, `delete_date` (unix sekunden)
- js class-dateien ohne imports/requires/exports
