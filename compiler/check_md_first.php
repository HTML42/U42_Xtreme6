<?php

$root = dirname(__DIR__);
$errors = [];

checkObjects($root, $errors);
checkApiDimensions($root, $errors);
checkControllers($root, $errors);

if ($errors !== []) {
    echo "MD-first check failed:\n";
    foreach ($errors as $error) {
        echo '- ' . $error . "\n";
    }
    exit(1);
}

echo "MD-first check passed.\n";

function checkObjects(string $root, array &$errors): void
{
    $objectDirs = glob($root . DIRECTORY_SEPARATOR . 'objects' . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [];

    foreach ($objectDirs as $dir) {
        $name = basename($dir);
        $md = $dir . DIRECTORY_SEPARATOR . $name . '.class.md';

        foreach (['class.php', 'class.js', 'test.php', 'test.js'] as $suffix) {
            $runtime = $dir . DIRECTORY_SEPARATOR . $name . '.' . $suffix;
            if (is_file($runtime) && !is_file($md)) {
                $errors[] = 'Object runtime without markdown source: ' . relativePath($root, $runtime);
            }
        }
    }
}

function checkApiDimensions(string $root, array &$errors): void
{
    $apiDirs = glob($root . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [];

    foreach ($apiDirs as $dir) {
        $dimension = basename($dir);
        $md = $dir . DIRECTORY_SEPARATOR . $dimension . '.md';
        $phpEndpoints = glob($dir . DIRECTORY_SEPARATOR . '*.php') ?: [];

        if ($phpEndpoints !== [] && !is_file($md)) {
            $errors[] = 'API dimension without markdown descriptor: api/' . $dimension;
        }
    }
}

function checkControllers(string $root, array &$errors): void
{
    $controllerDir = $root . DIRECTORY_SEPARATOR . 'scripts' . DIRECTORY_SEPARATOR . 'controllers';
    if (!is_dir($controllerDir)) {
        return;
    }

    $controllers = glob($controllerDir . DIRECTORY_SEPARATOR . '*.controller.js') ?: [];
    foreach ($controllers as $controller) {
        $md = preg_replace('/\.controller\.js$/', '.controller.md', $controller);
        if (!is_string($md) || !is_file($md)) {
            $errors[] = 'Controller without markdown overlay: ' . relativePath($root, $controller);
        }
    }
}

function relativePath(string $root, string $path): string
{
    return ltrim(str_replace($root, '', $path), DIRECTORY_SEPARATOR);
}

?>
