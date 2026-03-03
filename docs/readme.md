# xtreme6 dokumentation

dieses projekt ist als ai-driven framework strukturiert.

## verzeichnisstruktur

- `oblects/` – objekte (singular/plural), aktuell über `x-user` und `x-users`.
- `api/` – endpoints für requests an `/api/...`.
- `dist/` – auslieferungsordner inkl. request-einstiegspunkt.
- `compiler/` – compiler-/build-bezogene komponenten.
- `docs/` – menschlich lesbare dokumentation.
- `x/` – framework-bibliothek und interne, updatebare basisdateien.
- `scss/` – styling-grundlagen.

## js compile-regel

in class-js-dateien keine exports verwenden. die klassen werden für den späteren compiler global registriert.
