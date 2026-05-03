<?php

require_once __DIR__ . '/../x/x_pluralize.class.php';

$root = dirname(__DIR__);
$objectsDir = $root . DIRECTORY_SEPARATOR . 'objects';

if (!is_dir($objectsDir)) {
    echo "Object generation report: no objects directory found.\n";
    exit(0);
}

$objectDirs = glob($objectsDir . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [];

echo "Object generation report\n";
echo "========================\n";

foreach ($objectDirs as $dir) {
    $name = basename($dir);
    $singular = XPluralize::singularize($name);
    $plural = XPluralize::pluralize($singular);

    echo "\nObject: " . $name . "\n";
    echo "Pair: " . $singular . " + " . $plural . "\n";
    echo "Artifacts:\n";

    foreach (['class.md', 'class.php', 'class.js', 'test.php', 'test.js'] as $suffix) {
        $file = $dir . DIRECTORY_SEPARATOR . $name . '.' . $suffix;
        $state = is_file($file) ? 'present' : 'missing';
        echo '- ' . relativePath($root, $file) . ': ' . $state . "\n";
    }

    echo "Counterpart:\n";
    foreach ([$singular, $plural] as $pairName) {
        $pairDir = $objectsDir . DIRECTORY_SEPARATOR . $pairName;
        $pairMd = $pairDir . DIRECTORY_SEPARATOR . $pairName . '.class.md';
        $state = is_dir($pairDir) && is_file($pairMd) ? 'present' : 'missing';
        echo '- objects/' . $pairName . '/' . $pairName . '.class.md: ' . $state . "\n";
    }
}

function relativePath(string $root, string $path): string
{
    return ltrim(str_replace($root, '', $path), DIRECTORY_SEPARATOR);
}

?>