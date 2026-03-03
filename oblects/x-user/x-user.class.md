# x-user.class.md

## rolle
singular-frameworkklasse `x-user` für genau eine user-instanz.

## pflichtregeln
- konstruktor startet mit `$id` als erstem parameter.
- `load($identification = null)` ist der zentrale einstieg.
- `load_by_id($id)` und `load_by_name($name)` sind verpflichtend.
- runtime cache: `$_CACHE` (php) / `_CACHE` (js).

## datenmodell
- `id` (int > 0)
- `name` (string, trim, min 2)
- `email` (string, trim, enthält `@`)
- `active` (bool)

## verhalten
- `load()` entscheidet anhand typ: numeric => `load_by_id`, string => `load_by_name`, sonst `new self`.
- cache wird zuerst geprüft und bei treffern wiederverwendet.
- `update()` und `toarray()` bleiben verfügbar.
