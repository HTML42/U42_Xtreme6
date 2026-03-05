# Project.md

## projektübersicht

U42 Xtreme6 ist ein AI-gestütztes, md-driven Framework mit klaren Build- und Objektregeln.

## verzeichnisstruktur

- `objects/` – objektdefinitionen und source-of-truth pro objekt (`.class.md`).
- `api/` – endpoint-dateien.
- `dist/` – kompilierte ausgabe.
- `compiler/` – compiler-skripte.
- `docs/` – dokumentation und workflow-regeln.
- `x/` – framework-spezifische kernbibliothek (`x_*`).
- `styles/` – css-basierte styles.

## compiler-output (dev/prod)

`compiler/compile_objects.php` erzeugt pro zieltyp immer drei dateien in `dist/`:

- `--dev` bundle: lädt die originaldateien per `require_once` (php) oder `import` (js).
- `--prod` bundle: enthält den komplett vorkompilierten inhalt aller dateien.
- legacy-datei ohne suffix (z. b. `objects.php`): entspricht weiterhin dem `--prod` bundle für kompatibilität.

aktuelle bundle-paare:

- `objects--dev.php` / `objects--prod.php`
- `objects--dev.js` / `objects--prod.js`
- `objects.test--dev.php` / `objects.test--prod.php`
- `objects.test--dev.js` / `objects.test--prod.js`
