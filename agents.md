# agents.md

## projektregeln

- dateien, ordner oder klassen mit dem präfix `x` sind framework-bezogen und **dürfen nicht verändert** werden.
- grund: `x*`-dateien können bei framework-updates überschrieben werden.
- eigene anpassungen sollen immer ohne `x`-präfix umgesetzt werden.

## objektmodell (singular/plural)

- **singular-objekte** repräsentieren eine einzelne instanz (z. b. `user`).
- **plural-objekte** repräsentieren sammlungen/listen (z. b. `users`).

## ai-driven objekt-workflow

für jedes neue objekt sind 5 pflichtdateien vorgesehen:

1. `<name>.class.md` (source of truth)
2. `<name>.class.php`
3. `<name>.class.js`
4. `<name>.test.php`
5. `<name>.test.js`

die `.md`-datei beschreibt verhalten und anforderungen. die weiteren vier dateien werden daraus durch ki erzeugt.
