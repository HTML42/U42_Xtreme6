# framework.md

## zielbild

xtreme6 ist ein ai-driven framework. die struktur trennt klar zwischen:

- framework-kern (`x*`-dateien/ordner, updatebar),
- projektspezifischen erweiterungen (ohne `x`-präfix),
- objektdefinitionen als source of truth für ki-generierung.

## verzeichnis-mechanik

- `oblects/`: domain-objekte nach singular/plural-regel.
- `api/`: endpoint-dateien für alle requests auf `/api/...`.
- `dist/`: auslieferung und request-routing über `.htaccess`.
- `compiler/`: build/compiler-komponenten.
- `docs/`: menschenlesbare dokumentation.
- `x/`: framework-bibliothek (nicht direkt anpassen).
- `scss/`: stylesheets.

## objekt-mechanik (ai workflow)

für jedes objekt gilt ein 5-dateien-vertrag:

1. `<name>.class.md` — source of truth mit fachlogik, regeln, erwartungen.
2. `<name>.class.php` — php-implementierung.
3. `<name>.class.js` — javascript-implementierung.
4. `<name>.test.php` — php-tests für fachverhalten.
5. `<name>.test.js` — javascript-tests für fachverhalten.

ablauf:

1. zuerst die `.md` definieren.
2. danach klassen in php/js erzeugen.
3. anschließend tests in php/js erzeugen.
4. tests laufen lassen; bei abweichung wird die `.md` nachgeschärft.

## singular/plural-regel

- singular (z. b. `user`) beschreibt genau eine instanz.
- plural (z. b. `users`) beschreibt sammlungen, listen und bulk-operationen.

## update-regel für framework-dateien

alles mit `x`-präfix gilt als framework-core und kann bei updates überschrieben werden.
projekteigene anpassungen müssen daher immer in nicht-`x`-pfaden erfolgen.

## request-routing in dist

`dist/.htaccess` leitet alle anfragen, die keine bilddateien sind, an `dist/execute.php` weiter.
bilddateien werden direkt ausgeliefert.
