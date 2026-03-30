<?php

class XDBJson
{
    private string $root;
    private string $dbDir;

    public function __construct(array $config = [])
    {
        $this->root = $config['root'] ?? dirname(__DIR__);
        $this->dbDir = rtrim($this->root, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . '_db';

        if (!is_dir($this->dbDir) && !mkdir($this->dbDir, 0777, true) && !is_dir($this->dbDir)) {
            throw new RuntimeException('JSON database directory could not be created: ' . $this->dbDir);
        }
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
        $rows = $this->readTable($table);
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

        return $this->dbDir . DIRECTORY_SEPARATOR . $normalized . '.json';
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
