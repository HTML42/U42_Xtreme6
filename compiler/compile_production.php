<?php

require_once __DIR__ . '/../x/x_functions.php';

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

$runtimePhpOrder = [];

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
    $jsOutput = js_minify($jsOutput);
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
$phpOutput = "<?php\n\n" . $phpBody . "\n\n"
    . '$x6_public_config = [];' . "\n"
    . '$x6_language = \'de\';' . "\n"
    . '$x6_available_languages = [\'de\'];' . "\n"
    . '$x6_alternate_links = \'' . '\';' . "\n"
    . '$config_path = dirname(__DIR__) . \'/config.json\';' . "\n"
    . 'if (is_file($config_path)) {' . "\n"
    . '    $decoded = json_decode((string) file_get_contents($config_path), true);' . "\n"
    . '    if (is_array($decoded)) {' . "\n"
    . '        foreach ([\'Language\', \'FallbackLanguage\', \'AvailableLanguages\', \'ApiMode\'] as $public_key) {' . "\n"
    . '            if (isset($decoded[$public_key])) {' . "\n"
    . '                $x6_public_config[$public_key] = $decoded[$public_key];' . "\n"
    . '            }' . "\n"
    . '        }' . "\n"
    . '        $x6_language = strtolower((string) ($decoded[\'Language\'] ?? \'de\'));' . "\n"
    . '        $x6_available_languages = is_array($decoded[\'AvailableLanguages\'] ?? null) ? $decoded[\'AvailableLanguages\'] : [$x6_language];' . "\n"
    . '    }' . "\n"
    . '}' . "\n"
    . '$x6_base_url = strtok((isset($_SERVER[\'HTTPS\']) && $_SERVER[\'HTTPS\'] === \'on\' ? \'https\' : \'http\') . \':\/\/\' . ($_SERVER[\'HTTP_HOST\'] ?? \'localhost\') . ($_SERVER[\'REQUEST_URI\'] ?? \'/\'), \'?\');' . "\n"
    . 'foreach ($x6_available_languages as $lang) {' . "\n"
    . '    $lang = strtolower((string) $lang);' . "\n"
    . '    $href = htmlspecialchars($x6_base_url . \'?lang=\' . rawurlencode($lang), ENT_QUOTES, \'UTF-8\');' . "\n"
    . '    $x6_alternate_links .= \'  <link rel="alternate" hreflang="\' . htmlspecialchars($lang, ENT_QUOTES, \'UTF-8\') . \'" href="\' . $href . \'">\' . "\\n";' . "\n"
    . '}' . "\n"
    . '$x6_alternate_links .= \'  <link rel="alternate" hreflang="x-default" href="\' . htmlspecialchars($x6_base_url . \'?lang=\' . rawurlencode($x6_language), ENT_QUOTES, \'UTF-8\') . \'">\' . "\\n";' . "\n\n"
    . '?><!doctype html>' . "\n"
    . '<html lang="<?php echo htmlspecialchars($x6_language, ENT_QUOTES, \'UTF-8\'); ?>">' . "\n"
    . '<head>' . "\n"
    . '  <meta charset="utf-8">' . "\n"
    . '  <meta name="viewport" content="width=device-width, initial-scale=1">' . "\n"
    . '  <meta name="language" content="<?php echo htmlspecialchars($x6_language, ENT_QUOTES, \'UTF-8\'); ?>">' . "\n"
    . '<?php echo $x6_alternate_links; ?>'
    . '  <title>Xtreme-Webframework Version 6</title>' . "\n"
    . '  <link rel="stylesheet" href="./styles.css">' . "\n"
    . '  <script>window.X6_CONFIG = <?php echo json_encode($x6_public_config, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>;</script>' . "\n"
    . '  <script src="./app.js" defer></script>' . "\n"
    . '</head>' . "\n"
    . '<body></body>' . "\n"
    . '</html>' . "\n";

file_put_contents($distDir . DIRECTORY_SEPARATOR . 'app.php', $phpOutput);

echo 'Compiled app.js (' . $jsCount . " files)\n";
echo 'Compiled app.php (' . $phpCount . " files)\n";
?>
