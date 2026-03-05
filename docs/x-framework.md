# x-framework.md

## framework-konzept

xtreme webframework 6 ist md-driven. pro objekt ist die `.class.md` die source of truth.

## verzeichnisrollen

- `objects/` — objektdefinitionen (singular/plural).
- `api/` — endpoint-dateien für anfragen an `/api/...`.
- `scripts/` — javascript-klassen und projektlogik.
- `dist/` — auslieferung und compiler-ausgaben.
- `compiler/` — build-/compile-logik.
- `docs/` — menschenlesbare dokumentation.
- `x/` — framework-spezifische bibliothek (`x_*` dateien).
- `styles/` — css-dateien (kein scss).

## x-datei-regel

- dateien mit präfix `x` sind framework-spezifische dateien.
- diese dateien bilden den framework-kern und folgen den festen x-regeln.
- projektanpassungen sollen die x-regeln respektieren und den workflow in den docs einhalten.

## datei- und ordnerkonvention

- datei- und ordnernamen werden immer in kleinbuchstaben geführt.

## php-klassenregeln

- niemals `declare(strict_types=1);`
- niemals `final class`
- konstruktor immer: `public function __construct(int $id = 0)`

## js-klassenregeln

- kein `import`, kein `require`, keine exports in class-dateien
