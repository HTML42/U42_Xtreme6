<?php

require_once __DIR__ . '/../x/x_functions.php';

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

/**
 * @return string[]
 */
function collect_style_entries(string $stylesDir): array
{
    $entries = [];
    $iter = new DirectoryIterator($stylesDir);

    foreach ($iter as $file) {
        if (!$file->isFile()) {
            continue;
        }

        $name = $file->getFilename();
        if ($name === 'styles.css' || preg_match('/^styles\..+\.css$/', $name) === 1) {
            $entries[] = $file->getPathname();
        }
    }

    sort($entries, SORT_STRING);
    return $entries;
}

function is_path_inside_dir(string $path, string $dir): bool
{
    $normalizedPath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $path);
    $normalizedDir = rtrim(str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $dir), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;

    return str_starts_with($normalizedPath, $normalizedDir);
}

/**
 * @param array<string, bool> $visited
 * @param array<string, bool> $stack
 */
function compile_css_file(string $path, string $root, string $stylesDir, array &$visited, array &$stack): string
{
    $realPath = realpath($path);
    if ($realPath === false || !is_file($realPath)) {
        throw new RuntimeException("CSS file not found: {$path}");
    }

    if (!is_path_inside_dir($realPath, $stylesDir)) {
        throw new RuntimeException("CSS import outside styles directory is not allowed: {$realPath}");
    }

    if (isset($stack[$realPath])) {
        throw new RuntimeException("Circular CSS import detected: {$realPath}");
    }

    if (isset($visited[$realPath])) {
        return '';
    }

    $stack[$realPath] = true;
    $content = (string) file_get_contents($realPath);
    $baseDir = dirname($realPath);

    $content = preg_replace_callback(
        '/@import\s+(?:url\()?["\']([^"\']+)["\']\)?\s*;/i',
        static function (array $matches) use ($baseDir, $root, $stylesDir, &$visited, &$stack): string {
            $target = trim($matches[1]);

            if ($target === '' || preg_match('/^(https?:)?\/\//i', $target) === 1) {
                return $matches[0];
            }

            $importPath = realpath($baseDir . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $target));
            if ($importPath === false || !is_file($importPath)) {
                throw new RuntimeException("Imported CSS file not found: {$target}");
            }

            $compiled = compile_css_file($importPath, $root, $stylesDir, $visited, $stack);
            if ($compiled === '') {
                return '';
            }

            $rel = str_replace($root . DIRECTORY_SEPARATOR, '', $importPath);
            return "\n/* IMPORTED: {$rel} */\n" . $compiled . "\n";
        },
        $content
    ) ?? $content;

    unset($stack[$realPath]);
    $visited[$realPath] = true;

    $rel = str_replace($root . DIRECTORY_SEPARATOR, '', $realPath);
    return "/* SOURCE: {$rel} */\n" . rtrim($content);
}

$entryFiles = collect_style_entries($stylesDir);
if ($entryFiles === []) {
    file_put_contents($distDir . DIRECTORY_SEPARATOR . 'styles.css', "");
    echo "Compiled styles.css (0 entries, no styles entry files found)\n";
    exit(0);
}

foreach ($entryFiles as $entryPath) {
    $visited = [];
    $stack = [];

    $compiled = compile_css_file($entryPath, $root, $stylesDir, $visited, $stack);
    if ($compiled !== '') {
        if (basename($entryPath) === 'styles.css') {
            $compiled = css_minify($compiled);
        }

        $compiled .= "\n";
    }

    $entryName = basename($entryPath);
    file_put_contents($distDir . DIRECTORY_SEPARATOR . $entryName, $compiled);

    echo 'Compiled ' . $entryName . ' (' . count($visited) . " files)\n";
}
?>
