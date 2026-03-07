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
- `scripts/` — frontend/project runtime scripts and base runtime classes
- `templates/` — JavaScript template source files (`*.js`)
- `translations/` — JavaScript translation source files (`*.js`), grouped by locale
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

### script/template/translation build

`compiler/compile_scripts.php`:

- scans `scripts/`, `templates/`, and `translations/`
- aggregates JavaScript sources into independent bundles
- produces:
  - `scripts--dev.js`
  - `scripts--prod.js`
  - `templates--dev.js`
  - `templates--prod.js`
  - `translations--dev.js`
  - `translations--prod.js`

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

## frontend routing (hash-based c/v/a)

The frontend runtime uses a hash router with the format:

- `#!/controller/view`
- `#!/controller/view/action`
- `#!/controller/view/3` (numeric third segment is `id`)
- `#!/controller/view/tab/statistics` (trailing key/value pairs become `params`)

Routing rules:

- first segment: `controller`
- second segment: `view`
- third segment:
  - numeric => `id`
  - non-numeric with odd remaining segment count => `action`
- all remaining pairs => `params[key] = value`

Runtime behavior:

- router listens to `load` and `hashchange`
- every URL change creates a fresh parsed route object
- router emits `x6:route` events on `window`
- framework listens to `x6:route`, resolves `XxxController`, and calls the resolved view method
- bootstrap namespace is `window.X6` (`window.X6.framework`, `window.X6.router`)
- startup keeps a short delayed bootstrap (`setTimeout`) for race-condition resilience in concatenated builds

## controller file naming

Controller source files use the controller suffix (without `.class`), for example:

- `scripts/controllers/Index.Controller.js`


## javascript template and translation runtime

Template definitions now live in JavaScript files under `templates/`.

- Template files assign multiline HTML template strings directly to `window.TEMPLATES['template.name']`.
- Templates are resolved and rendered through `XTemplate.render(name, params)`.

Translations are JavaScript-based and grouped by locale folder under `translations/`.

- `window.TEMPLATES` is the global template store (array-style object keyed by template name).
- `window.TRANSLATIONS` is the global translation store (array-style object keyed by translation key).
- `XTemplate` renders templates with `{{placeholder}}` replacement.
- `XTranslation` resolves translation strings with `{{placeholder}}` replacement.
- First implementation ships with `translations/de/` as the initial catalog folder.
- A file like `translations/de/_default.js` is loaded first because file paths are sorted alphabetically during bundling.


## template naming convention (views + partials)

Template files inside `templates/` are JavaScript files and can be named freely, but the project convention is:

- Views: `view.<controllername>.<viewname>.js`
  - Example: `view.index.index.js`
  - Template key: `window.TEMPLATES['view.index.index']`
- Layout/partials:
  - `body.js`
  - `header.js`
  - `sidebar.js`
  - `footer.js`
  - optional form templates like `form.login.js`

`body` should provide the shell structure with `header`, `main` (`article` + `aside`), and `footer`.


## ai filename guardrail

For templates/translations, AI-generated files must always use lowercase filenames.

- valid: `templates/view.index.index.js`, `translations/de/_default.js`
- invalid: `templates/View.Index.Index.js`, `templates/Header.js`

If AI creates uppercase names by mistake, they must be renamed to lowercase in the same change before commit.


## link style in templates

Use native links with hash routing in templates:

- Use `href="#!/controller/view"`
- Do not use `data-href` for routing links


## final distribution compiler

A final compiler is available at `compiler/compile_ex_final.php`.

- It concatenates all `dist/*--prod.js` files into `dist/ex_final--prod.js`.
- It concatenates all `dist/*--prod.php` files into `dist/ex_final--prod.php`.
- Run it after other compilers (its filename `compile_ex_final.php` is intended for last-step execution).
