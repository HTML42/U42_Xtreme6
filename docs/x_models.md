# x_models.md

## Zweck

`models/` ist die zentrale, AI-driven Quelle für Datenbank-Modelle in Xtreme6.

- Die Datenbankstruktur (Schema)
- Feldvalidierung
- Feldabhängigkeiten/Relationen

werden hier in Markdown beschrieben.

## Grundregeln

1. **Jede Tabelle braucht zwingend ein Model** in `models/*.md`.
2. **Jede Row hat immer eine `id`.**
3. **Jede Row hat immer diese Zeitfelder (Unix-Timestamp in Sekunden):**
   - `insert_date`
   - `update_date`
   - `delete_date`
4. Modell-Dateinamen sind immer **lowercase** und entsprechen dem Tabellennamen (Plural), z. B. `users.md`.
5. Modelle sind die Source-of-Truth für Felder, Typen, Defaults, Constraints und Validierung.

## AI-Workflow

Wenn eine neue Tabelle benötigt wird:

1. Neue Modell-Datei in `models/` erstellen (z. B. `models/users.md`).
2. Felder inklusive Typ/Regeln dokumentieren.
3. Besondere Feldregeln (z. B. Länge, Zeichensatz, uniqueness) eindeutig festhalten.
4. Erst danach DB-Engine/Code-Implementierung erweitern.

## Engine-Bootstrap aus Models

Beim Initialisieren von `XDB` werden Models aus `models/*.md` geladen und an die aktive Engine übergeben.

- **JSON-Engine**
  - legt `_db/`, `_db/cache/`, `_db/tables/` und `_db/meta.json` an (falls fehlend)
  - erstellt pro Model-Tabelle eine JSON-Datei in `_db/tables/` (falls fehlend)
  - pflegt in `meta.json` pro Tabelle den `current_index`

- **MySQL-Engine**
  - nutzt `_db/cache/` als globalen Cache-Ordner
  - versucht beim Start die DB-Verbindung aufzubauen
  - wirft bei Verbindungsfehlern einen klaren Fehler
  - vergleicht vorhandene Tabellen mit den Models und erstellt fehlende Tabellen automatisch

## Beispiel: users

Das Modell `models/users.md` definiert die Basis-Tabelle für Accounts/Benutzer.
