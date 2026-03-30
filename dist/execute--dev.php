<?php

$x6_public_config = [];
$config_path = dirname(__DIR__) . '/config.json';
if (is_file($config_path)) {
    $decoded = json_decode((string) file_get_contents($config_path), true);
    if (is_array($decoded) && isset($decoded['Language'])) {
        $x6_public_config['Language'] = $decoded['Language'];
    }
}

?><!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
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
