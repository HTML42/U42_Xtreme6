# x_compiler.md

## role of this file

This document is the **compiler reference** for xtreme6.

- `agents.md` defines precedence and naming rules.
- this file documents build order, compiler inputs, and outputs in `dist/`.
- if this file conflicts with `agents.md`, `agents.md` wins.

## compiler overview

The framework uses small compiler steps in `compiler/` and writes runtime artifacts to `dist/`.

Compiler files:

- `compiler/compile_objects.php`
- `compiler/compile_scripts.php`
- `compiler/compile_styles.php`
- `compiler/compile_production.php`

## required build order

Run compilers in this order:

1. `compile_objects.php`
2. `compile_scripts.php`
3. `compile_styles.php`
4. `compile_production.php`

Reason: the final production compiler expects object/script/style artifacts to already exist in `dist/`.

## compiler responsibilities

### 1) object compiler

`compiler/compile_objects.php`

- scans `objects/`
- validates object php constraints
- groups files by suffix (`.class.php`, `.class.js`, `.test.php`, `.test.js`)
- writes aggregated object outputs to `dist/`

Key outputs:

- `dist/objects--dev.php`
- `dist/objects--prod.php`
- `dist/objects--dev.js`
- `dist/objects--prod.js`
- `dist/objects.test.php`
- `dist/objects.test.js`

### 2) scripts/templates/translations compiler

`compiler/compile_scripts.php`

- scans `scripts/`, `templates/`, `translations/`
- creates `--dev` include bundles and `--prod` concatenated bundles

Key outputs:

- `dist/scripts--dev.js`, `dist/scripts--prod.js`
- `dist/templates--dev.js`, `dist/templates--prod.js`
- `dist/translations--dev.js`, `dist/translations--prod.js`

### 3) styles compiler

`compiler/compile_styles.php`

- uses `styles/styles.css` as the main entry stylesheet
- also compiles every additional entry matching `styles/styles.*.css`
- resolves local `@import` directives recursively (within `styles/`)
- writes compiled entry files to `dist/` using the same filename
- applies a lightweight non-invasive minify step (`css_minify`) for the main `styles.css` production output

Default outputs:

- `dist/styles.css` (from `styles/styles.css`)
- `dist/styles.<name>.css` (from `styles/styles.<name>.css`, if present)

Runtime usage convention:

- dev entry (`dist/execute--dev.php`) links `../styles/styles.css`
- prod entry (`dist/execute--prod.php` / `dist/app.php`) links `./styles.css`
- for extra bundles (`styles.<name>.css`), project entry files must add matching `<link>` tags manually.

### 4) production compiler

`compiler/compile_production.php`

- concatenates runtime `dist/*--prod.js` to `dist/app.js`
- concatenates runtime `dist/*--prod.php` to php runtime in `dist/app.php`
- emits html shell in `dist/app.php`
- includes stylesheet link:
  - `<link rel="stylesheet" href="./styles.css">`
- applies a lightweight non-invasive JS minify step (`js_minify`) to `dist/app.js`

## local command examples

All commands in this section are non-interactive. If reviewing git output around compiler runs, use `git --no-pager ...` as required by `agents.md` and `docs/release_qa.md`.

Run single steps:

- `php compiler\compile_objects.php`
- `php compiler\compile_scripts.php`
- `php compiler\compile_styles.php`
- `php compiler\compile_production.php`

Run all steps in order:

- `php compiler\compile_objects.php && php compiler\compile_scripts.php && php compiler\compile_styles.php && php compiler\compile_production.php`

## runtime entrypoints in dist

Typical runnable endpoints:

- `dist/execute--dev.php`
- `dist/execute--prod.php`
- `dist/execute--test.php`
- `dist/app.php`

- Production-facing entrypoints should include `./styles.css` in `<head>`.
- Development entrypoints can include source stylesheet(s) directly from `../styles/`.
- execute entrypoints are frontend bootstraps and should not include object PHP runtime directly.
- object PHP runtime is consumed by API/server logic via shared API includes.

## database config notes for environments

- `config.json` controls the database engine via `Database` (`JSON` or `MYSQL`).
- for `JSON`, runtime uses local JSON-table storage under `_db/`.
- for `MYSQL`, runtime requires a root-level `_db.json` file (ignored by git).
- each environment must create its own `_db.json` from `_db.example.json` and adjust credentials.

## related docs

- API routing/dimension/output rules: `docs/x_api.md`
