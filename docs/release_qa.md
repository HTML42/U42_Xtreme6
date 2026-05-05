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

## manager acceptance

A task can be marked done only after:

1. Developer implementation is complete.
2. QA review identifies likely bugs/optimizations.
3. Developer fixes QA findings.
4. Checks pass or documented environment-only skips are justified.
