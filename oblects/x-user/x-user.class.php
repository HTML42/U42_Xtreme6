<?php

declare(strict_types=1);

final class XUser
{
    /** @var array<string, self> */
    public static array $_CACHE = [];

    /** @var array<int, array{id:int,name:string,email:string,active:bool}> */
    private static array $DATA = [
        1 => ['id' => 1, 'name' => 'Ada Lovelace', 'email' => 'ada@example.com', 'active' => true],
        2 => ['id' => 2, 'name' => 'Grace Hopper', 'email' => 'grace@example.com', 'active' => true],
    ];

    public int $id;
    public string $name;
    public string $email;
    public bool $active;

    public function __construct(int $id = 0, string $name = '', string $email = '', bool $active = true)
    {
        $this->id = $id;
        $this->name = trim($name);
        $this->email = trim($email);
        $this->active = $active;

        if ($this->id > 0 || $this->name !== '' || $this->email !== '') {
            $this->validate();
        }
    }

    public static function load(mixed $identification = null): self
    {
        if (is_int($identification) || (is_string($identification) && is_numeric($identification))) {
            return self::load_by_id((int)$identification);
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

        $cache_key = self::cache_key('id', (string)$id);
        if (isset(self::$_CACHE[$cache_key])) {
            return self::$_CACHE[$cache_key];
        }

        if (!isset(self::$DATA[$id])) {
            return new self();
        }

        $row = self::$DATA[$id];
        $user = new self($row['id'], $row['name'], $row['email'], $row['active']);
        self::$_CACHE[$cache_key] = $user;
        self::$_CACHE[self::cache_key('name', mb_strtolower($user->name))] = $user;

        return $user;
    }

    public static function load_by_name(string $name): self
    {
        $normalized_name = mb_strtolower(trim($name));
        if ($normalized_name === '') {
            return new self();
        }

        $cache_key = self::cache_key('name', $normalized_name);
        if (isset(self::$_CACHE[$cache_key])) {
            return self::$_CACHE[$cache_key];
        }

        foreach (self::$DATA as $row) {
            if (mb_strtolower($row['name']) !== $normalized_name) {
                continue;
            }

            $user = new self($row['id'], $row['name'], $row['email'], $row['active']);
            self::$_CACHE[$cache_key] = $user;
            self::$_CACHE[self::cache_key('id', (string)$user->id)] = $user;

            return $user;
        }

        return new self();
    }

    public static function clear_cache(): void
    {
        self::$_CACHE = [];
    }

    public function update(?string $name = null, ?string $email = null, ?bool $active = null): self
    {
        if ($name !== null) {
            $this->name = trim($name);
        }

        if ($email !== null) {
            $this->email = trim($email);
        }

        if ($active !== null) {
            $this->active = $active;
        }

        $this->validate();
        return $this;
    }

    public function toarray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'active' => $this->active,
        ];
    }

    private static function cache_key(string $type, string $value): string
    {
        return $type . ':' . $value;
    }

    private function validate(): void
    {
        if ($this->id < 1) {
            throw new InvalidArgumentException('id muss > 0 sein');
        }

        if (mb_strlen($this->name) < 2) {
            throw new InvalidArgumentException('name muss mindestens 2 zeichen haben');
        }

        if (!str_contains($this->email, '@')) {
            throw new InvalidArgumentException('email ist ungültig');
        }
    }
}
