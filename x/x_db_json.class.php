<?php

class XDBJson
{
    private string $root;
    private string $dbDir;
    private string $tablesDir;
    private string $metaPath;
    private array $models;

    public function __construct(array $config = [])
    {
        $this->root = $config['root'] ?? dirname(__DIR__);
        $this->dbDir = rtrim($this->root, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '_db';
        $this->tablesDir = $this->dbDir . DIRECTORY_SEPARATOR . 'tables';
        $this->metaPath = $this->dbDir . DIRECTORY_SEPARATOR . 'meta.json';
        $this->models = is_array($config['models'] ?? null) ? $config['models'] : [];

        $this->ensureStorage();
        $this->ensureModelTables();
    }

    public function select(string $table, array $where = []): array
    {
        $rows = $this->readTable($table);
        if ($where === []) {
            return $rows;
        }

        return array_values(array_filter($rows, static function ($row) use ($where): bool {
            if (!is_array($row)) {
                return false;
            }

            foreach ($where as $key => $value) {
                if (!array_key_exists($key, $row) || $row[$key] !== $value) {
                    return false;
                }
            }

            return true;
        }));
    }

    public function insert(string $table, array $row): array
    {
        $now = time();
        $rows = $this->readTable($table);

        if (!array_key_exists('id', $row) || !is_numeric($row['id'])) {
            $row['id'] = $this->nextId($table);
        } else {
            $this->touchTableIndex($table, (int) $row['id']);
        }

        if (!array_key_exists('insert_date', $row)) {
            $row['insert_date'] = $now;
        }
        if (!array_key_exists('update_date', $row)) {
            $row['update_date'] = null;
        }
        if (!array_key_exists('delete_date', $row)) {
            $row['delete_date'] = null;
        }

        $rows[] = $row;
        $this->writeTable($table, $rows);
        return $row;
    }

    public function update(string $table, array $where, array $data): int
    {
        $rows = $this->readTable($table);
        $updated = 0;

        foreach ($rows as $index => $row) {
            if (!is_array($row)) {
                continue;
            }

            $matches = true;
            foreach ($where as $key => $value) {
                if (!array_key_exists($key, $row) || $row[$key] !== $value) {
                    $matches = false;
                    break;
                }
            }

            if (!$matches) {
                continue;
            }

            if (!array_key_exists('update_date', $data)) {
                $data['update_date'] = time();
            }
            $rows[$index] = array_merge($row, $data);
            $updated += 1;
        }

        if ($updated > 0) {
            $this->writeTable($table, $rows);
        }

        return $updated;
    }

    public function delete(string $table, array $where): int
    {
        $rows = $this->readTable($table);
        $kept = [];
        $deleted = 0;

        foreach ($rows as $row) {
            if (!is_array($row)) {
                $kept[] = $row;
                continue;
            }

            $matches = true;
            foreach ($where as $key => $value) {
                if (!array_key_exists($key, $row) || $row[$key] !== $value) {
                    $matches = false;
                    break;
                }
            }

            if ($matches) {
                $deleted += 1;
                continue;
            }

            $kept[] = $row;
        }

        if ($deleted > 0) {
            $this->writeTable($table, $kept);
        }

        return $deleted;
    }

    private function tablePath(string $table): string
    {
        $normalized = strtolower(trim($table));
        if ($normalized === '' || preg_match('/^[a-z0-9_]+$/', $normalized) !== 1) {
            throw new InvalidArgumentException('Invalid JSON table name: ' . $table);
        }

        return $this->tablesDir . DIRECTORY_SEPARATOR . $normalized . '.json';
    }

    private function ensureStorage(): void
    {
        foreach ([$this->dbDir, $this->tablesDir] as $dir) {
            if (!is_dir($dir) && !mkdir($dir, 0777, true) && !is_dir($dir)) {
                throw new RuntimeException('JSON database directory could not be created: ' . $dir);
            }
        }

        if (!is_file($this->metaPath)) {
            $this->writeMeta(['tables' => []]);
            return;
        }

        $meta = $this->readMeta();
        if (!array_key_exists('tables', $meta) || !is_array($meta['tables'])) {
            $meta['tables'] = [];
            $this->writeMeta($meta);
        }
    }

    private function ensureModelTables(): void
    {
        if ($this->models === []) {
            return;
        }

        foreach ($this->models as $table => $model) {
            $tableName = strtolower(trim((string) $table));
            if ($tableName === '') {
                continue;
            }

            $tablePath = $this->tablePath($tableName);
            if (!is_file($tablePath)) {
                $this->writeTable($tableName, []);
            }

            $this->ensureMetaTableEntry($tableName, $model);
        }
    }

    private function ensureMetaTableEntry(string $table, array $model): void
    {
        $meta = $this->readMeta();
        $current = (int) ($meta['tables'][$table]['current_index'] ?? 0);

        if ($current < 1) {
            $current = $this->detectCurrentIndexFromRows($table);
        }

        if ($current < 1 && isset($model['fields']['id'])) {
            $current = 0;
        }

        $meta['tables'][$table] = [
            'current_index' => $current,
        ];
        $this->writeMeta($meta);
    }

    private function detectCurrentIndexFromRows(string $table): int
    {
        $rows = $this->readTable($table);
        $max = 0;

        foreach ($rows as $row) {
            if (!is_array($row)) {
                continue;
            }

            $id = (int) ($row['id'] ?? 0);
            if ($id > $max) {
                $max = $id;
            }
        }

        return $max;
    }

    private function readMeta(): array
    {
        if (!is_file($this->metaPath)) {
            return ['tables' => []];
        }

        $decoded = json_decode((string) file_get_contents($this->metaPath), true);
        if (!is_array($decoded)) {
            return ['tables' => []];
        }

        if (!array_key_exists('tables', $decoded) || !is_array($decoded['tables'])) {
            $decoded['tables'] = [];
        }

        return $decoded;
    }

    private function writeMeta(array $meta): void
    {
        file_put_contents(
            $this->metaPath,
            json_encode($meta, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
        );
    }

    private function nextId(string $table): int
    {
        $meta = $this->readMeta();
        $tableName = strtolower(trim($table));
        $current = (int) ($meta['tables'][$tableName]['current_index'] ?? 0);
        $next = $current + 1;

        $meta['tables'][$tableName] = [
            'current_index' => $next,
        ];
        $this->writeMeta($meta);

        return $next;
    }

    private function touchTableIndex(string $table, int $id): void
    {
        if ($id < 1) {
            return;
        }

        $meta = $this->readMeta();
        $tableName = strtolower(trim($table));
        $current = (int) ($meta['tables'][$tableName]['current_index'] ?? 0);

        if ($id > $current) {
            $meta['tables'][$tableName] = [
                'current_index' => $id,
            ];
            $this->writeMeta($meta);
        }
    }

    private function readTable(string $table): array
    {
        $path = $this->tablePath($table);
        if (!is_file($path)) {
            return [];
        }

        $decoded = json_decode((string) file_get_contents($path), true);
        if (!is_array($decoded)) {
            return [];
        }

        return $decoded;
    }

    private function writeTable(string $table, array $rows): void
    {
        $path = $this->tablePath($table);
        file_put_contents($path, json_encode(array_values($rows), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
    }
}
?>
