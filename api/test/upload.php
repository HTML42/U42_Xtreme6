<?php

require_once __DIR__ . '/../_includes.php';

if (strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    x_api_output(false, 405, null, ['method' => 'method not allowed']);
}

$files = [];
foreach ($_FILES as $field => $file) {
    $names = is_array($file['name'] ?? null) ? $file['name'] : [$file['name'] ?? ''];
    $sizes = is_array($file['size'] ?? null) ? $file['size'] : [$file['size'] ?? 0];
    $types = is_array($file['type'] ?? null) ? $file['type'] : [$file['type'] ?? ''];

    foreach ($names as $index => $name) {
        if ((string) $name === '') {
            continue;
        }

        $files[] = [
            'field' => $field,
            'name' => (string) $name,
            'size' => (int) ($sizes[$index] ?? 0),
            'type' => (string) ($types[$index] ?? ''),
        ];
    }
}

x_api_output(true, 200, ['files' => $files], []);

?>