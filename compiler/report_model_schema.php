<?php

$root = dirname(__DIR__);
$modelsDir = $root . DIRECTORY_SEPARATOR . 'models';

if (!is_dir($modelsDir)) {
    echo "Model schema report: no models directory found.\n";
    exit(0);
}

$models = [];
foreach (glob($modelsDir . DIRECTORY_SEPARATOR . '*.md') ?: [] as $file) {
    $model = parseModelFile($file);
    $models[$model['table']] = $model;
}

echo "Model schema report\n";
echo "===================\n";

foreach ($models as $table => $model) {
    echo "\nTable: {$table}\n";
    echo "JSON dry-run:\n";
    echo '- table file: _db/tables/' . $table . ".json\n";
    echo '- meta entry: _db/meta.json tables.' . $table . ".current_index\n";
    echo "MySQL create plan:\n";
    echo buildCreateTableSql($table, $model['fields']) . ";\n";
    echo "Validation fields:\n";
    foreach ($model['fields'] as $field => $definition) {
        $type = $definition['type'] ?? 'string';
        $required = $definition['required'] ?? 'no';
        $unique = $definition['unique'] ?? 'no';
        $index = $definition['index'] ?? 'no';
        echo '- ' . $field . ': type=' . $type . ', required=' . $required . ', unique=' . $unique . ', index=' . $index . "\n";
    }
}

function parseModelFile(string $file): array
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
            $value = trim(trim($match[2]), '` ');
            $fields[$currentField][$key] = $value;
        }
    }

    return ['table' => $tableName, 'fields' => $fields];
}

function buildCreateTableSql(string $tableName, array $fields): string
{
    $columns = [];
    foreach ($fields as $fieldName => $definition) {
        $column = safeIdentifier($fieldName);
        $def = is_array($definition) ? $definition : [];
        if ($column === 'id') {
            $columns[] = '`id` INT UNSIGNED NOT NULL AUTO_INCREMENT';
            continue;
        }

        $type = strtolower((string) ($def['type'] ?? 'string'));
        $allowsNull = str_contains($type, 'null') || strtolower((string) ($def['required'] ?? 'no')) !== 'yes';
        $columns[] = '`' . $column . '` ' . modelSqlType($column, $type, $def) . ' ' . ($allowsNull ? 'NULL' : 'NOT NULL') . modelDefaultSql($def);
    }

    if (!array_key_exists('id', $fields)) {
        array_unshift($columns, '`id` INT UNSIGNED NOT NULL AUTO_INCREMENT');
    }

    $keys = ['PRIMARY KEY (`id`)'];
    foreach ($fields as $fieldName => $definition) {
        $column = safeIdentifier($fieldName);
        if ($column === 'id') {
            continue;
        }
        $def = is_array($definition) ? $definition : [];
        if (strtolower((string) ($def['unique'] ?? 'no')) === 'yes') {
            $keys[] = 'UNIQUE KEY `uniq_' . $tableName . '_' . $column . '` (`' . $column . '`)';
            continue;
        }
        if (strtolower((string) ($def['index'] ?? 'no')) === 'yes') {
            $keys[] = 'KEY `idx_' . $tableName . '_' . $column . '` (`' . $column . '`)';
        }
    }

    return 'CREATE TABLE IF NOT EXISTS `' . safeIdentifier($tableName) . '` (' . implode(', ', array_merge($columns, $keys)) . ') ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci';
}

function modelSqlType(string $column, string $type, array $def): string
{
    if ($column === 'hash') {
        return 'CHAR(10)';
    }
    if (str_contains($type, 'int')) {
        return 'INT';
    }
    if ($type === 'bool') {
        return 'TINYINT(1)';
    }
    if ($type === 'float') {
        return 'DOUBLE';
    }
    if ($type === 'json') {
        return 'JSON';
    }
    if ($type === 'text') {
        return 'TEXT';
    }
    $max = (int) ($def['max'] ?? 255);
    if ($max < 1 || $max > 4096) {
        $max = 255;
    }
    return 'VARCHAR(' . $max . ')';
}

function modelDefaultSql(array $def): string
{
    if (!array_key_exists('default', $def)) {
        return '';
    }
    $default = trim((string) $def['default'], "` \t\n\r\0\x0B");
    if (strtolower($default) === 'null') {
        return ' DEFAULT NULL';
    }
    if (is_numeric($default)) {
        return ' DEFAULT ' . $default;
    }
    return " DEFAULT '" . str_replace("'", "''", $default) . "'";
}

function safeIdentifier(string $name): string
{
    $normalized = strtolower(trim($name));
    if ($normalized === '' || preg_match('/^[a-z0-9_]+$/', $normalized) !== 1) {
        throw new InvalidArgumentException('Invalid identifier: ' . $name);
    }
    return $normalized;
}

?>