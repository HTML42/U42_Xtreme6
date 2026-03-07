<?php

require_once __DIR__ . '/../x/x_compiler.class.php';

$root = dirname(__DIR__);
$objectsDir = $root . DIRECTORY_SEPARATOR . 'objects';
$distDir = $root . DIRECTORY_SEPARATOR . 'dist';

if (!is_dir($objectsDir)) {
    fwrite(STDERR, "Objects directory not found: {$objectsDir}\n");
    exit(1);
}

if (!is_dir($distDir) && !mkdir($distDir, 0777, true) && !is_dir($distDir)) {
    fwrite(STDERR, "Dist directory could not be created: {$distDir}\n");
    exit(1);
}

$targets = [
    '.class.php' => ['base' => 'objects', 'lang' => 'php', 'dev' => true],
    '.class.js' => ['base' => 'objects', 'lang' => 'js', 'dev' => true],
    '.test.php' => ['base' => 'objects.test', 'lang' => 'php', 'dev' => false, 'standalone' => true],
    '.test.js' => ['base' => 'objects.test', 'lang' => 'js', 'dev' => false, 'standalone' => true],
];

$iter = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($objectsDir, FilesystemIterator::SKIP_DOTS)
);

$bucket = [];
foreach ($targets as $suffix => $_meta) {
    $bucket[$suffix] = [];
}

foreach ($iter as $file) {
    if (!$file->isFile()) {
        continue;
    }

    $path = $file->getPathname();
    $name = $file->getFilename();

    foreach ($targets as $suffix => $_meta) {
        if (str_ends_with($name, $suffix)) {
            $bucket[$suffix][] = $path;
        }
    }
}

foreach ($targets as $suffix => $meta) {
    sort($bucket[$suffix], SORT_STRING);

    $lang = $meta['lang'];
    $base = $meta['base'];
    $buildDev = $meta['dev'] === true;
    $isPhpTarget = $lang === 'php';

    $compiled = [];
    $includes = [];

    foreach ($bucket[$suffix] as $path) {
        $rel = str_replace($root . DIRECTORY_SEPARATOR, '', $path);
        $relUnix = str_replace(DIRECTORY_SEPARATOR, '/', $rel);
        $content = rtrim((string) file_get_contents($path));

        if ($isPhpTarget) {
            XCompiler::validate_php_tags($content, $rel);
        }

        if ($suffix === '.class.php') {
            XCompiler::validate_no_includes($content, $rel);
        }

        if ($isPhpTarget) {
            $compiled[] = preg_replace(
                '/^\s*<\?php\s*/',
                "<?php\n\n/* SOURCE: {$rel} */\n",
                $content,
                1
            ) ?? $content;

            $includes[] = "/* SOURCE: {$rel} */\nrequire_once __DIR__ . '/../{$relUnix}';";
            continue;
        }

        $compiled[] = "/* SOURCE: {$rel} */\n" . $content;
        $includes[] = "/* SOURCE: {$rel} */\nimport('../{$relUnix}');";
    }

    $prodOutput = implode("\n\n", $compiled) . "\n";
    if ($isPhpTarget) {
        $prodOutput = preg_replace('/\?>\s*<\?php/', '', $prodOutput) ?? $prodOutput;
    }

    $devOutput = '';
    if ($isPhpTarget) {
        $devOutput = "<?php\n\n" . implode("\n\n", $includes) . "\n\n?>\n";
    } else {
        $devOutput = implode("\n\n", $includes) . "\n";
    }

    $isStandalone = ($meta['standalone'] ?? false) === true;
    $prodName = $isStandalone ? ($base . '.' . $lang) : ($base . '--prod.' . $lang);
    $devName = $base . '--dev.' . $lang;

    file_put_contents($distDir . DIRECTORY_SEPARATOR . $prodName, $prodOutput);


    if ($isStandalone) {
        $legacyProdPath = $distDir . DIRECTORY_SEPARATOR . $base . '--prod.' . $lang;
        if (is_file($legacyProdPath)) {
            unlink($legacyProdPath);
        }
    }
    if ($buildDev) {
        file_put_contents($distDir . DIRECTORY_SEPARATOR . $devName, $devOutput);
        echo "Compiled {$devName} + {$prodName} (" . count($bucket[$suffix]) . " files)\n";
        continue;
    }

    $devPath = $distDir . DIRECTORY_SEPARATOR . $devName;
    if (is_file($devPath)) {
        unlink($devPath);
    }

    echo "Compiled {$prodName} (" . count($bucket[$suffix]) . " files)\n";
}
?>
