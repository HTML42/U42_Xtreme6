<?php

declare(strict_types=1);

require_once __DIR__ . '/../x-user/x-user.class.php';

final class XUsers
{
    /** @var array<string, array<int, int>> */
    public static array $_CACHE = [];

    /**
     * @param array<string, mixed> $params
     * @return array<int, XUser>
     */
    public static function list(array $params = []): array
    {
        $normalized = self::normalize_params($params);
        $cache_key = self::cache_key('list', $normalized);

        if (isset(self::$_CACHE[$cache_key])) {
            return array_map(static fn (int $id): XUser => XUser::load_by_id($id), self::$_CACHE[$cache_key]);
        }

        $users = [XUser::load_by_id(1), XUser::load_by_id(2)];

        if (isset($normalized['active'])) {
            $active = (bool)$normalized['active'];
            $users = array_values(array_filter($users, static fn (XUser $user): bool => $user->active === $active));
        }

        if (($normalized['sort'] ?? '') === 'name_asc') {
            usort($users, static fn (XUser $a, XUser $b): int => strcmp($a->name, $b->name));
        }

        self::$_CACHE[$cache_key] = array_map(static fn (XUser $user): int => $user->id, $users);
        return $users;
    }

    public static function clear_cache(): void
    {
        self::$_CACHE = [];
    }

    /**
     * @param array<string, mixed> $params
     */
    private static function cache_key(string $method, array $params): string
    {
        return $method . ':' . json_encode($params, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    /**
     * @param array<string, mixed> $params
     * @return array<string, mixed>
     */
    private static function normalize_params(array $params): array
    {
        ksort($params);

        foreach ($params as $key => $value) {
            if (is_array($value)) {
                $params[$key] = self::normalize_params($value);
            }
        }

        return $params;
    }
}
