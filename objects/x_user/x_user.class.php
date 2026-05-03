<?php

class XUser
{
    public static array $_CACHE = [];

    public int $id = 0;
    public bool $login = false;
    public string $username = '';
    public string $password = '';
    public string $email = '';
    public string $hash = '';
    public int $validate_date = 0;
    public int $lastlogin_date = 0;
    public int $insert_date = 0;
    public int $update_date = 0;
    public int $delete_date = 0;

    public function __construct(int $id = 0)
    {
        $this->id = $id;
    }

    public static function load($identification = null): self
    {
        if (is_int($identification) || (is_string($identification) && is_numeric($identification))) {
            return self::load_by_id((int) $identification);
        }

        if (is_string($identification)) {
            return self::load_by_name($identification);
        }

        return new self();
    }

    public static function load_by_id(int $id): self
    {
        if ($id < 1) {
            return new self();
        }

        $cacheKey = json_encode(['id' => $id]);
        if (isset(self::$_CACHE[$cacheKey])) {
            return self::$_CACHE[$cacheKey];
        }

        $rows = $GLOBALS['XDB']->select('users', ['id' => $id]);
        if ($rows === []) {
            return new self();
        }

        $user = self::from_row($rows[0]);
        self::$_CACHE[$cacheKey] = $user;
        return $user;
    }

    public static function load_by_name(string $name): self
    {
        $normalizedName = trim(strtolower($name));
        if ($normalizedName === '') {
            return new self();
        }

        $cacheKey = json_encode(['name' => $normalizedName]);
        if (isset(self::$_CACHE[$cacheKey])) {
            return self::$_CACHE[$cacheKey];
        }

        $rows = $GLOBALS['XDB']->select('users', ['username' => $normalizedName]);
        if ($rows === []) {
            return new self();
        }

        $user = self::from_row($rows[0]);
        self::$_CACHE[$cacheKey] = $user;
        return $user;
    }

    public static function register(array $payload): array
    {
        $username = trim(strtolower((string) ($payload['username'] ?? '')));
        $email = trim(strtolower((string) ($payload['email'] ?? '')));
        $password = (string) ($payload['password'] ?? '');
        $password2 = (string) ($payload['password2'] ?? '');

        $errors = [];
        if ($username === '') {
            $errors['username'] = 'username is required';
        }
        if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'] = 'email is invalid';
        }
        if ($password === '') {
            $errors['password'] = 'password is required';
        }
        if ($password !== $password2) {
            $errors['password2'] = 'password confirmation mismatch';
        }

        if (XUsers::exists_by_username($username)) {
            $errors['username'] = 'username already exists';
        }

        if (XUsers::exists_by_email($email)) {
            $errors['email'] = 'email already exists';
        }

        if ($errors !== []) {
            return ['success' => false, 'status' => 422, 'response' => null, 'errors' => $errors];
        }

        $now = time();
        $row = [
            'username' => $username,
            'email' => $email,
            'password' => password_hash($password, PASSWORD_DEFAULT),
            'validate_date' => null,
            'lastlogin_date' => null,
            'hash' => strtoupper(substr(sha1(uniqid((string) mt_rand(), true)), 0, 10)),
            'insert_date' => $now,
            'update_date' => $now,
            'delete_date' => null,
        ];

        $inserted = $GLOBALS['XDB']->insert('users', $row);

        return [
            'success' => true,
            'status' => 200,
            'response' => [
                'id' => (int) ($inserted['id'] ?? 0),
                'username' => (string) ($inserted['username'] ?? ''),
                'email' => (string) ($inserted['email'] ?? ''),
                'hash' => (string) ($inserted['hash'] ?? ''),
            ],
            'errors' => [],
        ];
    }

    public static function login(string $username, string $password): array
    {
        $normalizedUsername = trim(strtolower($username));
        if ($normalizedUsername === '' || $password === '') {
            $errors = [];
            if ($normalizedUsername === '') {
                $errors['username'] = 'username is required';
            }
            if ($password === '') {
                $errors['password'] = 'password is required';
            }

            return [
                'success' => false,
                'status' => 422,
                'response' => null,
                'errors' => $errors,
            ];
        }

        $user = self::load_by_name($normalizedUsername);
        if ($user->id < 1) {
            return ['success' => false, 'status' => 401, 'response' => null, 'errors' => ['credentials' => 'invalid login']];
        }

        if (!password_verify($password, $user->password)) {
            return ['success' => false, 'status' => 401, 'response' => null, 'errors' => ['credentials' => 'invalid login']];
        }

        $now = time();
        $GLOBALS['XDB']->update('users', ['id' => $user->id], ['lastlogin_date' => $now]);

        return [
            'success' => true,
            'status' => 200,
            'response' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'hash' => $user->hash,
                'lastlogin_date' => $now,
            ],
            'errors' => [],
        ];
    }

    private static function from_row(array $row): self
    {
        $user = new self((int) ($row['id'] ?? 0));
        $user->login = $user->id > 0;
        $user->username = (string) ($row['username'] ?? '');
        $user->password = (string) ($row['password'] ?? '');
        $user->email = (string) ($row['email'] ?? '');
        $user->hash = (string) ($row['hash'] ?? '');
        $user->validate_date = (int) ($row['validate_date'] ?? 0);
        $user->lastlogin_date = (int) ($row['lastlogin_date'] ?? 0);
        $user->insert_date = (int) ($row['insert_date'] ?? 0);
        $user->update_date = (int) ($row['update_date'] ?? 0);
        $user->delete_date = (int) ($row['delete_date'] ?? 0);
        return $user;
    }

    public static function clear_cache(): void
    {
        self::$_CACHE = [];
    }
}
?>
