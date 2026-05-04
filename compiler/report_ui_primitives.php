<?php

$root = dirname(__DIR__);
$errors = [];

echo "UI primitives report\n";
echo "====================\n";

$routes = declaredRoutes($root);
$requiredTemplates = ['header', 'sidebar', 'footer', 'breadcrumb', 'slideshow'];

foreach ($requiredTemplates as $template) {
    if (!templateExists($root, $template)) {
        $errors[] = 'missing UI primitive template: templates/' . $template . '.js';
    } else {
        echo '- primitive available: ' . $template . "\n";
    }
}

$templateDir = $root . DIRECTORY_SEPARATOR . 'templates';
foreach (glob($templateDir . DIRECTORY_SEPARATOR . '*.js') ?: [] as $file) {
    $content = (string) file_get_contents($file);
    preg_match_all('/href=["\']#!\/([a-z0-9_-]+)\/([a-z0-9_-]+)[^"\']*["\']/i', $content, $matches, PREG_SET_ORDER);
    foreach ($matches as $match) {
        $route = '#!/' . strtolower($match[1]) . '/' . strtolower($match[2]);
        if (!isset($routes[$route])) {
            $errors[] = 'template link references undeclared route: ' . relativePath($root, $file) . ' -> ' . $route;
        }
    }
}

if (!str_contains((string) file_get_contents($root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'routes.md'), 'ui:')) {
    $errors[] = 'docs/routes.md has no route-level ui configuration';
}

if ($errors !== []) {
    echo "\nUI primitive validation failed:\n";
    foreach ($errors as $error) {
        echo '- ' . $error . "\n";
    }
    exit(1);
}

echo "\nUI primitive validation passed.\n";

function declaredRoutes(string $root): array
{
    $routesPath = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'routes.md';
    $content = is_file($routesPath) ? (string) file_get_contents($routesPath) : '';
    preg_match_all('/route:\s*["\'](#!\/[a-z0-9_-]+\/[a-z0-9_-]+)["\']/i', $content, $matches);
    $routes = [];
    foreach ($matches[1] as $route) {
        $routes[strtolower($route)] = true;
    }
    return $routes;
}

function templateExists(string $root, string $template): bool
{
    return is_file($root . DIRECTORY_SEPARATOR . 'templates' . DIRECTORY_SEPARATOR . $template . '.js');
}

function relativePath(string $root, string $path): string
{
    return ltrim(str_replace('\\', '/', str_replace($root, '', $path)), '/');
}

?>