# x_users.class.md

## role
Plural framework class `x_users` for lists and collections.

## generator schema

- object: `x_users`
- pair: `plural`
- counterpart: `x_user`
- runtime: `x_users.class.php`, `x_users.class.js`
- tests: `x_users.test.php`, `x_users.test.js`

## properties

- collection items are `x_user`-compatible user records.
- standard timestamps: `insert_date`, `update_date`, `delete_date`.
- query filters may include `id`, `username`, `email`, and `hash`.

## methods

- `__construct(int $id = 0)` initializes collection access.
- `load($id = 0)` loads a list or optional object-specific collection state.
- collection lookup helpers support login and duplicate checks by username/email.

## validation rules

- list/query inputs must use safe field names from `models/users.md`.
- duplicate checks must return deterministic results for username/email.
- collection helpers must not expose plain password values.

## persistence

- Persistence and lookups use `XDB` and the `users` model source from `models/users.md`.
- Collection select cache behavior follows the DB abstraction.

## tests

- PHP tests cover collection loading and helper expectations.
- JS tests remain standalone and avoid imports/exports.
- Smoke coverage is provided by `compiler/smoke_database.php`.

## php rules
- never use `declare(strict_types=1);`
- never use `final class`
- PHP files must start with `<?php` and end with `?>`
- no `include`, `include_once`, `require`, or `require_once` in PHP class files
- constructor signature must be `public function __construct(int $id = 0)`
- runtime cache: `$_CACHE`
- cache keys may be built directly with `json_encode(...)`

## js rules
- no `import` and no exports
- runtime cache: `_CACHE`
- `load(id)` runs asynchronously with `await` for future API list requests

## standard data fields
- `insert_date` (Unix timestamp in seconds)
- `update_date` (Unix timestamp in seconds)
- `delete_date` (Unix timestamp in seconds)

## authentication collection contract
- workflow: `users.registration`
- must define list/query behavior needed by login and registration lookups
- must define lookup by username/email for duplicate checks
- must define collection-level helpers used by registration/login orchestration
