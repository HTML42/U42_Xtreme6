<?php

$root = dirname(__DIR__);
$modelsDir = $root . DIRECTORY_SEPARATOR . 'models';
$errors = [];

if (!is_dir($modelsDir)) {
    echo "Model relationship report: no models directory found.\n";
    exit(0);
}

$models = [];
foreach (glob($modelsDir . DIRECTORY_SEPARATOR . '*.md') ?: [] as $file) {
    $model = parseModelFile($file);
    $models[$model['table']] = $model;
}

echo "Model relationship report\n";
echo "=========================\n";

foreach ($models as $table => $model) {
    echo "\nTable: {$table}\n";
    $relations = $model['relations'];

    if ($relations === []) {
        echo "Relations: none\n";
        continue;
    }

    foreach ($relations as $name => $relation) {
        validateRelation($table, $name, $relation, $models, $errors);
        printRelationPlan($table, $name, $relation);
    }
}

if ($errors !== []) {
    echo "\nRelationship validation failed:\n";
    foreach ($errors as $error) {
        echo '- ' . $error . "\n";
    }
    exit(1);
}

echo "\nRelationship validation passed.\n";

function parseModelFile(string $file): array
{
    $tableName = strtolower((string) pathinfo($file, PATHINFO_FILENAME));
    $content = (string) file_get_contents($file);
    $lines = preg_split('/\r\n|\r|\n/', $content) ?: [];
    $section = '';
    $fields = [];
    $relations = [];
    $currentField = null;
    $currentRelation = null;
    $relationsExplicitNone = false;

    foreach ($lines as $line) {
        $trimmed = trim($line);

        if (preg_match('/^##\s+(.+)$/', $trimmed, $match) === 1) {
            $section = strtolower(trim($match[1]));
            $currentField = null;
            $currentRelation = null;
            continue;
        }

        if ($section === 'fields' && preg_match('/^###\s+([a-z0-9_]+)\s*$/i', $trimmed, $match) === 1) {
            $currentField = strtolower($match[1]);
            $fields[$currentField] = [];
            continue;
        }

        if ($section === 'relations') {
            if ($trimmed === '- none' || stripos($trimmed, 'keine direkten beziehungen') !== false) {
                $relationsExplicitNone = true;
                continue;
            }

            if (preg_match('/^###\s+([a-z0-9_]+)\s*$/i', $trimmed, $match) === 1) {
                $currentRelation = strtolower($match[1]);
                $relations[$currentRelation] = [];
                continue;
            }
        }

        if (preg_match('/^-\s*([a-z_ ]+)\s*:\s*(.+)$/i', $trimmed, $match) !== 1) {
            continue;
        }

        $key = strtolower(trim($match[1]));
        $value = trim(trim($match[2]), '` ');

        if ($section === 'fields' && $currentField !== null) {
            $fields[$currentField][$key] = $value;
        }

        if ($section === 'relations' && $currentRelation !== null) {
            $relations[$currentRelation][$key] = $value;
        }
    }

    if ($relationsExplicitNone) {
        $relations = [];
    }

    return [
        'table' => $tableName,
        'fields' => $fields,
        'relations' => $relations,
    ];
}

function validateRelation(string $table, string $name, array $relation, array $models, array &$errors): void
{
    $type = strtolower((string) ($relation['type'] ?? ''));
    $required = ['type', 'local field', 'foreign table', 'foreign field', 'on delete', 'on update'];

    foreach ($required as $key) {
        if (($relation[$key] ?? '') === '') {
            $errors[] = "{$table}.{$name} missing relation key: {$key}";
        }
    }

    if (!in_array($type, ['1:1', '1:n', 'n:m'], true)) {
        $errors[] = "{$table}.{$name} has invalid relation type: {$type}";
    }

    $localField = strtolower((string) ($relation['local field'] ?? ''));
    if ($localField !== '' && !isset($models[$table]['fields'][$localField])) {
        $errors[] = "{$table}.{$name} references missing local field: {$localField}";
    }

    $foreignTable = strtolower((string) ($relation['foreign table'] ?? ''));
    $foreignField = strtolower((string) ($relation['foreign field'] ?? ''));
    if ($foreignTable !== '' && !isset($models[$foreignTable])) {
        $errors[] = "{$table}.{$name} references missing foreign table: {$foreignTable}";
    } elseif ($foreignField !== '' && !isset($models[$foreignTable]['fields'][$foreignField])) {
        $errors[] = "{$table}.{$name} references missing foreign field: {$foreignTable}.{$foreignField}";
    }

    $onDelete = strtolower((string) ($relation['on delete'] ?? ''));
    if ($onDelete !== '' && !in_array($onDelete, ['cascade', 'restrict', 'set null'], true)) {
        $errors[] = "{$table}.{$name} has invalid on delete policy: {$onDelete}";
    }

    $onUpdate = strtolower((string) ($relation['on update'] ?? ''));
    if ($onUpdate !== '' && !in_array($onUpdate, ['cascade', 'restrict'], true)) {
        $errors[] = "{$table}.{$name} has invalid on update policy: {$onUpdate}";
    }

    if ($type === 'n:m') {
        foreach (['join table', 'join local field', 'join foreign field'] as $key) {
            if (($relation[$key] ?? '') === '') {
                $errors[] = "{$table}.{$name} missing n:m key: {$key}";
            }
        }
    }
}

function printRelationPlan(string $table, string $name, array $relation): void
{
    $type = strtolower((string) ($relation['type'] ?? ''));
    echo "Relation: {$name} ({$type})\n";
    echo '- local: ' . $table . '.' . ($relation['local field'] ?? '?') . "\n";
    echo '- foreign: ' . ($relation['foreign table'] ?? '?') . '.' . ($relation['foreign field'] ?? '?') . "\n";
    echo '- on delete: ' . ($relation['on delete'] ?? '?') . "\n";
    echo '- on update: ' . ($relation['on update'] ?? '?') . "\n";

    echo "JSON integrity plan:\n";
    echo '- before insert/update: verify referenced foreign row exists\n';
    echo '- before delete/update of referenced row: apply on delete/on update policy\n';

    echo "MySQL FK plan:\n";
    if ($type === 'n:m') {
        $joinTable = strtolower((string) ($relation['join table'] ?? 'join_table'));
        $joinLocal = strtolower((string) ($relation['join local field'] ?? 'local_id'));
        $joinForeign = strtolower((string) ($relation['join foreign field'] ?? 'foreign_id'));
        echo '- create join table `' . $joinTable . '` with `' . $joinLocal . '` and `' . $joinForeign . "`\n";
        echo '- add FK from join table to `' . $table . '` and `' . ($relation['foreign table'] ?? '?') . "`\n";
        return;
    }

    $constraint = 'fk_' . $table . '_' . $name;
    echo 'ALTER TABLE `' . $table . '` ADD CONSTRAINT `' . $constraint . '` FOREIGN KEY (`'
        . ($relation['local field'] ?? '?') . '`) REFERENCES `' . ($relation['foreign table'] ?? '?') . '` (`'
        . ($relation['foreign field'] ?? '?') . '`) ON DELETE ' . strtoupper((string) ($relation['on delete'] ?? 'restrict'))
        . ' ON UPDATE ' . strtoupper((string) ($relation['on update'] ?? 'restrict')) . ";\n";
}

?>