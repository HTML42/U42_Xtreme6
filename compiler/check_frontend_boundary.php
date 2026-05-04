<?php

$root = dirname(__DIR__);
$errors = [];

echo "Frontend/backend boundary check\n";
echo "===============================\n";

$scanDirs = [
    'scripts',
    'templates',
];

$allowedApiFile = normalizePath($root . DIRECTORY_SEPARATOR . 'scripts' . DIRECTORY_SEPARATOR . 'x_api.class.js');

$forbidden = [
    '/\b(require_once|include_once|include)\s*\(/i' => 'PHP include/require is not allowed in frontend artifacts',
    '/\brequire\s*\(/i' => 'CommonJS require is not allowed in frontend artifacts',
    '/\b(import)\s+[^;]+from\s+["\']/i' => 'module imports are not allowed in framework frontend artifacts',
    '/\bXDB\b|\bnew\s+XDB\b/i' => 'direct database access is forbidden in frontend artifacts',
    '/x_secret_get\s*\(|x_secrets_load\s*\(|_secrets\.json|_db\.json/i' => 'secrets or environment-local backend files are forbidden in frontend artifacts',
    '/\bDatabaseSelectCacheTtl\b|\bDatabase\b/i' => 'backend database configuration is forbidden in frontend artifacts',
    '/\.php\b/i' => 'direct PHP file references are forbidden; use documented API routes via XApi',
];

$apiOnlyPatterns = [
    '/\bfetch\s*\(/i' => 'fetch is only allowed inside scripts/x_api.class.js',
    '/\bXMLHttpRequest\b/i' => 'XMLHttpRequest is forbidden; use XApi',
    '/["\'`]\/api\//i' => 'direct /api/ URL strings are only allowed inside scripts/x_api.class.js',
];

foreach ($scanDirs as $scanDir) {
    $base = $root . DIRECTORY_SEPARATOR . $scanDir;
    if (!is_dir($base)) {
        continue;
    }

    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if (!$file instanceof SplFileInfo || !$file->isFile() || strtolower($file->getExtension()) !== 'js') {
            continue;
        }

        $path = $file->getPathname();
        $normalizedPath = normalizePath($path);
        $relative = relativePath($root, $path);
        $content = (string) file_get_contents($path);

        foreach ($forbidden as $pattern => $message) {
            if (preg_match($pattern, $content) === 1) {
                $errors[] = $relative . ': ' . $message;
            }
        }

        if ($normalizedPath !== $allowedApiFile) {
            foreach ($apiOnlyPatterns as $pattern => $message) {
                if (preg_match($pattern, $content) === 1) {
                    $errors[] = $relative . ': ' . $message;
                }
            }
        }
    }
}

if ($errors !== []) {
    echo "\nBoundary violations found:\n";
    foreach ($errors as $error) {
        echo '- ' . $error . "\n";
    }
    exit(1);
}

echo "\nBoundary check passed. Frontend reaches backend only through XApi.\n";

function normalizePath(string $path): string
{
    return str_replace('\\', '/', $path);
}

function relativePath(string $root, string $path): string
{
    return ltrim(str_replace('\\', '/', str_replace($root, '', $path)), '/');
}

?>