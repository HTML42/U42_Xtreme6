# x_framework.md

## role of this file

This document is the **detailed technical reference** for the xtreme6 framework.

- `agents.md` defines decision priority and top-level rules.
- this file explains the framework architecture and technical boundaries.
- if any statement here conflicts with `agents.md`, `agents.md` wins.

## framework architecture

u42 xtreme6 is a **markdown-driven framework**.

The framework starts with object definitions in `*.class.md` files. Those files define behavior and constraints. PHP classes, JavaScript classes, and test files are derived from that source.

Core idea:

1. write or change behavior in markdown
2. generate runtime code and tests from that definition
3. aggregate generated sources into build outputs under `dist/`

## repository structure

- `objects/` — object source files and generated object runtime/test files
- `x/` — framework core classes and helpers (`x_*`)
- `compiler/` — build scripts for object and script aggregation
- `scripts/` — frontend/project runtime scripts
- `api/` — HTTP endpoints
- `dist/` — compiled or aggregated outputs
- `docs/` — framework documentation
- `styles/` — CSS files

## naming rules

- file names and directory names must be lowercase.
- framework-specific files use the `x_` prefix.
- framework documentation files also follow the `x_` convention, for example `x_framework.md` and `x_objects.md`.
- framework code may be replaced during framework updates.

## source-of-truth model

For objects, the markdown file is the source of truth:

- `x_user.class.md`
- `x_users.class.md`

The markdown definition drives:

- `.class.php`
- `.class.js`
- `.test.php`
- `.test.js`

Direct business-rule maintenance should happen in markdown first, not in the generated runtime files.

## build flow

### object build

`compiler/compile_objects.php`:

- scans `objects/`
- groups files by suffix
- validates PHP object files
- produces aggregated outputs in `dist/`

Generated outputs include:

- `objects--dev.php`
- `objects--prod.php`
- `objects.test--dev.php`
- `objects.test--prod.php`
- `objects--dev.js`
- `objects--prod.js`
- `objects.test--dev.js`
- `objects.test--prod.js`

### script build

`compiler/compile_scripts.php`:

- scans `scripts/`
- aggregates JavaScript sources
- produces:
  - `scripts--dev.js`
  - `scripts--prod.js`

## include/require boundaries

### forbidden locations

The following files must not contain `include`, `include_once`, `require`, or `require_once`:

- `objects/*/*.class.php`
- `objects/*/*.test.php`

Reason: object classes and object tests must remain standalone source units that are composed by the build system.

### allowed locations

`require_once` is allowed and expected in framework/bootstrap/aggregation files such as:

- `compiler/*.php`
- `dist/execute*.php`
- generated `dist/*--dev.php`

These files are responsible for composition and load order.

## php constraints

For framework object classes:

- never use `declare(strict_types=1);`
- never use `final class`
- PHP files must start with `<?php` and end with `?>`
- object class constructors must use `public function __construct(int $id = 0)`

## js constraints

For object class files:

- do not use `import`
- do not use `require`
- do not use exports

Object class files are designed to run in the framework loading model without module syntax.

## runtime caching conventions

- PHP object classes use `$_CACHE`
- JavaScript object classes use `_CACHE`

## framework helpers

The `x/` directory contains shared framework utilities.

Examples:

- `x_compiler.class.php`
- `x_functions.php`
- `x_pluralize.class.php`

`x_pluralize.class.php` is the canonical helper for singular/plural word transformation inside the framework.