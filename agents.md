# agents.md

## projektregeln

- dateien, ordner oder klassen mit dem präfix `x` sind framework-spezifisch.
- `x*`-dateien gehören zum framework-kern und können bei framework-updates angepasst oder ersetzt werden.
- projektcode soll die x-regeln aus der dokumentation respektieren.
- datei- und ordnernamen werden immer in kleinbuchstaben geführt.

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
änderungen am verhalten erfolgen primär in der `.md`-datei.
