# current tasks (xtreme6)

## ziel

Finalisierung des KI-driven Frameworks mit **MD-first Source-of-Truth**, klarer FE/BE-Trennung via API, standardisiertem AJAX/Form-Handling (inkl. Upload), robustem i18n/SEO sowie sicherem Secrets-/Sandbox-Betrieb.

## release-priorität (manager view)

- **P0 (blocker für "framework final")**: task 10, task 11, task 12, task 13, task 14
- **P1 (hoch)**: task 8, task 9, task 7
- **P2 (feature-integration/qa)**: task 4, task 5

## global definition of done (dod)

- [ ] Jede Runtime-Funktionalität ist auf eine MD-Spezifikation zurückführbar.
- [ ] FE/BE-Verträge sind via API dokumentiert, testbar und versionierbar.
- [ ] Alle Form-Flows laufen per AJAX, inkl. Datei-Upload, Inline-Error + Error-Summary.
- [ ] Secrets sind nicht im Frontend-Bundle/Repo-Leak enthalten.
- [ ] Sandbox/Mock-Modus ermöglicht End-to-End-Demos ohne Live-Backend.
- [ ] i18n unterstützt Sprachwechsel, Direkteinstieg und SEO-Head/alternate sauber.

## task 1: datenbankabstraktion stabilisieren

- [x] **subtask 1.1**: Select-Cache-Konfiguration dokumentieren (`DatabaseSelectCacheTtl` in `config.json`).
- [x] **subtask 1.2**: Cache-Hit/Miss Verhalten kurz testen (gleiche Queries, danach Schreiboperationen).
- [x] **subtask 1.3**: Invalidation-Szenarien für `insert/update/delete` auf `users` verifizieren.
- [x] **subtask 1.4**: JSON-/MySQL-Verhalten angleichen und dokumentieren.

## task 2: api-contract finalisieren

- [x] **subtask 2.1**: Users-Endpoints gegen Standard-Response-Contract prüfen.
- [x] **subtask 2.2**: API-MD (`api/users/users.md`) um Request/Response-Beispiele erweitern.
- [x] **subtask 2.3**: Fehlercodes konsistent machen (Validation/Auth/NotFound).

## task 3: sicherheit/auth grundlagen

- [x] **subtask 3.1**: Session- oder Token-Layer für Login entwerfen.
- [x] **subtask 3.2**: Basis-Bruteforce-Schutz (Rate-Limit pro IP/User) spezifizieren.
- [x] **subtask 3.3**: Passwort-Policy und E-Mail-Verifikation definieren.

## task 4: frontend-anbindung users-flow

- [ ] **subtask 4.1**: `UsersController.login` mit Formular-Submit + `XApi.request(...)` verbinden.
- [ ] **subtask 4.2**: `UsersController.registration` mit Formular-Submit + `XApi.request(...)` verbinden.
- [ ] **subtask 4.3**: UI-Feedback (loading/success/error) in Templates ergänzen.

## task 6: form-system auf ajax + datei-upload standardisieren

- [x] **subtask 6.1**: `scripts/x_api.class.js` erweitern für `FormData`/`multipart` (kein erzwungenes JSON bei Upload).
- [x] **subtask 6.2**: Einheitlichen `XApi.submitForm(formElement, options)` Helper spezifizieren/implementieren.
- [x] **subtask 6.3**: Fehlernormalisierung in `XApi` korrigieren (`errors` darf object oder array sein, nicht nur array).
- [x] **subtask 6.4**: Controller-Migration planen: alle Form-Flows auf AJAX submit inkl. Upload vorbereiten.

## task 7: updateprozess für x_-dateien verifizieren und härten

- [ ] **subtask 7.1**: Regel festschreiben: `x_`-Dateien werden bei Framework-Update immer plain überschrieben.
- [ ] **subtask 7.2**: `xtreme6_update.php` auf Vollständigkeit prüfen (rekursives Finden + Kopieren aller `x_`-Dateien).
- [ ] **subtask 7.3**: Risikoanalyse dokumentieren: lokale Änderungen in `x_` gehen verloren (gewollt) + Gegenmaßnahmen via non-`x_` Overrides.
- [ ] **subtask 7.4**: Optionalen Dry-Run/Report-Modus für Updateprozess spezifizieren.

## task 8: translation/i18n finalisierung (runtime + seo)

- [x] **subtask 8.1**: Sprachquellen vereinheitlichen (`XLanguage`/`XTranslation` aktuell DE/de gemischt) und saubere Normalisierung auf ein Format definieren.
- [x] **subtask 8.2**: Liste verfügbarer Sprachen zentral bereitstellen (z. B. `window.X6_CONFIG.AvailableLanguages`) und gegen vorhandene `translations/<lang>/` validieren.
- [x] **subtask 8.3**: Einfachen Sprachwechsel im Frontend implementieren (`XLanguage.setCurrentLanguage(...)` + Re-Render Header/View ohne Full-Reload).
- [x] **subtask 8.4**: Direkteinstieg je Sprache ermöglichen (URL-Schema festlegen, z. B. `?lang=en` oder `#!/en/...`, inkl. Prioritätsregeln URL > Storage > Config).
- [x] **subtask 8.5**: Sprachpräferenz persistent speichern (localStorage/cookie) und beim Bootstrapping wiederherstellen.
- [x] **subtask 8.6**: Fallback-Strategie finalisieren (fehlender Key in aktiver Sprache -> definierte Fallback-Sprache, Logging für fehlende Keys).
- [x] **subtask 8.7**: SEO-Head automatisch sprachspezifisch ausgeben (`<html lang>`, optional `og:locale`, `meta[name="language"]`).
- [x] **subtask 8.8**: `link rel="alternate" hreflang="..."` für alle verfügbaren Sprachen automatisch generieren (+ `x-default`).
- [x] **subtask 8.9**: Canonical-/Alternate-Strategie für Hash-Routing spezifizieren (SSR/Prerender oder serverseitige Sprach-URLs für SEO-Crawler).
- [x] **subtask 8.10**: Build/execute-Pipeline anpassen (`dist/execute--dev.php`, `dist/execute--prod.php`), damit Sprach-Meta/Alternate zentral aus Config gerendert werden.
- [x] **subtask 8.11**: QA-Checkliste definieren: Sprachwechsel, Direkteinstieg, Fallback, Head-Tags, hreflang-Vollständigkeit.

## task 9: translation-system governance

- [ ] **subtask 9.1**: Konvention für Translation-Dateien pro Sprache dokumentieren (`translations/<lang>/_default.js`, optionale modulare Dateien).
- [ ] **subtask 9.2**: Pflicht-Keys definieren (Core-Menü, Captions, Formlabels) und Missing-Key-Report im Build ergänzen.
- [ ] **subtask 9.3**: Prozess festschreiben: neue Route/View erfordert Translation-Keys in allen aktiven Sprachen.

## task 10: md-first governance (ki-driven source of truth)

- [x] **subtask 10.1**: Verbindliche Regel dokumentieren: alle Objekte, Prozesse und Workflows werden zuerst in MD spezifiziert, Runtime-Dateien sind abgeleitet.
- [x] **subtask 10.2**: MD-Schema für Objektdefinitionen erweitern: Methoden, Validierungen, API-Contract, Fehlercodes.
- [x] **subtask 10.3**: MD-Schema für Prozess-/Workflowdefinitionen ergänzen (Input, Schritte, Nebenwirkungen, Failure-Pfade).
- [x] **subtask 10.4**: Build-Check einführen, der fehlende MD-Quelle für erzeugte Runtime-Artefakte erkennt und Build blockiert.

### acceptance criteria (task 10)

- [x] Für jede `objects/*/*.class.*` Datei existiert eine zugehörige `.class.md` Spezifikation.
- [x] Für jeden API-Endpunkt existiert eine MD-Beschreibung mit Request/Response/Errors.
- [x] CI/Build schlägt fehl, wenn Runtime-Artefakte ohne MD-Quelle erkannt werden.

## task 11: datenmodell als md-source finalisieren

- [x] **subtask 11.1**: MD-Konvention für DB-Felder vereinheitlichen (type, required, default, unique, index).
- [x] **subtask 11.2**: MD-Validierungsregeln standardisieren (format, range, enum, custom rules).
- [x] **subtask 11.3**: MD-Beziehungsmodell definieren (1:1, 1:n, n:m inkl. FK-Regeln und delete/update-Policies).
- [x] **subtask 11.4**: Compiler/DB-Bridge planen: Generierung von Schema-Checks + Validierungslogik aus den Model-MDs.

### acceptance criteria (task 11)

- [x] Modell-MDs decken Felder, Defaults, Indizes, Beziehungen und Validierungen vollständig ab.
- [x] JSON- und MySQL-Engine verhalten sich konsistent bzgl. Validierung und Schema-Regeln.
- [x] Beziehungen sind in API/Object-Layern nachvollziehbar und getestet.

## task 12: forms framework finalisieren (ajax + ux)

- [x] **subtask 12.1**: Standardisiertes Form-Error-Rendering definieren: Inline-Error direkt am Input + globale Fehlerliste über Submit.
- [x] **subtask 12.2**: Einheitliches Event-/State-Modell für Formularzustände (idle/loading/success/error/disabled).
- [x] **subtask 12.3**: Framework-Form-Komponenten-Katalog dokumentieren (Input, Select, Upload, Checkbox, Date, etc.) inkl. Accessibility-Regeln.
- [x] **subtask 12.4**: Upload-Flow vervollständigen (mehrere Dateien, Progress, Typ/Größen-Validierung, Serverfehler-Mapping).

### acceptance criteria (task 12)

- [x] Jede Validierungsfehlermeldung erscheint am betroffenen Input.
- [x] Zusätzlich erscheint eine globale Fehlerliste direkt über dem Submit-Button.
- [x] `XApi.submitForm(...)` deckt Standard-Forms und Upload-Forms ohne Sondercode ab.
- [x] Vorgefertigte Framework-Formelemente sind konsistent integriert.

## task 13: credentials/secrets management

- [x] **subtask 13.1**: Sicheren Projekt-Secret-Store spezifizieren (z. B. `_secrets.json` lokal, nie im Repo, plus Example-Datei).
- [x] **subtask 13.2**: Serverseitigen Zugriffspfad definieren (nur Backend/API, niemals direkt im Frontend-Bundle).
- [x] **subtask 13.3**: Rotations-/Environment-Strategie dokumentieren (dev/stage/prod + Fallback-Regeln).
- [x] **subtask 13.4**: Sicherheitscheck im Build/CI ergänzen (Secret-Leaks, verbotene Keys in `dist/*`).

### acceptance criteria (task 13)

- [x] Secrets sind ausschließlich serverseitig lesbar.
- [x] Beispiel-/Template-Datei vorhanden, echte Secret-Datei gitignored.
- [x] Scan/Check verhindert versehentliche Secret-Ausgabe in `dist/*`.

## task 14: sandbox & mock mode für ajax/formajax

- [x] **subtask 14.1**: Sandbox-Schalter definieren (`X6_CONFIG.ApiMode = live|sandbox`).
- [x] **subtask 14.2**: Mock-Registry für Endpoints einführen (pattern -> mock response / delay / error).
- [x] **subtask 14.3**: Form-AJAX mit Sandbox integrieren (inkl. Upload-Mocks und Validierungsfehler-Mocks).
- [x] **subtask 14.4**: Test-/Demo-Playbook erstellen, damit Flows ohne echtes Backend demonstrierbar sind.

### acceptance criteria (task 14)

- [x] Umschaltung `live|sandbox` ohne Codeänderung pro Feature möglich.
- [x] Mocks können Success, Validation-Error, Auth-Error und Timeout simulieren.
- [x] Upload-Mocks liefern realistische Response-Strukturen.

## task 15: framework-ui primitives governance

- [ ] **subtask 15.1**: Verfügbare Framework-UI-Bausteine inventarisieren (Navigation, Breadcrumbs, Sidebar, Slideshow, etc.).
- [ ] **subtask 15.2**: MD-API für UI-Baustein-Konfiguration definieren (welcher Baustein auf welcher Route mit welchen Daten).
- [ ] **subtask 15.3**: Konsistenzregeln festlegen (Responsiveness, Accessibility, i18n, SEO-relevante Labels/Titles).
- [ ] **subtask 15.4**: Priorisierte Lückenliste für fehlende oder unvollständige UI-Primitives erstellen.

### acceptance criteria (task 15)

- [ ] Alle vorhandenen UI-Primitives sind inventarisiert und MD-konfigurierbar beschrieben.
- [ ] Breadcrumb/Navigation/Sidebar/Slideshow folgen einheitlichen i18n/a11y-Regeln.
- [ ] Dokumentierte Lückenliste ist priorisiert und release-relevant bewertet.

## task 5: qualität & release-vorbereitung

- [ ] **subtask 5.1**: Smoke-Tests für JSON und MySQL durchführen.
- [ ] **subtask 5.2**: `currentstate.md` nach jedem Meilenstein aktualisieren.
- [ ] **subtask 5.3**: Commit-/PR-Checkliste für reproduzierbare KI-Generierung dokumentieren.
