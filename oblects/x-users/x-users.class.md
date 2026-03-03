# x-users.class.md

## rolle
plural-frameworkklasse `x-users` für listen und sammlungen.

## pflichtregeln
- runtime cache: `$_CACHE` (php) / `_CACHE` (js).
- cache-key aus `method + ':' + json_encode(normalized_params)`.
- listencache speichert ids; rückgabe löst ids wieder zu `x-user` auf.

## verhalten
- `list($params = [])` unterstützt filter und sortierung.
- param-normalisierung sorgt für stabile cache-keys.
- `clear_cache()` leert den plural-cache.
