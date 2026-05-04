<?php

require_once __DIR__ . '/../x/x_functions.php';

$root = dirname(__DIR__);
$errors = [];
$documented = [];

echo "API contract report\n";
echo "===================\n";

foreach (glob($root . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [] as $dir) {
    $dimension = basename($dir);
    $md = $dir . DIRECTORY_SEPARATOR . $dimension . '.md';
    if (!is_file($md)) {
        $errors[] = 'missing API markdown: api/' . $dimension . '/' . $dimension . '.md';
        continue;
    }

    $content = (string) file_get_contents($md);
    $endpoints = parseDocumentedEndpoints($content);
    echo "\nDimension: {$dimension}\n";
    echo 'Contract: ' . parseContractVersion($content) . "\n";

    foreach ($endpoints as $endpoint) {
        $key = strtolower($endpoint['method'] . ' ' . $endpoint['path']);
        $documented[$key] = $endpoint;
        echo '- documented: ' . $endpoint['method'] . ' ' . $endpoint['path'] . "\n";

        $parts = explode('/', trim($endpoint['path'], '/'));
        $endpointName = $parts[2] ?? 'index';
        $php = $dir . DIRECTORY_SEPARATOR . $endpointName . '.php';
        if (!is_file($php)) {
            $errors[] = 'documented endpoint without PHP file: ' . $endpoint['path'];
        } else {
            $phpContent = (string) file_get_contents($php);
            if (!str_contains($phpContent, 'x_api_output(')) {
                $errors[] = 'endpoint does not use x_api_output: ' . relativePath($root, $php);
            }
        }
    }

    foreach (glob($dir . DIRECTORY_SEPARATOR . '*.php') ?: [] as $phpFile) {
        $endpointName = basename($phpFile, '.php');
        $path = '/api/' . $dimension . '/' . $endpointName;
        $hasDoc = false;
        foreach ($endpoints as $endpoint) {
            if (strtolower($endpoint['path']) === strtolower($path)) {
                $hasDoc = true;
                break;
            }
        }
        if (!$hasDoc) {
            $errors[] = 'PHP endpoint without endpoint line in API markdown: ' . relativePath($root, $phpFile);
        }
    }
}

checkFrontendApiCalls($root, $documented, $errors);
checkPayloadShape($errors);

if ($errors !== []) {
    echo "\nAPI contract validation failed:\n";
    foreach ($errors as $error) {
        echo '- ' . $error . "\n";
    }
    exit(1);
}

echo "\nAPI contract validation passed.\n";

function parseDocumentedEndpoints(string $content): array
{
    $endpoints = [];
    $seen = [];
    preg_match_all('/-\s*`?(GET|POST|PUT|PATCH|DELETE)\s+(\/api\/[a-z0-9_-]+\/[a-z0-9_-]+)`?/i', $content, $matches, PREG_SET_ORDER);
    foreach ($matches as $match) {
        $method = strtoupper($match[1]);
        $path = strtolower($match[2]);
        $key = $method . ' ' . $path;
        if (isset($seen[$key])) {
            continue;
        }
        $seen[$key] = true;

        $endpoints[] = [
            'method' => $method,
            'path' => $path,
        ];
    }
    return $endpoints;
}

function parseContractVersion(string $content): string
{
    if (preg_match('/version:\s*`?([^`\s]+)`?/i', $content, $match) === 1) {
        return $match[1];
    }
    return 'missing';
}

function checkFrontendApiCalls(string $root, array $documented, array &$errors): void
{
    $scriptsDir = $root . DIRECTORY_SEPARATOR . 'scripts';
    if (!is_dir($scriptsDir)) {
        return;
    }

    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($scriptsDir, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if (!$file instanceof SplFileInfo || !$file->isFile() || strtolower($file->getExtension()) !== 'js') {
            continue;
        }

        $content = (string) file_get_contents($file->getPathname());
        preg_match_all('/(?:path:\s*["\']|XApi\.request\(\s*["\'])([a-z0-9_\/-]+)["\']/i', $content, $matches);
        foreach ($matches[1] as $path) {
            $normalizedPath = '/api/' . trim($path, '/');
            $postKey = strtolower('POST ' . $normalizedPath);
            $getKey = strtolower('GET ' . $normalizedPath);
            if (!isset($documented[$postKey]) && !isset($documented[$getKey])) {
                $errors[] = 'frontend API call without documented endpoint: ' . relativePath($root, $file->getPathname()) . ' -> ' . $normalizedPath;
            }
        }
    }
}

function checkPayloadShape(array &$errors): void
{
    $valid = x_api_payload(true, 200, ['ok' => true], []);
    $shapeErrors = x_api_validate_payload_shape($valid);
    if ($shapeErrors !== []) {
        $errors[] = 'x_api_payload produced invalid shape: ' . json_encode($shapeErrors, JSON_UNESCAPED_SLASHES);
    }

    $invalid = ['success' => 'yes', 'status' => '200', 'response' => null, 'errors' => 'none'];
    if (x_api_validate_payload_shape($invalid) === []) {
        $errors[] = 'x_api_validate_payload_shape did not reject invalid payload';
    }
}

function relativePath(string $root, string $path): string
{
    return ltrim(str_replace($root, '', $path), DIRECTORY_SEPARATOR);
}

?>