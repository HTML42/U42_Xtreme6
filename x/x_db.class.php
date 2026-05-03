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
    private int $selectCacheTtl = 60;

    /**
     * In-memory Select-Cache mit Tabellenbezug:
     * [cacheKey => ['expires_at'=>int, 'result'=>array, 'tables'=>string[]]]
     */
    private array $selectCache = [];

    /**
     * Index je Tabelle -> Cache-Keys, um schnell invalidieren zu können.
     * [tableName => [cacheKey => true]]
     */
    private array $tableCacheIndex = [];

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
        $this->selectCacheTtl = max(1, (int) ($config['DatabaseSelectCacheTtl'] ?? 60));

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

            if (preg_match('/^-\s*([a-z_ ]+)\s*:\s*(.+)$/i', $trimmed, $match) === 1) {
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
        $normalizedTable = $this->normalizeTableName($table);
        $whereNormalized = $this->normalizeWhere($where);
        $cacheKey = $this->buildSelectCacheKey($normalizedTable, $whereNormalized);

        if (isset($this->selectCache[$cacheKey])) {
            $entry = $this->selectCache[$cacheKey];
            if ((int) ($entry['expires_at'] ?? 0) >= time()) {
                return (array) ($entry['result'] ?? []);
            }

            $this->forgetCacheKey($cacheKey);
        }

        $result = $this->driver->select($normalizedTable, $whereNormalized);
        $this->storeSelectCache($cacheKey, [$normalizedTable], $result);
        return $result;
    }

    public function insert(string $table, array $row): array
    {
        $normalizedTable = $this->normalizeTableName($table);
        $row = $this->normalizeInsertRow($normalizedTable, $row);
        $this->validateRowAgainstModel($normalizedTable, $row, false, []);
        $inserted = $this->driver->insert($normalizedTable, $row);
        $this->invalidateTableCache($normalizedTable);
        return $inserted;
    }

    public function update(string $table, array $where, array $data): int
    {
        $normalizedTable = $this->normalizeTableName($table);
        if ($data !== []) {
            $this->validateRowAgainstModel($normalizedTable, $data, true, $where);
        }
        $updated = $this->driver->update($normalizedTable, $where, $data);
        if ($updated > 0) {
            $this->invalidateTableCache($normalizedTable);
        }
        return $updated;
    }

    public function delete(string $table, array $where): int
    {
        $normalizedTable = $this->normalizeTableName($table);
        if ($where === []) {
            throw new InvalidArgumentException('Delete without WHERE is not allowed.');
        }
        $deleted = $this->driver->delete($normalizedTable, $where);
        if ($deleted > 0) {
            $this->invalidateTableCache($normalizedTable);
        }
        return $deleted;
    }

    private function normalizeTableName(string $table): string
    {
        return strtolower(trim($table));
    }

    private function normalizeInsertRow(string $table, array $row): array
    {
        $model = $this->models[$table] ?? null;
        if (!is_array($model)) {
            return $row;
        }

        $fields = is_array($model['fields'] ?? null) ? $model['fields'] : [];
        $now = time();
        foreach ($fields as $field => $definition) {
            if (array_key_exists($field, $row)) {
                continue;
            }

            $def = is_array($definition) ? $definition : [];
            if ($field === 'insert_date') {
                $row[$field] = $now;
                continue;
            }

            if ($field === 'update_date' || $field === 'delete_date') {
                $row[$field] = null;
                continue;
            }

            if (array_key_exists('default', $def)) {
                $row[$field] = $this->castModelDefault((string) $def['default']);
            }
        }

        return $row;
    }

    private function castModelDefault(string $value)
    {
        $trimmed = trim($value, "` \t\n\r\0\x0B");
        if (strtolower($trimmed) === 'null') {
            return null;
        }

        if (is_numeric($trimmed)) {
            return str_contains($trimmed, '.') ? (float) $trimmed : (int) $trimmed;
        }

        if (in_array(strtolower($trimmed), ['true', 'false'], true)) {
            return strtolower($trimmed) === 'true';
        }

        return $trimmed;
    }

    private function validateRowAgainstModel(string $table, array $row, bool $partial, array $where): void
    {
        $model = $this->models[$table] ?? null;
        if (!is_array($model)) {
            return;
        }

        $fields = is_array($model['fields'] ?? null) ? $model['fields'] : [];
        $errors = [];

        foreach ($row as $field => $_value) {
            if (!isset($fields[$field])) {
                $errors[$field] = 'field is not defined in model';
            }
        }

        foreach ($fields as $field => $definition) {
            $def = is_array($definition) ? $definition : [];
            $required = strtolower((string) ($def['required'] ?? 'no')) === 'yes';

            if (!$partial && $required && !array_key_exists($field, $row) && strtolower((string) ($def['auto increment'] ?? 'no')) !== 'yes') {
                $errors[$field] = 'field is required by model';
                continue;
            }

            if (!array_key_exists($field, $row)) {
                continue;
            }

            $value = $row[$field];
            $fieldErrors = $this->validateModelFieldValue($field, $value, $def);
            foreach ($fieldErrors as $fieldError) {
                $errors[$field] = $fieldError;
            }

            $isUnique = strtolower((string) ($def['unique'] ?? 'no')) === 'yes';
            if ($isUnique && $value !== null && $value !== '' && !$this->isUniqueModelValue($table, $field, $value, $where)) {
                $errors[$field] = 'field must be unique by model';
            }
        }

        if ($errors !== []) {
            throw new InvalidArgumentException('Model validation failed for ' . $table . ': ' . json_encode($errors, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
        }
    }

    private function validateModelFieldValue(string $field, $value, array $def): array
    {
        $errors = [];
        $type = strtolower((string) ($def['type'] ?? 'string'));
        $nullable = str_contains($type, 'null') || strtolower((string) ($def['required'] ?? 'no')) !== 'yes';

        if ($value === null) {
            return $nullable ? [] : ['field must not be null'];
        }

        if (str_contains($type, 'int') && !is_int($value)) {
            if (is_string($value) && preg_match('/^-?\d+$/', $value) === 1) {
                return [];
            }
            $errors[] = 'field must be int';
        }

        if (str_contains($type, 'string') && !is_string($value)) {
            $errors[] = 'field must be string';
        }

        if ($type === 'bool' && !is_bool($value)) {
            $errors[] = 'field must be bool';
        }

        if ($type === 'float' && !is_float($value) && !is_int($value)) {
            $errors[] = 'field must be float';
        }

        if (is_string($value)) {
            $length = strlen($value);
            if (isset($def['min']) && is_numeric($def['min']) && $length < (int) $def['min']) {
                $errors[] = 'field is shorter than model min';
            }
            if (isset($def['max']) && is_numeric($def['max']) && $length > (int) $def['max']) {
                $errors[] = 'field is longer than model max';
            }
        }

        $format = strtolower((string) ($def['format'] ?? ''));
        if ($format === 'email' && !filter_var((string) $value, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'field must be valid email';
        }
        if (str_contains($format, 'exactly 10 characters') && preg_match('/^[A-Z0-9]{10}$/', (string) $value) !== 1) {
            $errors[] = 'field must match 10 uppercase characters';
        }
        if (str_contains($format, 'password hash') && is_string($value) && password_get_info($value)['algo'] === 0) {
            $errors[] = 'field must be password hash';
        }

        if (isset($def['enum'])) {
            $allowed = array_map('trim', explode(',', (string) $def['enum']));
            if (!in_array((string) $value, $allowed, true)) {
                $errors[] = 'field must match enum';
            }
        }

        return $errors;
    }

    private function isUniqueModelValue(string $table, string $field, $value, array $where): bool
    {
        $existingRows = $this->driver->select($table, [$field => $value]);
        if ($existingRows === []) {
            return true;
        }

        foreach ($existingRows as $row) {
            if (!is_array($row) || !$this->rowMatchesWhere($row, $where)) {
                return false;
            }
        }

        return true;
    }

    private function rowMatchesWhere(array $row, array $where): bool
    {
        if ($where === []) {
            return false;
        }

        foreach ($where as $field => $value) {
            if (!array_key_exists($field, $row) || $row[$field] !== $value) {
                return false;
            }
        }

        return true;
    }

    private function normalizeWhere(array $where): array
    {
        if ($where === []) {
            return [];
        }

        ksort($where);
        return $where;
    }

    private function buildSelectCacheKey(string $table, array $where): string
    {
        return sha1(json_encode([
            'table' => $table,
            'where' => $where,
            'engine' => $this->engine,
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }

    private function storeSelectCache(string $cacheKey, array $tables, array $result): void
    {
        $this->selectCache[$cacheKey] = [
            'expires_at' => time() + $this->selectCacheTtl,
            'result' => $result,
            'tables' => $tables,
        ];

        foreach ($tables as $table) {
            $normalizedTable = $this->normalizeTableName((string) $table);
            if (!isset($this->tableCacheIndex[$normalizedTable])) {
                $this->tableCacheIndex[$normalizedTable] = [];
            }
            $this->tableCacheIndex[$normalizedTable][$cacheKey] = true;
        }
    }

    private function invalidateTableCache(string $table): void
    {
        $normalizedTable = $this->normalizeTableName($table);
        $keys = array_keys($this->tableCacheIndex[$normalizedTable] ?? []);

        foreach ($keys as $cacheKey) {
            $this->forgetCacheKey((string) $cacheKey);
        }

        $this->tableCacheIndex[$normalizedTable] = [];
    }

    private function forgetCacheKey(string $cacheKey): void
    {
        if (!isset($this->selectCache[$cacheKey])) {
            return;
        }

        $tables = (array) ($this->selectCache[$cacheKey]['tables'] ?? []);
        unset($this->selectCache[$cacheKey]);

        foreach ($tables as $table) {
            $normalizedTable = $this->normalizeTableName((string) $table);
            if (isset($this->tableCacheIndex[$normalizedTable][$cacheKey])) {
                unset($this->tableCacheIndex[$normalizedTable][$cacheKey]);
            }
        }
    }
}

if (!isset($GLOBALS['XDB']) || !($GLOBALS['XDB'] instanceof XDB)) {
    $GLOBALS['XDB'] = XDB::instance();
}
?>
