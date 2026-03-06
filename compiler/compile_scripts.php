<?php

$root = dirname(__DIR__);
$scriptsDir = $root . DIRECTORY_SEPARATOR . 'scripts';
$distDir = $root . DIRECTORY_SEPARATOR . 'dist';

if (!is_dir($scriptsDir)) {
    fwrite(STDERR, "Scripts directory not found: {$scriptsDir}\n");
    exit(1);
}

if (!is_dir($distDir) && !mkdir($distDir, 0777, true) && !is_dir($distDir)) {
    fwrite(STDERR, "Dist directory could not be created: {$distDir}\n");
    exit(1);
}

$iter = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($scriptsDir, FilesystemIterator::SKIP_DOTS)
);

$allJsFiles = [];
$hasProjectRouter = false;

foreach ($iter as $file) {
    if (!$file->isFile()) {
        continue;
    }

    $path = $file->getPathname();
    $name = $file->getFilename();

    if (!str_ends_with($name, '.js')) {
        continue;
    }

    if ($name === 'router.class.js') {
        $hasProjectRouter = true;
    }

    $allJsFiles[] = $path;
}

sort($allJsFiles, SORT_STRING);

$compiled = [];
$includes = [];

foreach ($allJsFiles as $path) {
    $name = basename($path);

    if ($hasProjectRouter && $name === 'x_router.class.js') {
        continue;
    }

    $rel = str_replace($root . DIRECTORY_SEPARATOR, '', $path);
    $relUnix = str_replace(DIRECTORY_SEPARATOR, '/', $rel);
    $content = rtrim((string) file_get_contents($path));

    $compiled[] = "/* SOURCE: {$rel} */\n" . $content;
    $includes[] = "/* SOURCE: {$rel} */\nimport('../{$relUnix}');";
}

$prodOutput = implode("\n\n", $compiled) . "\n";
$devOutput = implode("\n\n", $includes) . "\n";

file_put_contents($distDir . DIRECTORY_SEPARATOR . 'scripts--prod.js', $prodOutput);
file_put_contents($distDir . DIRECTORY_SEPARATOR . 'scripts--dev.js', $devOutput);

echo 'Compiled scripts--dev.js + scripts--prod.js (' . count($compiled) . " files)\n";
