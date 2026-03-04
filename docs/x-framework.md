# X-Framework.md

## framework-konzept

Xtreme WebFramework 6 ist md-driven. Pro Objekt ist die `.class.md` die Source of Truth.

## verzeichnisrollen

- `objects/` — Objektdefinitionen (singular/plural).
- `api/` — Endpoint-Dateien für Anfragen an `/api/...`.
- `dist/` — Auslieferung und Compiler-Ausgaben.
- `compiler/` — Build-/Compile-Logik.
- `docs/` — menschenlesbare Dokumentation.
- `x/` — framework-spezifische Bibliothek (`x_*` Dateien).
- `styles/` — CSS-Dateien (kein SCSS).

## x-datei-regel

- Dateien mit Präfix `x` sind framework-spezifische Dateien.
- Diese Dateien bilden den Framework-Kern und folgen den festen X-Regeln.
- Projektanpassungen sollen die X-Regeln respektieren und den Workflow in den Docs einhalten.

## php-klassenregeln

- niemals `declare(strict_types=1);`
- niemals `final class`
- konstruktor immer: `public function __construct(int $id = 0)`

## js-klassenregeln

- kein `import`, kein `require`, keine exports in class-dateien
