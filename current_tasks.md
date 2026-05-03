# current tasks (xtreme6)

## ziel

Finalisierung des KI-driven Frameworks mit **MD-first Source-of-Truth**, klarer FE/BE-Trennung via API, standardisiertem AJAX/Form-Handling (inkl. Upload), robustem i18n/SEO sowie sicherem Secrets-/Sandbox-Betrieb.

## release-priorität (manager view)

- **P0 (blocker für "framework final")**: task 10, task 11, task 12, task 13, task 14
- **P1 (hoch)**: task 8, task 9, task 7
- **P2 (feature-integration/qa)**: task 4, task 5

## global definition of done (dod)

- [x] Jede Runtime-Funktionalität ist auf eine MD-Spezifikation zurückführbar.
- [x] FE/BE-Verträge sind via API dokumentiert, testbar und versionierbar.
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

- [x] **subtask 4.1**: `UsersController.login` mit Formular-Submit + `XApi.request(...)` verbinden.
- [x] **subtask 4.2**: `UsersController.registration` mit Formular-Submit + `XApi.request(...)` verbinden.
- [x] **subtask 4.3**: UI-Feedback (loading/success/error) in Templates ergänzen.

## task 6: form-system auf ajax + datei-upload standardisieren

- [x] **subtask 6.1**: `scripts/x_api.class.js` erweitern für `FormData`/`multipart` (kein erzwungenes JSON bei Upload).
- [x] **subtask 6.2**: Einheitlichen `XApi.submitForm(formElement, options)` Helper spezifizieren/implementieren.
- [x] **subtask 6.3**: Fehlernormalisierung in `XApi` korrigieren (`errors` darf object oder array sein, nicht nur array).
- [x] **subtask 6.4**: Controller-Migration planen: alle Form-Flows auf AJAX submit inkl. Upload vorbereiten.

## task 7: updateprozess für x_-dateien verifizieren und härten

- [x] **subtask 7.1**: Regel festschreiben: `x_`-Dateien werden bei Framework-Update immer plain überschrieben.
- [x] **subtask 7.2**: `xtreme6_update.php` auf Vollständigkeit prüfen (rekursives Finden + Kopieren aller `x_`-Dateien).
- [x] **subtask 7.3**: Risikoanalyse dokumentieren: lokale Änderungen in `x_` gehen verloren (gewollt) + Gegenmaßnahmen via non-`x_` Overrides.
- [x] **subtask 7.4**: Optionalen Dry-Run/Report-Modus für Updateprozess spezifizieren.

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

- [x] **subtask 9.1**: Konvention für Translation-Dateien pro Sprache dokumentieren (`translations/<lang>/_default.js`, optionale modulare Dateien).
- [x] **subtask 9.2**: Pflicht-Keys definieren (Core-Menü, Captions, Formlabels) und Missing-Key-Report im Build ergänzen.
- [x] **subtask 9.3**: Prozess festschreiben: neue Route/View erfordert Translation-Keys in allen aktiven Sprachen.

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

- [x] **subtask 15.1**: Verfügbare Framework-UI-Bausteine inventarisieren (Navigation, Breadcrumbs, Sidebar, Slideshow, etc.).
- [x] **subtask 15.2**: MD-API für UI-Baustein-Konfiguration definieren (welcher Baustein auf welcher Route mit welchen Daten).
- [x] **subtask 15.3**: Konsistenzregeln festlegen (Responsiveness, Accessibility, i18n, SEO-relevante Labels/Titles).
- [x] **subtask 15.4**: Priorisierte Lückenliste für fehlende oder unvollständige UI-Primitives erstellen.

### acceptance criteria (task 15)

- [x] Alle vorhandenen UI-Primitives sind inventarisiert und MD-konfigurierbar beschrieben.
- [x] Breadcrumb/Navigation/Sidebar/Slideshow folgen einheitlichen i18n/a11y-Regeln.
- [x] Dokumentierte Lückenliste ist priorisiert und release-relevant bewertet.

## task 5: qualität & release-vorbereitung

- [x] **subtask 5.1**: Smoke-Tests für JSON und MySQL durchführen.
- [x] **subtask 5.2**: `currentstate.md` nach jedem Meilenstein aktualisieren.
- [x] **subtask 5.3**: Commit-/PR-Checkliste für reproduzierbare KI-Generierung dokumentieren.

## next roadmap: ki-driven framework hardening

Die folgenden Tasks beschreiben die nächsten Features für das neue Xtreme6 Framework. Grundregel für alle Tasks: **zuerst Markdown-Spezifikation, danach Runtime/Compiler/Tests ableiten**.

## task 16: workflow/process md-source system

- [x] **subtask 16.1**: Ordnerkonvention `docs/workflows/<workflow>.md` finalisieren.
- [x] **subtask 16.2**: Pflichtschema für Workflows definieren: Ziel, Inputs, Schritte, Objekt/API-Aufrufe, Nebenwirkungen, Success-/Failure-Pfade.
- [x] **subtask 16.3**: Build-Check ergänzen: referenzierte Workflows/Prozesse müssen als MD existieren.
- [x] **subtask 16.4**: Beispielworkflow `users.registration.md` aus bestehendem Users-Flow ableiten.
- [x] **subtask 16.5**: Prozess-zu-API/Object Traceability-Report erstellen.

### acceptance criteria (task 16)

- [x] Jeder Prozess/Workflow hat eine MD-Quelle vor Runtime-Änderungen.
- [x] Workflow-MDs referenzieren konkrete API-Endpunkte und Objektmethoden.
- [x] Build/QA meldet fehlende Workflow-MDs.

## task 17: object generator aus md spezifizieren

- [ ] **subtask 17.1**: Object-MD-Schema zu Properties, Methoden, Validierungen, Persistence und Tests maschinenlesbar machen.
- [ ] **subtask 17.2**: Generator-Regeln dokumentieren: `objects/<object>/<object>.class.md` -> PHP/JS/Test-Artefakte.
- [ ] **subtask 17.3**: Singular/Plural-Pair-Regel im Generator erzwingen (`x_user` + `x_users`).
- [ ] **subtask 17.4**: Object-Runtime-Diffs als Report ausgeben, bevor Dateien überschrieben werden.
- [ ] **subtask 17.5**: Beispielgenerierung für `x_user`/`x_users` als Referenz definieren.

### acceptance criteria (task 17)

- [ ] Neue Objekte entstehen nie ohne Singular/Plural-Paar.
- [ ] Runtime-Klassen sind eindeutig auf Object-MDs zurückführbar.
- [ ] Generator kann fehlende oder veraltete Artefakte reporten.

## task 18: datenbank-schema compiler aus models/*.md

- [ ] **subtask 18.1**: `models/*.md` in ein internes Schemaformat parsen (fields, type, required, default, unique, index).
- [ ] **subtask 18.2**: DB-Validierungen aus Model-MD ableiten (format, range, enum, custom rules).
- [ ] **subtask 18.3**: JSON-Engine Schema-Checks vor Insert/Update erzwingen.
- [ ] **subtask 18.4**: MySQL-Engine Schema-Create/Alter-Plan aus Model-MD generieren.
- [ ] **subtask 18.5**: Schema-Diff/Dry-Run für DB-Migrationen einführen.

### acceptance criteria (task 18)

- [ ] DB-Felder, Defaults, Indizes und Unique-Regeln kommen aus `models/*.md`.
- [ ] JSON und MySQL validieren konsistent gegen dasselbe Model-MD.
- [ ] Schema-Änderungen können vor Anwendung als Dry-Run geprüft werden.

## task 19: db relationship engine aus md

- [ ] **subtask 19.1**: Relationship-MD-Schema finalisieren: `1:1`, `1:n`, `n:m`, FK, on delete, on update.
- [ ] **subtask 19.2**: Relationship-Validator für Model-MDs bauen.
- [ ] **subtask 19.3**: MySQL-FK-Planung aus Beziehungen ableiten.
- [ ] **subtask 19.4**: JSON-Engine Referential-Integrity-Checks definieren.
- [ ] **subtask 19.5**: API/Object-Layer muss Beziehungen nachvollziehbar dokumentieren.

### acceptance criteria (task 19)

- [ ] Beziehungen sind in MD definiert, nicht implizit im Code.
- [ ] Delete/Update Policies sind testbar.
- [ ] JSON/MySQL verhalten sich bei Beziehungen konsistent oder dokumentieren bewusste Unterschiede.

## task 20: api compiler und contract tests

- [ ] **subtask 20.1**: API-MD-Schema für Contract-Version, Request, Response, Errors, Auth, Validation und Testability maschinenlesbar machen.
- [ ] **subtask 20.2**: Contract-Test-Generator für alle `api/<dimension>/<dimension>.md` Dateien spezifizieren.
- [ ] **subtask 20.3**: API-Response-Shape automatisch gegen `x_api_payload` validieren.
- [ ] **subtask 20.4**: FE-Controller müssen nur dokumentierte Endpoints aus API-MDs verwenden.
- [ ] **subtask 20.5**: Breaking-Change-Erkennung für API-Contract-Versionen planen.

### acceptance criteria (task 20)

- [ ] FE/BE-Verträge sind versioniert und testbar.
- [ ] Undokumentierte API-Endpunkte oder FE-Aufrufe schlagen im Build/QA fehl.
- [ ] Contract-Tests prüfen Success- und Failure-Pfade.

## task 21: frontend-backend boundary enforcement

- [ ] **subtask 21.1**: Regel dokumentieren: FE darf Backend nur via API erreichen, keine direkten PHP/DB-Abhängigkeiten.
- [ ] **subtask 21.2**: Build-Check für verbotene Backend-Referenzen in `scripts/` und `templates/` ergänzen.
- [ ] **subtask 21.3**: `XApi` als einzigen FE-API-Zugriffspfad festlegen.
- [ ] **subtask 21.4**: Sandbox/Live-Modus in FE-Konfiguration eindeutig dokumentieren.
- [ ] **subtask 21.5**: API-Base-URL/Dist-Routing für dev/prod standardisieren.

### acceptance criteria (task 21)

- [ ] Frontend-Code enthält keine direkten DB/PHP-Includes/Secrets.
- [ ] Alle BE-Zugriffe laufen über `XApi`.
- [ ] Build-Check findet Boundary-Verletzungen.

## task 22: form component generator aus md

- [ ] **subtask 22.1**: MD-Schema für Formular-Komponenten definieren: Input, Select, Upload, Checkbox, Date, Textarea, Hidden.
- [ ] **subtask 22.2**: Standard-Markup mit Label, Help-Text, Error-Slot, ARIA und required-State spezifizieren.
- [ ] **subtask 22.3**: Templates/Form-Partials aus Form-MDs generieren.
- [ ] **subtask 22.4**: Translation-Keys für Labels/Help/Errors aus Form-MD ableiten.
- [ ] **subtask 22.5**: Form-Komponenten-Katalog visuell/testbar dokumentieren.

### acceptance criteria (task 22)

- [ ] Formulare werden aus MD-Komponenten erzeugt oder eindeutig geführt.
- [ ] Alle Formelemente haben einheitliches Error-/ARIA-Verhalten.
- [ ] Neue Formfelder erzeugen automatisch benötigte Translation-Key-Anforderungen.

## task 23: formajax upload pipeline finalisieren

- [ ] **subtask 23.1**: Upload-MD-Schema definieren: erlaubte MIME-Typen, Größenlimits, Mehrfachupload, Ziel-API.
- [ ] **subtask 23.2**: Clientseitige Vorvalidierung für Typ/Größe/Anzahl standardisieren.
- [ ] **subtask 23.3**: Upload-Progress Events in `XApi.submitForm(...)` ergänzen.
- [ ] **subtask 23.4**: Server-Contract für Upload-Responses und Field-Errors dokumentieren.
- [ ] **subtask 23.5**: Sandbox-Upload-Mocks mit realistischen File-Metadaten erweitern.

### acceptance criteria (task 23)

- [ ] Datei-Uploads funktionieren ohne Sondercode im Feature-Controller.
- [ ] Upload-Fehler erscheinen am Feld und in der globalen Fehlerliste.
- [ ] Sandbox kann Upload-Success und Upload-Validation-Errors simulieren.

## task 24: global form flow audit

- [ ] **subtask 24.1**: Alle vorhandenen und geplanten Forms inventarisieren.
- [ ] **subtask 24.2**: Prüfen, dass jedes Form über AJAX/FormAjax läuft.
- [ ] **subtask 24.3**: Prüfen, dass jedes Form Inline-Errors und Error-Summary nutzt.
- [ ] **subtask 24.4**: Prüfen, dass jedes Form Loading/Success/Error/Disabled-State nutzt.
- [ ] **subtask 24.5**: Build-/QA-Report für nicht migrierte Forms ergänzen.

### acceptance criteria (task 24)

- [ ] Keine klassischen Full-Page-Form-Submits im Framework-Frontend.
- [ ] Einheitliches Fehlerverhalten in allen Forms.
- [ ] Form-Audit läuft reproduzierbar im Release-QA-Prozess.

## task 25: framework navigation/breadcrumb/sidebar/slideshow runtime

- [ ] **subtask 25.1**: Breadcrumb-Primitive implementieren und aus Route/MD-Captions ableiten.
- [ ] **subtask 25.2**: Sidebar-Konfiguration route-level aus Markdown ermöglichen.
- [ ] **subtask 25.3**: Navigation-Items aus `docs/routes.md` und UI-MD-Konfiguration generieren.
- [ ] **subtask 25.4**: Slideshow-Primitive mit a11y, keyboard controls, i18n Labels und optionalen Links spezifizieren/implementieren.
- [ ] **subtask 25.5**: Build-Check: UI-Primitive-Links müssen deklarierte Routen verwenden.

### acceptance criteria (task 25)

- [ ] Navigation, Breadcrumbs, Sidebars und Slideshows sind frameworkseitig bereitgestellt.
- [ ] UI-Primitives sind MD-konfigurierbar und i18n/a11y-konform.
- [ ] Feature-Code muss keine eigenen Basis-Primitives bauen.

## task 26: credentials provider system

- [ ] **subtask 26.1**: Secret-Provider-Interface spezifizieren: local file, env vars, future vault provider.
- [ ] **subtask 26.2**: Projekt-Credentials für externe APIs strukturiert in `_secrets.json` dokumentieren.
- [ ] **subtask 26.3**: Zugriff nur serverseitig über Helper erlauben, niemals direkt im FE.
- [ ] **subtask 26.4**: Rotation/Environment-Konvention für dev/stage/prod erweitern.
- [ ] **subtask 26.5**: Secret-Usage-Report für API-Integrationen ergänzen (ohne Werte auszugeben).

### acceptance criteria (task 26)

- [ ] Externe API-Credentials können sicher projektbezogen hinterlegt werden.
- [ ] Frontend-Bundles enthalten keine Secret-Namen/Werte außer erlaubten Public Config Keys.
- [ ] Release-QA scannt Secret-Leaks und dokumentiert Secret-Abhängigkeiten.

## task 27: sandbox/mock scenario manager

- [ ] **subtask 27.1**: Mock-Szenarien als MD/JSON-Konfiguration definieren: success, validation-error, auth-error, timeout, upload-error.
- [ ] **subtask 27.2**: `XApi` Mock-Registry aus Szenario-Konfiguration laden.
- [ ] **subtask 27.3**: Umschaltung per `X6_CONFIG.ApiMode` und optionalem Scenario-Namen ermöglichen.
- [ ] **subtask 27.4**: Demo-Playbook für komplette FE-Flows ohne Live-Backend erstellen.
- [ ] **subtask 27.5**: QA-Check für Mock-Abdeckung je API-Contract ergänzen.

### acceptance criteria (task 27)

- [ ] Jeder relevante API-Flow kann live und sandboxed demonstriert werden.
- [ ] Mock-Szenarien sind versioniert und auf API-MDs zurückführbar.
- [ ] FormAjax und Uploads nutzen dieselbe Mock-Infrastruktur.

## task 28: ai generation workflow and checkpoints

- [ ] **subtask 28.1**: AI-Arbeitsablauf dokumentieren: MD ändern -> generieren -> QA -> dist bauen -> tasks/currentstate aktualisieren.
- [ ] **subtask 28.2**: Checkpoint-Regeln definieren: vor/nach Generatorläufen, vor Release-QA, vor Framework-Update.
- [ ] **subtask 28.3**: Diff-/Report-Format für AI-generierte Änderungen standardisieren.
- [ ] **subtask 28.4**: Verbot direkter Runtime-Änderungen ohne MD-Änderung in QA-Check aufnehmen.
- [ ] **subtask 28.5**: Reproduzierbaren Manager-Report für erledigte Tasks erstellen.

### acceptance criteria (task 28)

- [ ] KI-generierte Änderungen sind reproduzierbar und nachvollziehbar.
- [ ] Jeder Task hat MD-Quelle, QA-Ergebnis und Manager-Abnahme.
- [ ] Runtime-only Änderungen werden im Review sichtbar.

## task 29: release gate all dod automation

- [ ] **subtask 29.1**: `compiler/release_gate.php` als Sammelcheck spezifizieren.
- [ ] **subtask 29.2**: MD-first, API-contract, translation-governance, secret-scan, form-audit, route-link-audit zusammenführen.
- [ ] **subtask 29.3**: JSON-Smoke und MySQL-Smoke/Skip in Release-Gate integrieren.
- [ ] **subtask 29.4**: Exit-Codes und maschinenlesbaren Report definieren.
- [ ] **subtask 29.5**: `current_tasks.md` globale DoD nur bei grünem Release-Gate vollständig abhaken.

### acceptance criteria (task 29)

- [ ] Ein einziger Release-Gate-Befehl prüft Framework-Finalität.
- [ ] Fehlende MD-Quellen, API-Verträge, Form-Migrationen, Secrets und Mock-Lücken blockieren Release.
- [ ] Report ist für KI/Manager lesbar.
