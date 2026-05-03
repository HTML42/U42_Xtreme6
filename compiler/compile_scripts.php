<?php

$root = dirname(__DIR__);
$distDir = $root . DIRECTORY_SEPARATOR . 'dist';
$translationsDir = $root . DIRECTORY_SEPARATOR . 'translations';

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

/**
 * @return string[]
 */
function load_available_languages(string $root): array
{
    $configPath = $root . DIRECTORY_SEPARATOR . 'config.json';
    $languages = ['de'];

    if (is_file($configPath)) {
        $decoded = json_decode((string) file_get_contents($configPath), true);
        if (is_array($decoded) && is_array($decoded['AvailableLanguages'] ?? null)) {
            $languages = $decoded['AvailableLanguages'];
        } elseif (is_array($decoded) && isset($decoded['Language'])) {
            $languages = [(string) $decoded['Language']];
        }
    }

    $normalized = [];
    foreach ($languages as $language) {
        $lang = strtolower(trim((string) $language));
        if (preg_match('/^[a-z]{2}$/', $lang) !== 1) {
            continue;
        }

        $normalized[$lang] = true;
    }

    return array_keys($normalized ?: ['de' => true]);
}

/**
 * @return string[]
 */
function collect_route_translation_keys(string $root): array
{
    $routesPath = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'routes.md';
    if (!is_file($routesPath)) {
        return [];
    }

    $content = (string) file_get_contents($routesPath);
    preg_match_all('/route:\s*["\']#!\/([a-z0-9_-]+)\/([a-z0-9_-]+)["\']/i', $content, $matches, PREG_SET_ORDER);

    $keys = [];
    foreach ($matches as $match) {
        $controller = strtolower($match[1]);
        $view = strtolower($match[2]);
        $keys[] = "captions.{$controller}.{$view}";
        $keys[] = "ui.view.{$view}.intro";
    }

    return array_values(array_unique($keys));
}

/**
 * @return string[]
 */
function get_required_translation_keys(string $root): array
{
    $required = [
        'app.name',
        'menu.home',
        'menu.login',
        'menu.logout',
        'menu.registration',
        'menu.imprint',
        'menu.privacy',
        'forms.labels.username',
        'forms.labels.email',
        'forms.labels.password',
        'forms.labels.password2',
        'forms.labels.login',
        'forms.callbacks.loading',
        'forms.callbacks.success',
        'forms.callbacks.fail',
        'forms.callbacks.login_success',
        'forms.callbacks.login_fail',
        'forms.callbacks.registration_success',
        'forms.callbacks.registration_fail',
    ];

    return array_values(array_unique(array_merge($required, collect_route_translation_keys($root))));
}

/**
 * @return array<string, array<string, bool>>
 */
function collect_translation_keys_by_language(string $translationsDir): array
{
    $result = [];
    if (!is_dir($translationsDir)) {
        return $result;
    }

    $languageDirs = new DirectoryIterator($translationsDir);
    foreach ($languageDirs as $languageDir) {
        if (!$languageDir->isDir() || $languageDir->isDot()) {
            continue;
        }

        $language = strtolower($languageDir->getFilename());
        if (preg_match('/^[a-z]{2}$/', $language) !== 1) {
            continue;
        }

        $result[$language] = [];
        $files = glob($languageDir->getPathname() . DIRECTORY_SEPARATOR . '*.js') ?: [];
        sort($files, SORT_STRING);

        foreach ($files as $file) {
            $content = (string) file_get_contents($file);
            preg_match_all('/["\']([a-z0-9_.-]+)["\']\s*:/i', $content, $matches);
            foreach ($matches[1] as $key) {
                $result[$language][$key] = true;
            }
        }
    }

    return $result;
}

function validate_translation_governance(string $root, string $translationsDir): void
{
    $languages = load_available_languages($root);
    $requiredKeys = get_required_translation_keys($root);
    $keysByLanguage = collect_translation_keys_by_language($translationsDir);
    $hasErrors = false;

    foreach ($languages as $language) {
        if (!isset($keysByLanguage[$language])) {
            fwrite(STDERR, "Translation governance error: missing translations/{$language}/ directory\n");
            $hasErrors = true;
            continue;
        }

        $defaultFile = $translationsDir . DIRECTORY_SEPARATOR . $language . DIRECTORY_SEPARATOR . '_default.js';
        if (!is_file($defaultFile)) {
            fwrite(STDERR, "Translation governance error: missing translations/{$language}/_default.js\n");
            $hasErrors = true;
        }

        $missing = [];
        foreach ($requiredKeys as $key) {
            if (!isset($keysByLanguage[$language][$key])) {
                $missing[] = $key;
            }
        }

        if ($missing !== []) {
            fwrite(STDERR, "Translation governance error: {$language} misses required keys: " . implode(', ', $missing) . "\n");
            $hasErrors = true;
        }
    }

    if ($hasErrors) {
        exit(1);
    }

    echo 'Translation governance passed (' . count($languages) . ' languages, ' . count($requiredKeys) . " required keys)\n";
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
validate_translation_governance($root, $translationsDir);
compile_js_bundle($root, $translationsDir, 'translations', $distDir);
