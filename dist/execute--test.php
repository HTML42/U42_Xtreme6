<?php

require_once __DIR__ . '/objects--prod.php';
require_once __DIR__ . '/objects.test.php';

$x6_public_config = [];
$config_paths = [dirname(__DIR__) . '/_config.json', dirname(__DIR__) . '/_config.example.json'];
foreach ($config_paths as $config_path) {
    if (!is_file($config_path)) {
        continue;
    }
    $decoded = json_decode((string) file_get_contents($config_path), true);
    if (is_array($decoded)) {
        foreach (['Language', 'FallbackLanguage', 'AvailableLanguages', 'ApiMode', 'ApiScenario'] as $public_key) {
            if (isset($decoded[$public_key])) {
                $x6_public_config[$public_key] = $decoded[$public_key];
            }
        }
        break;
    }
}

?><!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Xtreme-Webframework Version 6 - Tests</title>
  <link rel="stylesheet" href="./styles.css">
  <script>window.X6_CONFIG = <?php echo json_encode($x6_public_config, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>;</script>
  <script src="./app.js" defer></script>
  <script src="./objects.test.js" defer></script>
</head>
<body></body>
</html>
