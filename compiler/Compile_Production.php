<?php

$root = dirname(__DIR__);
$distDir = $root . DIRECTORY_SEPARATOR . 'dist';

if (!is_dir($distDir)) {
    fwrite(STDERR, "Dist directory not found: {$distDir}\n");
    exit(1);
}

$runtimeJsOrder = [
    'objects--prod.js',
    'scripts--prod.js',
    'templates--prod.js',
    'translations--prod.js',
];

$runtimePhpOrder = [
    'objects--prod.php',
];

$jsChunks = [];
$jsCount = 0;

foreach ($runtimeJsOrder as $name) {
    $path = $distDir . DIRECTORY_SEPARATOR . $name;
    if (!is_file($path)) {
        continue;
    }

    $content = rtrim((string) file_get_contents($path));
    $jsChunks[] = "/* DIST SOURCE: {$name} */\n" . $content;
    $jsCount += 1;
}

$jsOutput = implode("\n\n", $jsChunks);
if ($jsOutput !== '') {
    $jsOutput .= "\n";
}

file_put_contents($distDir . DIRECTORY_SEPARATOR . 'app.js', $jsOutput);

$phpChunks = [];
$phpCount = 0;

foreach ($runtimePhpOrder as $name) {
    $path = $distDir . DIRECTORY_SEPARATOR . $name;
    if (!is_file($path)) {
        continue;
    }

    $content = trim((string) file_get_contents($path));
    $content = preg_replace('/^<\?php\s*/', '', $content, 1) ?? $content;
    $content = preg_replace('/\s*\?>\s*$/', '', $content, 1) ?? $content;

    $phpChunks[] = "/* DIST SOURCE: {$name} */\n" . trim($content);
    $phpCount += 1;
}

$phpBody = implode("\n\n", $phpChunks);
$phpOutput = "<?php\n\n" . $phpBody . "\n\n?>\n";

file_put_contents($distDir . DIRECTORY_SEPARATOR . 'app.php', $phpOutput);

echo 'Compiled app.js (' . $jsCount . " files)\n";
echo 'Compiled app.php (' . $phpCount . " files)\n";
