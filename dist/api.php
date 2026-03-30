<?php

$root = dirname(__DIR__);
$apiRoot = $root . DIRECTORY_SEPARATOR . 'api';

require_once $apiRoot . DIRECTORY_SEPARATOR . '_includes.php';

$rawPath = trim((string) ($_GET['__path'] ?? ''), '/');
unset($_GET['__path'], $_REQUEST['__path']);

$segments = $rawPath === ''
    ? []
    : array_values(array_filter(explode('/', $rawPath), static fn ($segment) => $segment !== ''));

$segments = array_map(static fn ($segment) => strtolower((string) $segment), $segments);

$dimension = $segments[0] ?? 'index';
$endpoint = $segments[1] ?? 'index';

$GLOBALS['X_API_PARAMS'] = $segments;
$GLOBALS['X_API_DIMENSION'] = $dimension;
$GLOBALS['X_API_ENDPOINT'] = $endpoint;

$endpointFile = $apiRoot . DIRECTORY_SEPARATOR . $dimension . DIRECTORY_SEPARATOR . $endpoint . '.php';

if (!is_file($endpointFile)) {
    x_api_output(false, 404, null, [
        'endpoint' => 'API endpoint not found: ' . $dimension . '/' . $endpoint,
    ]);
}

require $endpointFile;
