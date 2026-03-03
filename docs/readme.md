# xtreme6 dokumentation

dieses projekt ist als ai-driven framework strukturiert.

## verzeichnisstruktur

- `oblects/` – objekte (singular/plural), inklusive framework-basisobjekte mit `x`-präfix.
- `api/` – endpoints für requests an `/api/...`.
- `dist/` – auslieferungsordner inkl. request-einstiegspunkt.
- `compiler/` – compiler-/build-bezogene komponenten.
- `docs/` – menschlich lesbare dokumentation.
- `x/` – framework-bibliothek und interne, updatebare basisdateien.
- `scss/` – styling-grundlagen.

## wichtige regel zu `x*`

dateien/klassen mit `x` am anfang sind framework-dateien und sollen nicht direkt angepasst werden.
eigene erweiterungen bitte immer in nicht-`x`-dateien erstellen.
