# release qa checklist

## purpose

This checklist makes framework releases reproducible and reviewable.

## terminal safety rule

All QA commands must be non-interactive. Do not run commands that can open a pager and wait for `q`.

- use `git --no-pager ...` for git diff/log/show commands.
- do not use plain `git diff`, `git log`, or `git show` in automated/checkpoint workflows.
- if another tool can page or prompt, disable the pager/prompt before running it.

## required smoke tests

Run before a release/PR:

```cmd
php compiler/check_md_first.php
php compiler/check_secret_leaks.php
php compiler/report_workflow_traceability.php
php compiler/report_object_generation.php
php compiler/report_model_schema.php
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

## manager acceptance

A task can be marked done only after:

1. Developer implementation is complete.
2. QA review identifies likely bugs/optimizations.
3. Developer fixes QA findings.
4. Checks pass or documented environment-only skips are justified.
