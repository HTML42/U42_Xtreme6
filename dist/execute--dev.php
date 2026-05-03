<?php

$x6_public_config = [];
$x6_language = 'de';
$x6_available_languages = ['de'];
$x6_alternate_links = '';
$config_path = dirname(__DIR__) . '/config.json';
if (is_file($config_path)) {
    $decoded = json_decode((string) file_get_contents($config_path), true);
    if (is_array($decoded)) {
        foreach (['Language', 'FallbackLanguage', 'AvailableLanguages', 'ApiMode'] as $public_key) {
            if (isset($decoded[$public_key])) {
                $x6_public_config[$public_key] = $decoded[$public_key];
            }
        }
        $x6_language = strtolower((string) ($decoded['Language'] ?? 'de'));
        $x6_available_languages = is_array($decoded['AvailableLanguages'] ?? null) ? $decoded['AvailableLanguages'] : [$x6_language];
    }
}
$x6_base_url = strtok((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . ($_SERVER['REQUEST_URI'] ?? '/'), '?');
foreach ($x6_available_languages as $lang) {
    $lang = strtolower((string) $lang);
    $href = htmlspecialchars($x6_base_url . '?lang=' . rawurlencode($lang), ENT_QUOTES, 'UTF-8');
    $x6_alternate_links .= '  <link rel="alternate" hreflang="' . htmlspecialchars($lang, ENT_QUOTES, 'UTF-8') . '" href="' . $href . '">' . "\n";
}
$x6_alternate_links .= '  <link rel="alternate" hreflang="x-default" href="' . htmlspecialchars($x6_base_url . '?lang=' . rawurlencode($x6_language), ENT_QUOTES, 'UTF-8') . '">' . "\n";

?><!doctype html>
<html lang="<?php echo htmlspecialchars($x6_language, ENT_QUOTES, 'UTF-8'); ?>">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="language" content="<?php echo htmlspecialchars($x6_language, ENT_QUOTES, 'UTF-8'); ?>">
<?php echo $x6_alternate_links; ?>
  <title>Xtreme-Webframework Version 6</title>
  <link rel="stylesheet" href="../styles/styles.css">
  <script>window.X6_CONFIG = <?php echo json_encode($x6_public_config, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>;</script>
  <script src="./objects--dev.js" defer></script>
  <script src="./scripts--dev.js" defer></script>
  <script src="./templates--dev.js" defer></script>
  <script src="./translations--dev.js" defer></script>
</head>
<body></body>
</html>
