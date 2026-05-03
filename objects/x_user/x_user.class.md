# x_user.class.md

## role
Singular framework class `x_user`.

## generator schema

- object: `x_user`
- pair: `singular`
- counterpart: `x_users`
- runtime: `x_user.class.php`, `x_user.class.js`
- tests: `x_user.test.php`, `x_user.test.js`

## properties

- `id`: integer identifier.
- `insert_date`: Unix timestamp in seconds.
- `update_date`: Unix timestamp in seconds.
- `delete_date`: Unix timestamp in seconds.
- `username`: normalized lowercase login name.
- `email`: normalized email address.
- `hash`: public user hash.
- `password`: stored password hash only, never plain text.
- `lastlogin_date`: Unix timestamp of last successful login.

## methods

- `__construct(int $id = 0)` initializes optional object loading.
- `load($identification = null)` loads by supported identifier.
- `load_by_id($id)` loads by numeric id.
- `load_by_name($name)` loads by username/name.
- `login($username, $password)` validates credentials and returns standard result data.
- `registration($username, $email, $password, $password2)` validates and persists a new user.

## validation rules

- username is required and normalized lowercase.
- email is required and must be a valid email format.
- password is required for login/registration inputs.
- password2 must match password during registration.
- duplicate username/email is rejected through `x_users` lookup helpers.

## persistence

- Persistence uses `XDB` and the `users` model source from `models/users.md`.
- Select cache invalidation is handled by the DB abstraction after write operations.

## tests

- PHP tests cover load/login/registration expectations.
- JS tests remain standalone and avoid imports/exports.
- Smoke coverage is provided by `compiler/smoke_database.php`.

## php rules
- never use `declare(strict_types=1);`
- never use `final class`
- PHP files must start with `<?php` and end with `?>`
- no `include`, `include_once`, `require`, or `require_once` in PHP class files
- constructor signature must be `public function __construct(int $id = 0)`
- required methods:
  - `load($identification = null)`
  - `load_by_id($id)`
  - `load_by_name($name)`
- runtime cache: `$_CACHE`
- cache keys may be built directly with `json_encode(...)`

## js rules
- no `import` and no exports
- runtime cache: `_CACHE`
- use only `load(id)` as the async loading entry point for future API requests

## standard data fields
- `id`
- `insert_date` (Unix timestamp in seconds)
- `update_date` (Unix timestamp in seconds)
- `delete_date` (Unix timestamp in seconds)

## excluded methods and patterns
- no `update()`
- no `toarray()`
- no `validate()` method
- no static seed array with example data

## authentication extension contract
- workflow: `users.registration`
- login flow must be spec-driven here (input: username + password)
- must define DB check behavior for credential match/mismatch
- must define structured result payload for success/error
- registration flow must define required fields: username, email, password, password2
- must define password confirmation validation and duplicate-user checks
