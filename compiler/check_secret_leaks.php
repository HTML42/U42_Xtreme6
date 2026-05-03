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

function relativePath(string $root, string $path): string
{
    return ltrim(str_replace($root, '', $path), DIRECTORY_SEPARATOR);
}

?>
