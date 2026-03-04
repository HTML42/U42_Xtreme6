<?php

class XUsers
{
    public static array $_CACHE = [];

    public int $insert_date = 0;
    public int $update_date = 0;
    public int $delete_date = 0;

    public function __construct(int $id = 0)
    {
        // id wird in plural-objekten aktuell nicht verwendet, bleibt aber als standard-signatur erhalten.
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
?>
