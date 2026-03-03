# Xtreme6 Dokumentation

Dieses Projekt ist als AI-driven Framework strukturiert.

## Verzeichnisstruktur

- `Oblects/` – Objekte (Singular/Plural), inklusive Framework-Basisobjekte mit `X`-Präfix.
- `API/` – Endpoints für Requests an `/API/...`.
- `Dist/` – Auslieferungsordner inkl. Request-Einstiegspunkt.
- `Compiler/` – Compiler-/Build-bezogene Komponenten.
- `Docs/` – Menschlich lesbare Dokumentation.
- `X/` – Framework-Bibliothek und interne, updatebare Basisdateien.
- `SCSS/` – Styling-Grundlagen.

## Wichtige Regel zu `X*`

Dateien/Klassen mit `X` am Anfang sind Framework-Dateien und sollen nicht direkt angepasst werden.
Eigene Erweiterungen bitte immer in nicht-`X`-Dateien erstellen.
