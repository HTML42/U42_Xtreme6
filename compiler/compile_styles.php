<?php

$root = dirname(__DIR__);
$stylesDir = $root . DIRECTORY_SEPARATOR . 'styles';
$distDir = $root . DIRECTORY_SEPARATOR . 'dist';

if (!is_dir($distDir) && !mkdir($distDir, 0777, true) && !is_dir($distDir)) {
    fwrite(STDERR, "Dist directory could not be created: {$distDir}\n");
    exit(1);
}

if (!is_dir($stylesDir)) {
    file_put_contents($distDir . DIRECTORY_SEPARATOR . 'styles.css', "");
    echo "Compiled styles.css (0 files, styles directory missing)\n";
    exit(0);
}

$iter = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($stylesDir, FilesystemIterator::SKIP_DOTS)
);

$allCssFiles = [];
foreach ($iter as $file) {
    if (!$file->isFile()) {
        continue;
    }

    $name = $file->getFilename();
    if (!str_ends_with($name, '.css')) {
        continue;
    }

    $allCssFiles[] = $file->getPathname();
}

sort($allCssFiles, SORT_STRING);

$chunks = [];
foreach ($allCssFiles as $path) {
    $rel = str_replace($root . DIRECTORY_SEPARATOR, '', $path);
    $content = rtrim((string) file_get_contents($path));
    $chunks[] = "/* SOURCE: {$rel} */\n" . $content;
}

$output = implode("\n\n", $chunks);
if ($output !== '') {
    $output .= "\n";
}

file_put_contents($distDir . DIRECTORY_SEPARATOR . 'styles.css', $output);

echo 'Compiled styles.css (' . count($allCssFiles) . " files)\n";
?>
