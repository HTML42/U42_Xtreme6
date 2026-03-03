# AGENTS.md

## Projektregeln

- Dateien, Ordner oder Klassen mit dem Präfix `X` sind framework-bezogen und **dürfen nicht verändert** werden.
- Grund: `X*`-Dateien können bei Framework-Updates überschrieben werden.
- Eigene Anpassungen sollen immer ohne `X`-Präfix umgesetzt werden.

## Objektmodell (Singular/Plural)

- **Singular-Objekte** repräsentieren eine einzelne Instanz (z. B. `User`).
- **Plural-Objekte** repräsentieren Sammlungen/Listen (z. B. `Users`).

## AI-Driven Objekt-Workflow

Für jedes neue Objekt sind 5 Pflichtdateien vorgesehen:

1. `<name>.class.md` (Source of Truth)
2. `<name>.class.php`
3. `<name>.class.js`
4. `<name>.test.php`
5. `<name>.test.js`

Die `.md`-Datei beschreibt Verhalten und Anforderungen. Die weiteren vier Dateien werden daraus durch KI erzeugt.
