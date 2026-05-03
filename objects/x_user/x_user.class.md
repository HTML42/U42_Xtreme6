# x_user.class.md

## role
Singular framework class `x_user`.

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
