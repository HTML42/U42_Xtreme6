<?php

class XDB
{
    private static ?XDB $instance = null;
    private object $driver;
    private string $engine;
    private string $root;
    private string $dbDir;
    private string $cacheDir;
    private array $models = [];

    private function __construct()
    {
        $this->root = dirname(__DIR__);
        $this->dbDir = rtrim($this->root, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '_db';
        $this->cacheDir = $this->dbDir . DIRECTORY_SEPARATOR . 'cache';

        $this->ensureDbDirectories();
        $this->models = $this->loadModels();

        $configPath = $this->root . DIRECTORY_SEPARATOR . 'config.json';
        $config = is_file($configPath)
            ? (json_decode((string) file_get_contents($configPath), true) ?: [])
            : [];

        $engine = strtolower((string) ($config['Database'] ?? 'json'));

        if ($engine === 'json') {
            $this->driver = new XDBJson([
                'root' => $this->root,
                'models' => $this->models,
            ]);
            $this->engine = 'json';
            return;
        }

        if ($engine === 'mysql') {
            $dbPath = $this->root . DIRECTORY_SEPARATOR . '_db.json';
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

            $this->driver = new XDBMysql($dbConfig, $this->models);
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

    private function ensureDbDirectories(): void
    {
        foreach ([$this->dbDir, $this->cacheDir] as $dir) {
            if (!is_dir($dir) && !mkdir($dir, 0777, true) && !is_dir($dir)) {
                throw new RuntimeException('Directory could not be created: ' . $dir);
            }
        }
    }

    private function loadModels(): array
    {
        $modelsDir = $this->root . DIRECTORY_SEPARATOR . 'models';
        if (!is_dir($modelsDir)) {
            return [];
        }

        $modelFiles = glob($modelsDir . DIRECTORY_SEPARATOR . '*.md') ?: [];
        $models = [];

        foreach ($modelFiles as $file) {
            if (!is_file($file)) {
                continue;
            }

            $model = $this->parseModelFile($file);
            if (!is_array($model) || ($model['table'] ?? '') === '') {
                continue;
            }

            $models[$model['table']] = $model;
        }

        return $models;
    }

    private function parseModelFile(string $file): array
    {
        $tableName = strtolower((string) pathinfo($file, PATHINFO_FILENAME));
        $content = (string) file_get_contents($file);
        $lines = preg_split('/\r\n|\r|\n/', $content) ?: [];

        $fields = [];
        $currentField = null;

        foreach ($lines as $line) {
            $trimmed = trim($line);

            if (preg_match('/^###\s+([a-z0-9_]+)\s*$/i', $trimmed, $match) === 1) {
                $currentField = strtolower($match[1]);
                $fields[$currentField] = [];
                continue;
            }

            if ($currentField === null) {
                continue;
            }

            if (preg_match('/^-\s*([a-z_]+)\s*:\s*(.+)$/i', $trimmed, $match) === 1) {
                $key = strtolower(trim($match[1]));
                $value = trim($match[2]);
                $value = trim($value, "` ");
                $fields[$currentField][$key] = $value;
            }
        }

        return [
            'table' => $tableName,
            'fields' => $fields,
        ];
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

if (!isset($GLOBALS['XDB']) || !($GLOBALS['XDB'] instanceof XDB)) {
    $GLOBALS['XDB'] = XDB::instance();
}
?>
