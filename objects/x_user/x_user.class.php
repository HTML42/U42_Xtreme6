<?php

class XUser
{
    public static array $_CACHE = [];

    public int $id = 0;
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
?>
