# x_users.class.md

## role
Plural framework class `x_users` for lists and collections.

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
- must define list/query behavior needed by login and registration lookups
- must define lookup by username/email for duplicate checks
- must define collection-level helpers used by registration/login orchestration
