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

AI-generated changes must be reproducible in this order:

1. Markdown source changed or explicitly confirmed.
2. Runtime/compiler changes derived from that source.
3. Generated `dist/*` artifacts rebuilt.
4. QA reports executed non-interactively.
5. `current_tasks.md` and `currentstate.md` updated only after QA.
6. Manager review uses `php compiler/report_ai_generation.php` and `git --no-pager diff --stat`.

Runtime-only changes are acceptable only when the report shows an accompanying markdown/task/currentstate update or when the file is explicitly generated from a changed source.

## manager acceptance

A task can be marked done only after:

1. Developer implementation is complete.
2. QA review identifies likely bugs/optimizations.
3. Developer fixes QA findings.
4. Checks pass or documented environment-only skips are justified.
