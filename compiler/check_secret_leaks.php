<?php

$root = dirname(__DIR__);
$dist = $root . DIRECTORY_SEPARATOR . 'dist';
$errors = [];

$forbiddenPatterns = [
    '/_secrets\.json/i',
    '/api_secret/i',
    '/api_key/i',
    '/private_key/i',
    '/client_secret/i',
];

$configuredSecretValues = collectConfiguredSecretValues($root);

if (is_dir($dist)) {
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dist, FilesystemIterator::SKIP_DOTS)
    );

    foreach ($iterator as $item) {
        if (!$item->isFile()) {
            continue;
        }

        $path = $item->getPathname();
        $content = (string) file_get_contents($path);

        foreach ($forbiddenPatterns as $pattern) {
            if (preg_match($pattern, $content) === 1) {
                $errors[] = relativePath($root, $path) . ' matches forbidden secret pattern ' . $pattern;
            }
        }

        foreach ($configuredSecretValues as $secretPath => $secretValue) {
            if ($secretValue !== '' && str_contains($content, $secretValue)) {
                $errors[] = relativePath($root, $path) . ' contains configured secret value at ' . $secretPath;
            }
        }
    }
}

if ($errors !== []) {
    echo "Secret leak check failed:\n";
    foreach ($errors as $error) {
        echo '- ' . $error . "\n";
    }
    exit(1);
}

echo "Secret leak check passed.\n";

function collectConfiguredSecretValues(string $root): array
{
    $path = $root . DIRECTORY_SEPARATOR . '_secrets.json';
    if (!is_file($path)) {
        return [];
    }

    $decoded = json_decode((string) file_get_contents($path), true);
    if (!is_array($decoded)) {
        return [];
    }

    $values = [];
    collectSecretValuesRecursive($decoded, [], $values);
    return $values;
}

function collectSecretValuesRecursive($value, array $path, array &$values): void
{
    if (is_array($value)) {
        foreach ($value as $key => $child) {
            collectSecretValuesRecursive($child, [...$path, (string) $key], $values);
        }
        return;
    }

    if (!is_string($value) || strlen($value) < 8) {
        return;
    }

    $pathString = implode('.', $path);
    if (preg_match('/(^|\.)(credentials|api_key|api_secret|client_secret|private_key|token|password)(\.|$)/i', $pathString) !== 1) {
        return;
    }

    if (in_array(strtolower($value), ['replace-me', 'placeholder'], true)) {
        return;
    }

    $values[$pathString] = $value;
}

function relativePath(string $root, string $path): string
{
    return ltrim(str_replace($root, '', $path), DIRECTORY_SEPARATOR);
}

?>
