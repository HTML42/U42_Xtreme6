<?php

$root = dirname(__DIR__);
$distDir = $root . DIRECTORY_SEPARATOR . 'dist';

if (!is_dir($distDir) && !mkdir($distDir, 0777, true) && !is_dir($distDir)) {
    fwrite(STDERR, "Dist directory could not be created: {$distDir}\n");
    exit(1);
}

/**
 * @param callable|null $skipFn
 */
function compile_js_bundle(string $root, string $sourceDir, string $outputBase, string $distDir, ?callable $skipFn = null): void
{
    if (!is_dir($sourceDir)) {
        file_put_contents($distDir . DIRECTORY_SEPARATOR . $outputBase . '--prod.js', "");
        file_put_contents($distDir . DIRECTORY_SEPARATOR . $outputBase . '--dev.js', "");
        echo "Compiled {$outputBase}--dev.js + {$outputBase}--prod.js (0 files, directory missing)\n";
        return;
    }

    $iter = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($sourceDir, FilesystemIterator::SKIP_DOTS)
    );

    $allJsFiles = [];
    foreach ($iter as $file) {
        if (!$file->isFile()) {
            continue;
        }

        $name = $file->getFilename();
        if (!str_ends_with($name, '.js')) {
            continue;
        }

        $path = $file->getPathname();
        if ($skipFn !== null && $skipFn($path, $name) === true) {
            continue;
        }

        $allJsFiles[] = $path;
    }

    sort($allJsFiles, SORT_STRING);

    $compiled = [];
    $includes = [];

    foreach ($allJsFiles as $path) {
        $rel = str_replace($root . DIRECTORY_SEPARATOR, '', $path);
        $relUnix = str_replace(DIRECTORY_SEPARATOR, '/', $rel);
        $content = rtrim((string) file_get_contents($path));

        $compiled[] = "/* SOURCE: {$rel} */\n" . $content;
        $includes[] = "/* SOURCE: {$rel} */\nimport('../{$relUnix}');";
    }

    $prodOutput = implode("\n\n", $compiled);
    $devOutput = implode("\n\n", $includes);

    if ($prodOutput !== '') {
        $prodOutput .= "\n";
    }

    if ($devOutput !== '') {
        $devOutput .= "\n";
    }

    file_put_contents($distDir . DIRECTORY_SEPARATOR . $outputBase . '--prod.js', $prodOutput);
    file_put_contents($distDir . DIRECTORY_SEPARATOR . $outputBase . '--dev.js', $devOutput);

    echo "Compiled {$outputBase}--dev.js + {$outputBase}--prod.js (" . count($allJsFiles) . " files)\n";
}

$scriptsDir = $root . DIRECTORY_SEPARATOR . 'scripts';
$hasProjectRouter = is_file($scriptsDir . DIRECTORY_SEPARATOR . 'router.class.js');

compile_js_bundle(
    $root,
    $scriptsDir,
    'scripts',
    $distDir,
    static function (string $_path, string $name) use ($hasProjectRouter): bool {
        return $hasProjectRouter && $name === 'x_router.class.js';
    }
);

compile_js_bundle($root, $root . DIRECTORY_SEPARATOR . 'templates', 'templates', $distDir);
compile_js_bundle($root, $root . DIRECTORY_SEPARATOR . 'translations', 'translations', $distDir);
