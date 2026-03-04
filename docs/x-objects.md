# X-Objects.md

## objektaufbau

Jedes Objekt hat eine zentrale MD-Datei als Quelle:

1. `<name>.class.md` (Source of Truth)
2. `<name>.class.php`
3. `<name>.class.js`
4. `<name>.test.php`
5. `<name>.test.js`

## verpflichtender workflow

- An Objektlogik wird **grundsätzlich nur in der `.class.md` gearbeitet**.
- Keine direkte fachliche Pflege in den generierten `.php`, `.js` oder Testdateien.
- Nach Änderungen an der MD-Datei werden die übrigen Dateien durch KI/Compiler neu erzeugt.
- Dieser Workflow ist verbindlich für alle Objektordner unter `objects/`.
