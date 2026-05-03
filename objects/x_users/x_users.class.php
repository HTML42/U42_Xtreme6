<?php

class XUsers
{
    public static array $_CACHE = [];

    public int $insert_date = 0;
    public int $update_date = 0;
    public int $delete_date = 0;

    public function __construct(int $id = 0)
    {
        // The id is currently not used in plural objects, but it remains part of the standard signature.
    }

    public static function load($identification = null): array
    {
        $cacheKey = json_encode(['load' => $identification]);
        if (isset(self::$_CACHE[$cacheKey])) {
            return self::$_CACHE[$cacheKey];
        }

        $rows = [];
        if ($identification === null) {
            $rows = $GLOBALS['XDB']->select('users');
        } elseif (is_int($identification) || (is_string($identification) && is_numeric($identification))) {
            $rows = $GLOBALS['XDB']->select('users', ['id' => (int) $identification]);
        }

        $users = [];
        foreach ($rows as $row) {
            $users[] = [
                'id' => (int) ($row['id'] ?? 0),
                'username' => (string) ($row['username'] ?? ''),
                'email' => (string) ($row['email'] ?? ''),
                'hash' => (string) ($row['hash'] ?? ''),
            ];
        }

        self::$_CACHE[$cacheKey] = $users;
        return $users;
    }

    public static function exists_by_username(string $username): bool
    {
        if (trim($username) === '') {
            return false;
        }

        $rows = $GLOBALS['XDB']->select('users', ['username' => strtolower(trim($username))]);
        return $rows !== [];
    }

    public static function exists_by_email(string $email): bool
    {
        if (trim($email) === '') {
            return false;
        }

        $rows = $GLOBALS['XDB']->select('users', ['email' => strtolower(trim($email))]);
        return $rows !== [];
    }

    public static function clear_cache(): void
    {
        self::$_CACHE = [];
    }
}
?>
