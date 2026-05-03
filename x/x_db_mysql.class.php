<?php

class XDBMysql
{
    private PDO $pdo;
    private array $models;

    public function __construct(array $config, array $models = [])
    {
        $this->models = $models;

        foreach (['database', 'user', 'password'] as $required) {
            if (!isset($config[$required]) || $config[$required] === '') {
                throw new RuntimeException('Missing MySQL config key: ' . $required);
            }
        }

        $host = $config['host'] ?? '127.0.0.1';
        $port = (int) ($config['port'] ?? 3306);
        $charset = $config['charset'] ?? 'utf8';
        $collation = $config['collation'] ?? 'utf8_general_ci';

        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=%s', $host, $port, $config['database'], $charset);

        try {
            $this->pdo = new PDO($dsn, (string) $config['user'], (string) $config['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (Throwable $e) {
            throw new RuntimeException('MySQL connection failed: ' . $e->getMessage(), 0, $e);
        }

        $this->pdo->exec('SET NAMES ' . $charset . ' COLLATE ' . $collation);
        $this->syncTablesFromModels();
    }

    public function select(string $table, array $where = []): array
    {
        $tableName = $this->safeTable($table);
        [$whereSql, $params] = $this->buildWhere($where);

        $stmt = $this->pdo->prepare('SELECT * FROM `' . $tableName . '`' . $whereSql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function insert(string $table, array $row): array
    {
        if ($row === []) {
            throw new InvalidArgumentException('Insert row must not be empty.');
        }

        $tableName = $this->safeTable($table);
        $columns = [];
        $placeholders = [];
        $params = [];

        foreach ($row as $key => $value) {
            $column = $this->safeColumn((string) $key);
            $columns[] = '`' . $column . '`';
            $placeholder = ':v_' . $column;
            $placeholders[] = $placeholder;
            $params[$placeholder] = $value;
        }

        $sql = 'INSERT INTO `' . $tableName . '` (' . implode(', ', $columns) . ') VALUES (' . implode(', ', $placeholders) . ')';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        if (!array_key_exists('id', $row)) {
            $row['id'] = (int) $this->pdo->lastInsertId();
        }

        return $row;
    }

    public function update(string $table, array $where, array $data): int
    {
        if ($data === []) {
            return 0;
        }

        $tableName = $this->safeTable($table);
        $set = [];
        $params = [];

        foreach ($data as $key => $value) {
            $column = $this->safeColumn((string) $key);
            $placeholder = ':set_' . $column;
            $set[] = '`' . $column . '` = ' . $placeholder;
            $params[$placeholder] = $value;
        }

        [$whereSql, $whereParams] = $this->buildWhere($where);
        $sql = 'UPDATE `' . $tableName . '` SET ' . implode(', ', $set) . $whereSql;

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params + $whereParams);

        return $stmt->rowCount();
    }

    public function delete(string $table, array $where): int
    {
        $tableName = $this->safeTable($table);
        [$whereSql, $params] = $this->buildWhere($where);

        if ($whereSql === '') {
            throw new InvalidArgumentException('Delete without WHERE is not allowed.');
        }

        $stmt = $this->pdo->prepare('DELETE FROM `' . $tableName . '`' . $whereSql);
        $stmt->execute($params);

        return $stmt->rowCount();
    }

    private function buildWhere(array $where): array
    {
        if ($where === []) {
            return ['', []];
        }

        $parts = [];
        $params = [];

        foreach ($where as $key => $value) {
            $column = $this->safeColumn((string) $key);
            $placeholder = ':w_' . $column;
            $parts[] = '`' . $column . '` = ' . $placeholder;
            $params[$placeholder] = $value;
        }

        return [' WHERE ' . implode(' AND ', $parts), $params];
    }

    private function safeTable(string $name): string
    {
        return $this->safeIdentifier($name, 'table');
    }

    private function safeColumn(string $name): string
    {
        return $this->safeIdentifier($name, 'column');
    }

    private function safeIdentifier(string $name, string $type): string
    {
        $normalized = strtolower(trim($name));
        if ($normalized === '' || preg_match('/^[a-z0-9_]+$/', $normalized) !== 1) {
            throw new InvalidArgumentException('Invalid ' . $type . ' name: ' . $name);
        }

        return $normalized;
    }

    private function syncTablesFromModels(): void
    {
        if ($this->models === []) {
            return;
        }

        $existingTables = $this->existingTables();
        foreach ($this->models as $table => $model) {
            $tableName = $this->safeTable((string) $table);
            if (in_array($tableName, $existingTables, true)) {
                continue;
            }

            $sql = $this->buildCreateTableSql($tableName, (array) ($model['fields'] ?? []));
            $this->pdo->exec($sql);
        }
    }

    private function existingTables(): array
    {
        $rows = $this->pdo->query('SHOW TABLES')->fetchAll(PDO::FETCH_NUM);
        $tables = [];

        foreach ($rows as $row) {
            $name = strtolower((string) ($row[0] ?? ''));
            if ($name !== '') {
                $tables[] = $name;
            }
        }

        return $tables;
    }

    private function buildCreateTableSql(string $tableName, array $fields): string
    {
        $columns = [];

        foreach ($fields as $fieldName => $definition) {
            $column = $this->safeColumn((string) $fieldName);
            $def = is_array($definition) ? $definition : [];

            if ($column === 'id') {
                $columns[] = '`id` INT UNSIGNED NOT NULL AUTO_INCREMENT';
                continue;
            }

            $type = strtolower((string) ($def['type'] ?? 'string'));
            $required = strtolower((string) ($def['required'] ?? 'no')) === 'yes';

            $sqlType = 'VARCHAR(255)';
            if (str_contains($type, 'int')) {
                $sqlType = 'INT';
            }

            if ($column === 'hash') {
                $sqlType = 'CHAR(10)';
            }

            $nullSql = $required ? 'NOT NULL' : 'NULL';
            $columns[] = '`' . $column . '` ' . $sqlType . ' ' . $nullSql;
        }

        if (!array_key_exists('id', $fields)) {
            array_unshift($columns, '`id` INT UNSIGNED NOT NULL AUTO_INCREMENT');
        }

        $unique = [];
        foreach ($fields as $fieldName => $definition) {
            $def = is_array($definition) ? $definition : [];
            $isUnique = strtolower((string) ($def['unique'] ?? 'no')) === 'yes';
            if ($isUnique) {
                $column = $this->safeColumn((string) $fieldName);
                if ($column !== 'id') {
                    $unique[] = 'UNIQUE KEY `uniq_' . $tableName . '_' . $column . '` (`' . $column . '`)';
                }
            }
        }

        $definitions = array_merge($columns, ['PRIMARY KEY (`id`)'], $unique);

        return 'CREATE TABLE IF NOT EXISTS `' . $tableName . '` ('
            . implode(', ', $definitions)
            . ') ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci';
    }
}
?>
