# security & auth specification (task 3)

## scope

Diese Spezifikation definiert die Basis für:

- Session-/Token-Layer
- Bruteforce-/Rate-Limit-Schutz
- Passwort-Policy
- E-Mail-Verifikation

Die Umsetzung soll API- und Objekt-Layer konsistent erweitern.

## 1) session/token layer

## decision

- Standard: **Session-Cookie** (HttpOnly, SameSite=Lax, Secure in HTTPS)
- Optional später: Bearer-Token/JWT als zweiter Modus

## flow

1. `POST /api/users/login` prüft Credentials.
2. Bei Erfolg wird Session regeneriert (`session_regenerate_id(true)`).
3. Session enthält nur Minimaldaten:
   - `user_id`
   - `login_time`
   - `last_seen`
4. Folgeendpunkte prüfen Session zentral (Middleware-Pattern über API-Bootstrap).

## logout

- `POST /api/users/logout`
  - Session-Daten löschen
  - Session-Cookie invalidieren

## 2) brute-force / rate limit

## key strategy

- Kombi-Key: `ip + username`
- Zusatz-Key: nur `ip` für globales Flooding

## baseline limits

- login attempts pro `ip+username`: `5` Versuche / `15 min`
- login attempts pro `ip`: `60` Versuche / `15 min`

## behavior

- bei Überschreitung:
  - `success=false`
  - `status=429`
  - `errors.rate_limit = "too many attempts"`
- erfolgreiche Anmeldung setzt den `ip+username`-Counter zurück.

## storage

- MVP: JSON- oder DB-Tabelle `auth_rate_limits`
- Felder:
  - `id`
  - `key`
  - `attempts`
  - `window_start`
  - `insert_date`
  - `update_date`

## 3) password policy

## registration requirements

- minimum length: `10`
- mindestens:
  - 1 Kleinbuchstabe
  - 1 Großbuchstabe
  - 1 Zahl
  - 1 Sonderzeichen

## api behavior

- bei Verstoß `422`
- `errors.password` enthält sprechende Policy-Meldung

## 4) e-mail verification

## model additions

- `users.validate_date` bleibt Verifikations-Timestamp
- zusätzlicher Token-Store (z. B. `user_verifications`):
  - `id`
  - `user_id`
  - `token`
  - `expires_date`
  - `used_date`
  - `insert_date`

## flow

1. Registration erzeugt Verifikationstoken (random + hash).
2. Versandlink: `#!/users/verify?token=...` (oder API-first).
3. API-Endpunkt validiert Token und setzt `users.validate_date`.
4. Token wird als verwendet markiert (`used_date`).

## status codes (contract)

- `200` success
- `401` invalid credentials
- `422` validation error
- `429` rate limit
