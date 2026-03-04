<?php

require_once __DIR__ . '/../x/x_compiler.class.php';

$root = dirname(__DIR__);
$objectsDir = $root . DIRECTORY_SEPARATOR . 'objects';
$distDir = $root . DIRECTORY_SEPARATOR . 'dist';

if (!is_dir($objectsDir)) {
    fwrite(STDERR, "Objects-Ordner nicht gefunden: {$objectsDir}\n");
    exit(1);
}

if (!is_dir($distDir) && !mkdir($distDir, 0777, true) && !is_dir($distDir)) {
    fwrite(STDERR, "Dist-Ordner konnte nicht erstellt werden: {$distDir}\n");
    exit(1);
}

$targets = [
    '.class.php' => 'objects.php',
    '.class.js' => 'objects.js',
    '.test.js' => 'objects.test.js',
    '.test.php' => 'objects.test.php',
];

$iter = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($objectsDir, FilesystemIterator::SKIP_DOTS)
);

$bucket = [];
foreach ($targets as $suffix => $out) {
    $bucket[$suffix] = [];
}

foreach ($iter as $file) {
    if (!$file->isFile()) {
        continue;
    }

    $path = $file->getPathname();
    $name = $file->getFilename();

    foreach ($targets as $suffix => $out) {
        if (str_ends_with($name, $suffix)) {
            $bucket[$suffix][] = $path;
        }
    }
}

foreach ($targets as $suffix => $outputName) {
    sort($bucket[$suffix], SORT_STRING);
    $compiled = [];

    foreach ($bucket[$suffix] as $path) {
        $rel = str_replace($root . DIRECTORY_SEPARATOR, '', $path);
        $content = rtrim((string) file_get_contents($path));

        if (str_ends_with($suffix, '.php')) {
            XCompiler::validate_php_tags($content, $rel);
        }

        if ($suffix === '.class.php') {
            XCompiler::validate_no_includes($content, $rel);
        }

        $compiled[] = "/* SOURCE: {$rel} */\n" . $content . "\n";
    }

    $targetPath = $distDir . DIRECTORY_SEPARATOR . $outputName;
    file_put_contents($targetPath, implode("\n", $compiled));
    echo "Compiled {$outputName} (" . count($bucket[$suffix]) . " Dateien)\n";
}
?>
