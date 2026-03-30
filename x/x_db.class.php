<?php

class XDB
{
    private static ?XDB $instance = null;
    private object $driver;
    private string $engine;

    private function __construct()
    {
        $root = dirname(__DIR__);
        $configPath = $root . DIRECTORY_SEPARATOR . 'config.json';
        $config = is_file($configPath)
            ? (json_decode((string) file_get_contents($configPath), true) ?: [])
            : [];

        $engine = strtolower((string) ($config['Database'] ?? 'json'));

        if ($engine === 'json') {
            $this->driver = new XDBJson(['root' => $root]);
            $this->engine = 'json';
            return;
        }

        if ($engine === 'mysql') {
            $dbPath = $root . DIRECTORY_SEPARATOR . '_db.json';
            if (!is_file($dbPath)) {
                throw new RuntimeException('MySQL requires environment file: _db.json');
            }

            $dbConfig = json_decode((string) file_get_contents($dbPath), true);
            if (!is_array($dbConfig)) {
                throw new RuntimeException('Invalid _db.json format.');
            }

            $dbEngine = strtolower((string) ($dbConfig['engine'] ?? ''));
            if ($dbEngine !== 'mysql') {
                throw new RuntimeException('_db.json engine must be "mysql" when Database is mysql.');
            }

            $this->driver = new XDBMysql($dbConfig);
            $this->engine = 'mysql';
            return;
        }

        throw new RuntimeException('Unsupported Database engine in config.json. Allowed: "json" or "mysql".');
    }

    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public static function reset(): void
    {
        self::$instance = null;
    }

    public function engine(): string
    {
        return $this->engine;
    }

    public function select(string $table, array $where = []): array
    {
        return $this->driver->select($table, $where);
    }

    public function insert(string $table, array $row): array
    {
        return $this->driver->insert($table, $row);
    }

    public function update(string $table, array $where, array $data): int
    {
        return $this->driver->update($table, $where, $data);
    }

    public function delete(string $table, array $where): int
    {
        return $this->driver->delete($table, $where);
    }
}
?>
