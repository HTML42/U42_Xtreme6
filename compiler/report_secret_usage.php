<?php

require_once __DIR__ . '/../x/x_functions.php';

$root = dirname(__DIR__);
$errors = [];

echo "Secret usage report\n";
echo "===================\n";

$docsPath = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'secrets.md';
if (!is_file($docsPath)) {
    $errors[] = 'missing canonical secrets documentation: docs/secrets.md';
}

$examplePath = $root . DIRECTORY_SEPARATOR . '_secrets.example.json';
$example = loadJson($examplePath, $errors, '_secrets.example.json', true);
$localPath = $root . DIRECTORY_SEPARATOR . '_secrets.json';
$local = loadJson($localPath, $errors, '_secrets.json', false);

echo 'Canonical docs: ' . (is_file($docsPath) ? 'docs/secrets.md' : 'missing') . "\n";
echo 'Example secrets file: ' . (is_file($examplePath) ? '_secrets.example.json' : 'missing') . "\n";
echo 'Local secrets file: ' . (is_file($localPath) ? 'present (values hidden)' : 'missing (environment-local, not required in repo)') . "\n";

validateSecretSchema($example, $errors, '_secrets.example.json', true);
if ($local !== null) {
    validateSecretSchema($local, $errors, '_secrets.json', false);
}

$report = x_secret_service_report(is_array($example) ? $example : []);

echo "\nProvider\n";
echo '- default: ' . $report['provider']['default'] . "\n";
echo '- environment: ' . $report['provider']['environment'] . "\n";

echo "\nServices\n";
if ($report['services'] === []) {
    echo "- none\n";
} else {
    foreach ($report['services'] as $service => $serviceReport) {
        echo '- ' . $service . ' (provider: ' . $serviceReport['provider'] . ')';
        if ($serviceReport['purpose'] !== '') {
            echo ' - ' . $serviceReport['purpose'];
        }
        echo "\n";
        echo '  - base_url: ' . ($serviceReport['base_url_configured'] ? 'configured' : 'missing') . "\n";
        echo '  - credential keys: ' . implodeOrNone($serviceReport['credential_keys']) . "\n";
        echo '  - required secrets: ' . implodeOrNone(array_values($serviceReport['required_secrets'])) . "\n";
        echo '  - env mappings: ' . implodeOrNone(array_values($serviceReport['env_mappings'])) . "\n";
        $serviceConfig = is_array($example['services'][$service] ?? null) ? $example['services'][$service] : [];
        echo '  - proxy endpoints: ' . implodeOrNone(collectServiceList($serviceConfig, 'proxy_endpoints')) . "\n";
        echo '  - rate limits: ' . implodeOrNone(collectServiceMapValues($serviceConfig, 'rate_limits')) . "\n";
        echo '  - failure strategy: ' . implodeOrNone(collectServiceMapKeys($serviceConfig, 'failure_strategy')) . "\n";
    }
}

echo "\nAPI integration secret references\n";
$apiRefs = findApiSecretReferences($root);
if ($apiRefs === []) {
    echo "- none declared yet; future credentialed APIs must reference docs/secrets.md and required secret paths.\n";
} else {
    foreach ($apiRefs as $ref) {
        echo '- ' . $ref . "\n";
    }
}

if ($errors !== []) {
    echo "\nSecret usage validation failed:\n";
    foreach ($errors as $error) {
        echo '- ' . $error . "\n";
    }
    exit(1);
}

echo "\nSecret usage validation passed. No secret values were printed.\n";

function loadJson(string $path, array &$errors, string $label, bool $required): ?array
{
    if (!is_file($path)) {
        if ($required) {
            $errors[] = 'missing required file: ' . $label;
        }
        return null;
    }

    $decoded = json_decode((string) file_get_contents($path), true);
    if (!is_array($decoded)) {
        $errors[] = 'invalid JSON object: ' . $label;
        return null;
    }

    return $decoded;
}

function validateSecretSchema(?array $secrets, array &$errors, string $label, bool $example): void
{
    if ($secrets === null) {
        return;
    }

    if (!is_array($secrets['provider'] ?? null)) {
        $errors[] = $label . ': missing provider object';
    }

    if (!is_array($secrets['services'] ?? null)) {
        $errors[] = $label . ': missing services object';
        return;
    }

    foreach ($secrets['services'] as $serviceName => $serviceConfig) {
        if (!is_array($serviceConfig)) {
            $errors[] = $label . ': service must be object: ' . $serviceName;
            continue;
        }

        foreach (['purpose', 'provider', 'base_url'] as $requiredKey) {
            if (!isset($serviceConfig[$requiredKey]) || $serviceConfig[$requiredKey] === '') {
                $errors[] = $label . ': services.' . $serviceName . ' missing ' . $requiredKey;
            }
        }

        if (!is_array($serviceConfig['credentials'] ?? null)) {
            $errors[] = $label . ': services.' . $serviceName . ' missing credentials object';
        }

        if (!is_array($serviceConfig['required_secrets'] ?? null)) {
            $errors[] = $label . ': services.' . $serviceName . ' missing required_secrets object';
        }

        foreach (['proxy_endpoints', 'rate_limits', 'failure_strategy'] as $blueprintKey) {
            if (isset($serviceConfig[$blueprintKey]) && !is_array($serviceConfig[$blueprintKey])) {
                $errors[] = $label . ': services.' . $serviceName . '.' . $blueprintKey . ' must be an array/object';
            }
        }

        if ($example && is_array($serviceConfig['credentials'] ?? null)) {
            foreach ($serviceConfig['credentials'] as $credentialKey => $credentialValue) {
                if (!is_string($credentialValue) || !isPlaceholderValue($credentialValue)) {
                    $errors[] = $label . ': services.' . $serviceName . '.credentials.' . $credentialKey . ' must contain a placeholder, not a real value';
                }
            }
        }
    }
}

function isPlaceholderValue(string $value): bool
{
    $normalized = strtolower(trim($value));
    return $normalized === ''
        || $normalized === 'replace-me'
        || $normalized === 'placeholder'
        || str_starts_with($normalized, 'example-')
        || str_starts_with($normalized, 'env:');
}

function findApiSecretReferences(string $root): array
{
    $refs = [];
    $apiDir = $root . DIRECTORY_SEPARATOR . 'api';
    if (!is_dir($apiDir)) {
        return $refs;
    }

    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($apiDir, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if (!$file instanceof SplFileInfo || !$file->isFile() || strtolower($file->getExtension()) !== 'md') {
            continue;
        }

        $content = (string) file_get_contents($file->getPathname());
        if (preg_match('/required[_ -]secrets|x_secret_get|docs\/secrets\.md|external api|backend[- ]only proxy/i', $content) === 1) {
            $refs[] = relativePath($root, $file->getPathname());
        }
    }

    return $refs;
}

function implodeOrNone(array $values): string
{
    $values = array_values(array_filter(array_map('strval', $values), static fn($value) => $value !== ''));
    return $values === [] ? 'none' : implode(', ', $values);
}

function collectServiceList(array $serviceReport, string $key): array
{
    $values = $serviceReport[$key] ?? [];
    return is_array($values) ? array_values(array_map('strval', $values)) : [];
}

function collectServiceMapValues(array $serviceReport, string $key): array
{
    $values = $serviceReport[$key] ?? [];
    return is_array($values) ? array_values(array_map('strval', $values)) : [];
}

function collectServiceMapKeys(array $serviceReport, string $key): array
{
    $values = $serviceReport[$key] ?? [];
    return is_array($values) ? array_keys($values) : [];
}

function relativePath(string $root, string $path): string
{
    return ltrim(str_replace($root, '', $path), DIRECTORY_SEPARATOR);
}

?>