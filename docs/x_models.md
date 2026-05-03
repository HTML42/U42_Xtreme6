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

## Feld-Konvention

Jedes Feld wird mit `### <fieldname>` beschrieben. Erlaubte/empfohlene Keys:

- `type`: `int`, `int|null`, `string`, `string|null`, `bool`, `float`, `json`, `text`
- `required`: `yes|no`
- `default`: fester Defaultwert oder `null`
- `unique`: `yes|no`
- `index`: `yes|no`
- `auto increment`: `yes|no`
- `format`: menschenlesbare Formatregel (z. B. `email`, `sha256`, `exactly 10 characters`)
- `min`: Minimalwert oder Mindestlänge
- `max`: Maximalwert oder Maximallänge
- `enum`: erlaubte Werte, kommasepariert
- `note`: fachliche Beschreibung

## Validierungs-Konvention

Der Abschnitt `## validation` beschreibt feldübergreifende und fachliche Regeln.

Regeln müssen so formuliert sein, dass daraus später Code und Tests generiert werden können:

- Feldpflichten (`username` darf nicht leer sein)
- Formatregeln (`email` muss valides E-Mail-Format haben)
- Sicherheitsregeln (`password` wird nur als Hash gespeichert)
- Uniqueness/Index-Regeln
- Cross-field-Regeln (z. B. `password` und `password2` müssen übereinstimmen)

## Beziehungs-Konvention

Der optionale Abschnitt `## relations` beschreibt Datenbankbeziehungen.

Empfohlenes Format:

```md
### user_profile

- type: 1:1
- local field: id
- foreign table: user_profiles
- foreign field: user_id
- on delete: cascade|restrict|set null
- on update: cascade|restrict
```

Erlaubte Beziehungstypen:

- `1:1`
- `1:n`
- `n:m`

Bei `n:m` muss zusätzlich eine Join-Tabelle beschrieben werden.

## Engine-Konsistenz

JSON- und MySQL-Engine müssen dieselben Modellregeln respektieren.

- JSON nutzt die Model-MDs für Tabellen-Bootstrap und spätere Validierung.
- MySQL nutzt die Model-MDs für `CREATE TABLE IF NOT EXISTS` und spätere Schema-/Validierungschecks.
- Model-Änderungen brauchen künftig eine Migration-/Schema-Update-Strategie; aktuell ist nur Create-if-missing aktiv.

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
