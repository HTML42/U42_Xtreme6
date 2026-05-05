# release qa checklist

## purpose

This checklist makes framework releases reproducible and reviewable.

## terminal safety rule

All QA commands must be non-interactive. Do not run commands that can open a pager and wait for `q`.

- use `git --no-pager ...` for git diff/log/show commands.
- do not use plain `git diff`, `git log`, or `git show` in automated/checkpoint workflows.
- if another tool can page or prompt, disable the pager/prompt before running it.
- AI agents must remember this as a hard rule for every task, not only release tasks.
- Prefer report/smoke commands that print once and exit; never start a command that requires manual `q`, confirmation, or interactive input.

## required smoke tests

Run before a release/PR:

Single release gate:

```cmd
php compiler/release_gate.php
```

The gate writes `dist/release_gate_report.json` and exits non-zero when a blocking check fails. MySQL smoke without local `_db.json` is treated as documented environment-only skip. The JSON report sanitizes secret-like key names in embedded command output so the post-build secret scan can validate the generated report itself.

Individual checks included in the gate:

```cmd
php compiler/check_md_first.php
php compiler/check_secret_leaks.php
php compiler/report_secret_usage.php
php compiler/report_sandbox_coverage.php
php compiler/report_ai_generation.php
php compiler/report_traceability_dashboard.php
php compiler/report_workflow_traceability.php
php compiler/report_object_generation.php
php compiler/report_model_schema.php
php compiler/report_model_relationships.php
php compiler/report_api_contracts.php
php compiler/check_frontend_boundary.php
php compiler/report_form_components.php
php compiler/report_form_flows.php
php compiler/report_ui_primitives.php
php compiler/compile_objects.php
php compiler/compile_scripts.php
php compiler/compile_styles.php
php compiler/compile_production.php
php compiler/smoke_database.php
```

Database smoke behavior:

- `Database=JSON`: executes registration, login, select and cleanup delete against local JSON storage.
- `Database=MYSQL`: executes the same flow when `_db.json` exists.
- `Database=MYSQL` without `_db.json`: reports a skip, because credentials are environment-local and must not be committed.

## commit / pr checklist

- Markdown source-of-truth was updated before runtime artifacts.
- Generated `dist/*` artifacts were rebuilt after runtime/source changes.
- `php compiler/report_ai_generation.php` was reviewed for runtime-only risks and manager-readable task evidence.
- `current_tasks.md` marks only verified tasks as done.
- `currentstate.md` documents the current milestone and remaining risks.
- `git --no-pager diff --stat` was reviewed for unexpected files.
- any detailed diff review used `git --no-pager diff ...` and did not open an interactive pager.
- No secrets are present in source or generated bundles.
- Translation governance passes for all configured languages.
- New routes have controller markdown, templates, captions, and intro translations.

## documentation checkpoint

- Start from `agents.md` and follow its task documentation routing table.
- Update the canonical markdown source for the touched domain only.
- Avoid duplicate AI-process explanations; link to `agents.md`, `docs/md_first.md`, or the relevant `docs/x_*.md` file instead.
- For cross-domain tasks, read only the routed canonical docs for the touched domains, then edit the concrete MD source-of-truth before runtime/generated files.

## ai generation checkpoints

The canonical AI-generation workflow and checkpoint order is `docs/md_first.md` → `## ai generation workflow`.

Release QA verifies that workflow through:

- `php compiler/report_ai_generation.php`
- `php compiler/report_traceability_dashboard.php`
- `php compiler/release_gate.php`
- `git --no-pager diff --stat`

Runtime-only changes are acceptable only when the report shows accompanying markdown/task/currentstate evidence or when the file is explicitly generated from a changed source.

## framework final qa playbooks

These playbooks are manager-readable checklists for recurring framework work. They do not replace the canonical source documents; they route developers and AI agents to the right Markdown source first, then to runtime generation and release QA.

### playbook command safety baseline

All framework final QA playbooks in this section must keep these command-safety rules:

- Every QA command must be non-interactive and terminate without prompts, confirmations or pager navigation.
- Git review examples must use `git --no-pager diff --stat` or targeted `git --no-pager diff -- <path>`.
- Playbooks must not contain plain `git diff`, `git log` or `git show` commands.
- If a task needs history review, use `git --no-pager log --oneline -n <count>`.
- Generated reports and compiler commands must print once and exit; avoid tools that wait for `q` or open a pager.

### new domain feature flow

Use this playbook when adding a new first-party domain concept such as products, orders, profiles or projects.

1. **Scope and reuse decision**
   - Read `agents.md`, then the routed docs for objects, models, API, routes, forms, UI primitives, i18n and QA as needed.
   - Check whether the feature belongs in an existing object pair before creating a new domain object.
   - If a new domain is needed, create both singular and plural variants; never create only one side.
2. **Markdown source-of-truth**
   - Object pair: create or update `objects/<singular>/<singular>.class.md` and `objects/<plural>/<plural>.class.md` with role, generator schema, properties, methods, validation, persistence and tests.
   - Model: create or update `models/<plural>.md` with fields, defaults, constraints, indexes, validation and explicit relations or `none`.
   - API: create or update `api/<dimension>/<dimension>.md` with contract version, endpoints, request, success response, error responses, auth, validation and testability.
   - Workflow markdown: add or revise the matching file under `docs/workflows/` with goal, inputs, steps, API calls, object calls, side effects, success path, failure paths and traceability.
   - Routes/controllers/templates: declare every route in `docs/routes.md` and controller behavior in `scripts/controllers/<controller>.controller.md` before runtime changes.
   - Forms: for every submitted form, add `docs/forms/<form>.md` and reference the documented API endpoint plus `XApi.submitForm(...)` behavior.
   - Translations: add required route captions, menu labels, form labels/help text, error keys and UI primitive keys for every configured language.
3. **Runtime and generated artifacts**
   - Derive object PHP/JS/test artifacts from the object Markdown pair.
   - Implement API endpoints only after the API contract is documented and keep responses in the standard `x_api_payload(...)` / `x_api_output(...)` shape.
   - Implement frontend controllers/templates so backend access goes only through `XApi` or `XApi.submitForm(...)`.
   - Use lowercase filenames and native hash links (`href="#!/controller/view"`) for templates and route links.
4. **Developer self-check**
   - Verify singular/plural naming, route declarations, form field names, translation keys, and FE/BE boundary before running QA.
   - Review `git --no-pager diff --stat` for unexpected runtime-only changes.
5. **Non-interactive QA**
   - Run the relevant targeted reports first, then the release gate:
     - `php compiler/check_md_first.php`
     - `php compiler/report_object_generation.php`
     - `php compiler/report_model_schema.php`
     - `php compiler/report_model_relationships.php`
     - `php compiler/report_api_contracts.php`
     - `php compiler/report_workflow_traceability.php`
     - `php compiler/report_form_components.php`
     - `php compiler/report_form_flows.php`
     - `php compiler/report_ui_primitives.php`
     - `php compiler/check_frontend_boundary.php`
     - `php compiler/report_ai_generation.php`
     - `php compiler/release_gate.php`
   - Use only non-interactive Git review commands such as `git --no-pager diff --stat` and `git --no-pager diff -- <path>`.
6. **Manager acceptance**
   - Mark the task done only after implementation, QA review, QA fixes and passing checks.
   - Update `current_tasks.md` and `currentstate.md` with the domain feature, QA evidence, remaining risks and manager decision.

### credentialed external api feature

Use this playbook when a feature needs a private external API key, token or credential. The frontend must never call the upstream service directly and must never receive private credential names or values.

1. **Scope and security decision**
   - Read `agents.md`, `docs/x_api.md`, `docs/secrets.md`, `docs/sandbox.md`, `docs/md_first.md` and this release QA checklist before editing runtime files.
   - Confirm that the integration is truly credentialed. Public, browser-safe APIs may use public configuration only when explicitly documented as non-secret.
   - Choose a lowercase service identifier and a documented Xtreme6 backend proxy endpoint such as `/api/integrations/example_lookup`.
2. **Markdown and value-free configuration first**
   - API contract: document the proxy endpoint in the matching `api/<dimension>/<dimension>.md` with contract version, request mapping, sanitized response mapping, auth requirements, validation rules, error responses and testability.
   - External integration schema: include service purpose, backend proxy endpoint, upstream name or base URL, required secret paths, rate limits, failure strategy, sandbox scenarios and testability according to `docs/x_api.md`.
   - Secret structure: update `_secrets.example.json` and `docs/secrets.md` with placeholder credentials, `required_secrets`, env mappings, proxy endpoints, rotation notes, rate limits and failure classes; never add real values.
   - Sandbox source: update `docs/sandbox_scenarios.json` or the relevant sandbox documentation so mocks simulate the Xtreme6 proxy endpoint, not the upstream URL.
3. **Backend proxy implementation**
   - Implement the API endpoint only after the Markdown contract exists.
   - Resolve private credentials server-side through `x_secret_get(...)` or the documented provider helper.
   - Validate frontend input before calling upstream; reject missing or invalid input with standard field/global errors.
   - Map upstream responses to sanitized business data and the standard `x_api_payload(...)` / `x_api_output(...)` shape.
   - Convert missing credentials, timeouts, invalid upstream responses, upstream auth failures and rate limits to controlled API payloads without stack traces, raw upstream dumps, Authorization headers or secret paths in frontend-visible responses.
4. **Frontend and sandbox integration**
   - Frontend code calls only `XApi.request(...)` or `XApi.submitForm(...)` against the documented Xtreme6 proxy endpoint.
   - Do not add direct `fetch(...)`, upstream URLs, backend file paths, credential names or secret-like values to `scripts/` or `templates/`.
   - Sandbox mocks must cover success plus credential/config error, timeout, invalid upstream response and rate limit when the live proxy is implemented.
5. **Non-interactive QA**
   - Run targeted checks before the release gate:
     - `php compiler/check_md_first.php`
     - `php compiler/report_secret_usage.php`
     - `php compiler/check_secret_leaks.php`
     - `php compiler/report_sandbox_coverage.php`
     - `php compiler/report_api_contracts.php`
     - `php compiler/check_frontend_boundary.php`
     - `php compiler/report_ai_generation.php`
     - `php compiler/release_gate.php`
   - Review diffs with `git --no-pager diff --stat` and targeted `git --no-pager diff -- <path>` only.
6. **Manager acceptance**
   - Accept the task only when secret usage is value-free, the frontend/backend boundary is clean, sandbox coverage exists, leak checks pass and the release gate is green.
   - Update `current_tasks.md` and `currentstate.md` with the proxy endpoint, secret dependencies, QA evidence and any environment-only skips.

### ui feature flow

Use this playbook when adding or changing route-level UI behavior such as navigation, breadcrumbs, sidebar groups, slideshow content, layout variants or reusable UI primitive templates.

1. **Scope and primitive decision**
   - Read `agents.md`, `docs/routes.md`, `docs/ui_primitives.md`, `docs/md_first.md` and this release QA checklist before editing runtime templates or controllers.
   - Prefer existing primitives (`header`, `sidebar`, `breadcrumb`, `slideshow`, `footer`, layout shell) before adding a new primitive.
   - If a new primitive is required, document it in `docs/ui_primitives.md` first with runtime artifact, route/data source, i18n keys, accessibility behavior and responsive expectations.
2. **Route-level Markdown source**
   - Declare every affected route in `docs/routes.md` before controller/template changes.
   - Configure route UI explicitly with `header`, `footer`, `layout`, `sidebar`, `sidebar_group`, `navigation`, `breadcrumb`, optional `breadcrumb_parent` and optional `slideshow` metadata.
   - Keep header and sidebar navigation in the `ui_navigation` section and point links only to declared hash routes.
   - Slideshow definitions must include image source, translated alt/title/caption/cta keys, declared target route and keyboard support flag.
3. **Translations, accessibility and SEO**
   - Add or verify all visible labels in every configured language: menu labels, sidebar titles, route captions, breadcrumb labels, slideshow alt/title/caption/cta keys and footer text.
   - Ensure landmarks and controls have appropriate `aria-label`, `aria-current`, keyboard behavior, focus states and mobile/desktop responsive behavior.
   - Map route-relevant labels and titles to caption/meta governance where SEO output depends on route text.
4. **Runtime and generated artifacts**
   - Update controller markdown (`scripts/controllers/<controller>.controller.md`) before controller runtime when route behavior changes.
   - Implement templates with lowercase filenames and native hash links (`href="#!/controller/view"`), never `data-href` or undeclared routes.
   - Keep runtime route/UI maps derived from `docs/routes.md`; avoid hardcoded duplicate navigation lists in templates when route configuration already owns the data.
5. **Non-interactive QA**
   - Run targeted checks before the release gate:
     - `php compiler/check_md_first.php`
     - `php compiler/report_ui_primitives.php`
     - `php compiler/check_frontend_boundary.php`
     - `php compiler/report_ai_generation.php`
     - `php compiler/compile_scripts.php`
     - `php compiler/compile_production.php`
     - `php compiler/release_gate.php`
   - Review diffs with `git --no-pager diff --stat` and targeted `git --no-pager diff -- <path>` only.
6. **Manager acceptance**
   - Accept the task only when routes are declared, UI config validates, links target declared routes, translations exist, a11y expectations are documented or implemented and the release gate is green.
   - Update `current_tasks.md` and `currentstate.md` with the changed UI primitive or route composition, QA evidence and remaining UI/a11y risks.

### form/upload feature flow

Use this playbook when adding or changing submitted forms, FormAjax behavior, upload fields, upload validation, upload progress or form-specific sandbox mocks.

1. **Scope and existing-form decision**
   - Read `agents.md`, `docs/forms.md`, `docs/x_api.md`, `docs/sandbox.md`, `docs/md_first.md` and this release QA checklist before editing runtime templates or controllers.
   - Check whether the feature extends an existing form under `docs/forms/*.md` before creating a new form Markdown file.
   - If the form belongs to a new domain feature, follow the `new domain feature flow` first so Object-Pair, Model, API, Workflow markdown, Route and Translations are already specified.
2. **Markdown source-of-truth**
   - Form source: create or update `docs/forms/<form>.md` with `role`, `api contract`, `fields`, `rendering`, `validation`, `error handling`, `translations` and `accessibility`.
   - API contract: create or update the matching `api/<dimension>/<dimension>.md` endpoint with method, request body or multipart fields, success response, field/global error responses, auth requirements, validation rules and testability.
   - Upload fields: declare `component: upload`, submitted `name`, `accept`, `multiple`, `max size`, `max files`, progress behavior and backend-authoritative validation.
   - Error mapping: document backend field-error keys exactly as submitted field names; global errors use only reserved keys such as `form`, `request`, `credentials`, `method`, `mock` or `_global`.
   - Sandbox source: update `docs/sandbox_scenarios.json` or the routed sandbox documentation so success, validation-error, timeout and upload-error scenarios use the same standard API payload as live endpoints.
   - Translations: add or verify label, help, status, upload-progress and validation/error keys for every configured language before changing templates.
3. **Runtime and generated artifacts**
   - Implement templates with lowercase filenames and central form primitives: `.x_form_field[data-field]`, `.x_form_input_error[data-error-for]`, `.x_form_error_summary_slot` and `.x_form_upload_progress` when uploads are present.
   - Frontend controllers must submit only through `XApi.submitForm(formElement, options)` and may not implement custom field-error DOM rendering.
   - Use `XApi.setFormState(...)`, `XApi.renderFormErrors(...)`, `XApi.clearFormErrors(...)` and `XApi.renderUploadProgress(...)` through the central helper behavior instead of feature-local duplicates.
   - API endpoints must return the standard `x_api_payload(...)` / `x_api_output(...)` shape and key validation errors by submitted field name.
   - Sandbox mocks must simulate the documented Xtreme6 endpoint, including realistic uploaded file metadata for upload success and field-specific upload errors for failure.
4. **Developer self-check**
   - Verify deterministic lowercase field IDs, exact `name`/error-key matching, required ARIA metadata, summary placement before submit and password-like field clearing on failure.
   - Verify upload prevalidation covers type, size and file count while keeping backend validation authoritative.
   - Review diffs with `git --no-pager diff --stat` and targeted `git --no-pager diff -- <path>` only.
5. **Non-interactive QA**
   - Run targeted checks before the release gate:
     - `php compiler/check_md_first.php`
     - `php compiler/report_form_components.php`
     - `php compiler/report_form_flows.php`
     - `php compiler/report_api_contracts.php`
     - `php compiler/report_sandbox_coverage.php`
     - `php compiler/check_frontend_boundary.php`
     - `php compiler/report_ai_generation.php`
     - `php compiler/compile_scripts.php`
     - `php compiler/compile_production.php`
     - `php compiler/release_gate.php`
   - For upload runtime changes, also run available syntax checks such as `node --check scripts/x_api.class.js`, `node --check dist/scripts--prod.js` and `node --check dist/app.js` after compilation.
   - Use only non-interactive Git review commands; never use plain `git diff`, `git log` or `git show`.
6. **Manager acceptance**
   - Accept the task only when Form-MD, API contract, upload rules, error mapping, translations and sandbox mocks are traceable and all targeted checks plus the release gate pass.
   - Update `current_tasks.md` and `currentstate.md` with the form/upload feature, QA evidence, QA findings/fixes and any remaining environment-only skips.

## manager acceptance

A task can be marked done only after:

1. Developer implementation is complete.
2. QA review identifies likely bugs/optimizations.
3. Developer fixes QA findings.
4. Checks pass or documented environment-only skips are justified.
