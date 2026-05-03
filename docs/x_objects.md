# x_objects.md

## role of this file

This document is the **detailed object modeling reference** for xtreme6.

- `agents.md` defines the mandatory overview and precedence.
- this file explains how objects must be authored and structured.
- if any detail here conflicts with `agents.md`, `agents.md` wins.

## singular/plural is mandatory

Each domain concept must be modeled as a pair:

- singular object: one entity, for example `x_user`
- plural object: a collection/list, for example `x_users`

Never create only one side of the pair.

## markdown-only authoring principle

The human author describes behavior in markdown. AI generates runtime code.

- do not treat `.class.php` / `.class.js` as primary design documents.
- describe object capabilities in `.class.md` with enough detail to generate methods, validations, and test expectations.
- avoid static example datasets in runtime files; describe behavior and data contracts instead.

## feature-first decision rule

Before creating a new object pair:

1. check whether the feature fits into an existing object
2. only create a new object pair if the existing model is not sufficient

This keeps the domain model compact and avoids unnecessary object growth.

## required file set per object

Each object requires exactly 5 files:

1. `<name>.class.md`
2. `<name>.class.php`
3. `<name>.class.js`
4. `<name>.test.php`
5. `<name>.test.js`

Because singular and plural are both required, a new domain concept usually adds **10 files**.

## source of truth

The `.class.md` file is the source of truth.

That means:

- define behavior there first
- update requirements there first
- derive runtime and test files from it

Generated PHP, JavaScript, and test files should not be treated as the primary business specification.

## object generator contract

Object generation is specified MD-first and checked before release.

Canonical flow:

1. update `objects/<object>/<object>.class.md`
2. run `php compiler/check_md_first.php`
3. review `php compiler/report_object_generation.php`
4. run `php compiler/compile_objects.php`

Every object MD must expose a machine-readable-ish `## generator schema` section with these keys:

- `object`: object name, e.g. `x_user`
- `pair`: `singular` or `plural`
- `counterpart`: required paired object, e.g. `x_users`
- `runtime`: generated/maintained runtime artifacts
- `tests`: generated/maintained test artifacts

Required object-MD sections:

- `## role`
- `## generator schema`
- `## properties`
- `## methods`
- `## validation rules`
- `## persistence`
- `## tests`

`compiler/check_md_first.php` enforces that each object has both singular and plural directories/MD files according to `XPluralize`.

`compiler/report_object_generation.php` prints an object runtime diff/readiness report before files are generated or overwritten.

## singular object expectations

A singular object typically represents one record or one entity.

Example: `x_user`

Typical characteristics:

- has an `id`
- can load itself by identifier
- represents one entity state

## plural object expectations

A plural object typically represents a collection of singular objects.

Example: `x_users`

Typical characteristics:

- loads a list or collection
- may delegate single-item loading to the singular class
- represents list-oriented access patterns

## authentication capability example (user/users)

If a project requires authentication and `x_user`/`x_users` is used:

- the markdown spec must explicitly describe login and registration flows.
- required login behavior includes username/password input contract, DB check contract, and result handling contract (success/failure states).
- required registration behavior includes input validation contract (username/email/password), persistence contract, and post-registration login/redirect contract.

These behaviors are documented in markdown and then generated into both runtime classes and tests.

## object file authoring rules

### markdown files

- write rules and behavior in English
- use `x_` naming consistently in examples and identifiers
- describe required methods, required fields, and prohibited methods explicitly

### php object files

- no `include`/`require` statements
- constructor signature must remain `public function __construct(int $id = 0)`
- use `$_CACHE` for runtime caching when caching is needed

### js object files

- no `import`
- no `require`
- no exports
- use `_CACHE` for runtime caching when caching is needed

### test files

- keep comments and placeholders in English
- do not add include/require/module import statements to object test source files

## standard data fields

The current baseline model uses these common fields:

- `id` for singular objects
- `insert_date`
- `update_date`
- `delete_date`

Timestamp fields use Unix seconds.

## pluralization helper

Framework-level word transformation belongs in `x/x_pluralize.class.php`.

Use that helper when singular/plural naming must be derived programmatically.
