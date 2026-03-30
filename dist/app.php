<?php

/* DIST SOURCE: objects--prod.php */
/* SOURCE: objects\x_user\x_user.class.php */
class XUser
{
    public static array $_CACHE = [];

    public int $id = 0;
    public bool $login = false;
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

        $cache_key = json_encode(['id' => $id]);
        if (isset(self::$_CACHE[$cache_key])) {
            return self::$_CACHE[$cache_key];
        }

        $user = new self($id);
        $user->login = true;
        $now = time();
        $user->insert_date = $now;
        $user->update_date = $now;
        $user->delete_date = 0;

        self::$_CACHE[$cache_key] = $user;
        return $user;
    }

    public static function load_by_name(string $name): self
    {
        $normalized_name = trim(strtolower($name));
        if ($normalized_name === '') {
            return new self();
        }

        $cache_key = json_encode(['name' => $normalized_name]);
        if (isset(self::$_CACHE[$cache_key])) {
            return self::$_CACHE[$cache_key];
        }

        $user = new self();
        $now = time();
        $user->insert_date = $now;
        $user->update_date = $now;
        $user->delete_date = 0;

        self::$_CACHE[$cache_key] = $user;
        return $user;
    }

    public static function clear_cache(): void
    {
        self::$_CACHE = [];
    }
}


/* SOURCE: objects\x_users\x_users.class.php */
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
        $cache_key = json_encode(['load' => $identification]);
        if (isset(self::$_CACHE[$cache_key])) {
            return self::$_CACHE[$cache_key];
        }

        $list = [];
        if (is_int($identification) || (is_string($identification) && is_numeric($identification))) {
            $loaded = XUser::load_by_id((int) $identification);
            if ($loaded->id > 0) {
                $list[] = $loaded;
            }
        }

        self::$_CACHE[$cache_key] = $list;
        return $list;
    }

    public static function clear_cache(): void
    {
        self::$_CACHE = [];
    }
}

$x6_public_config = [];
$config_path = dirname(__DIR__) . '/config.json';
if (is_file($config_path)) {
    $decoded = json_decode((string) file_get_contents($config_path), true);
    if (is_array($decoded) && isset($decoded['Language'])) {
        $x6_public_config['Language'] = $decoded['Language'];
    }
}

?><!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Xtreme-Webframework Version 6</title>
  <link rel="stylesheet" href="./styles.css">
  <script>window.X6_CONFIG = <?php echo json_encode($x6_public_config, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>;</script>
  <script src="./app.js" defer></script>
</head>
<body></body>
</html>
