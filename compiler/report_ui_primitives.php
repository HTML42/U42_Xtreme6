<?php

$root = dirname(__DIR__);
$errors = [];

echo "UI primitives report\n";
echo "====================\n";

$routes = declaredRoutes($root);
$routeConfigs = parseRouteUiConfigs($root, $errors);
$translations = collectTranslations($root);
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

echo "\nRoute UI configuration\n";
foreach ($routeConfigs as $route => $config) {
    echo '- ' . $route . ': layout=' . ($config['layout'] ?? 'missing')
        . ', sidebar=' . boolLabel($config['sidebar'] ?? null)
        . ', breadcrumb=' . boolLabel($config['breadcrumb'] ?? null)
        . ', slideshow=' . (($config['slideshow'] ?? null) === null ? 'none' : (string) ($config['slideshow']['key'] ?? 'configured'))
        . "\n";

    foreach (['header', 'footer', 'sidebar', 'navigation', 'breadcrumb'] as $requiredUiKey) {
        if (!array_key_exists($requiredUiKey, $config)) {
            $errors[] = 'route ui config missing ' . $requiredUiKey . ': ' . $route;
        }
    }

    if (($config['sidebar'] ?? false) === true) {
        if (($config['sidebar_group'] ?? null) === null) {
            $errors[] = 'sidebar-enabled route missing sidebar_group: ' . $route;
        }
    }

    if (($config['breadcrumb'] ?? false) === true) {
        $parent = $config['breadcrumb_parent'] ?? null;
        if (!is_string($parent) || !isset($routes[strtolower($parent)])) {
            $errors[] = 'breadcrumb route has missing/undeclared parent: ' . $route;
        }
    }

    if (is_array($config['slideshow'] ?? null)) {
        foreach (['image', 'alt_key', 'title_key', 'caption_key', 'cta_key', 'target_route', 'keyboard'] as $slideKey) {
            if (!array_key_exists($slideKey, $config['slideshow'])) {
                $errors[] = 'slideshow config missing ' . $slideKey . ': ' . $route;
            }
        }

        foreach (['alt_key', 'title_key', 'caption_key', 'cta_key'] as $translationKeyField) {
            $translationKey = (string) ($config['slideshow'][$translationKeyField] ?? '');
            if ($translationKey !== '' && !isset($translations[$translationKey])) {
                $errors[] = 'slideshow translation key missing: ' . $route . ' -> ' . $translationKey;
            }
        }

        $targetRoute = strtolower((string) ($config['slideshow']['target_route'] ?? ''));
        if ($targetRoute === '' || !isset($routes[$targetRoute])) {
            $errors[] = 'slideshow target route undeclared: ' . $route;
        }

        if (($config['slideshow']['keyboard'] ?? null) !== true) {
            $errors[] = 'slideshow keyboard support must be true: ' . $route;
        }
    }
}

$navigation = parseUiNavigation($root, $errors);
echo "\nRoute UI navigation\n";
foreach (($navigation['header'] ?? []) as $item) {
    echo '- header: ' . $item['route'] . ' -> ' . $item['label_key'] . "\n";
    validateNavigationItem($item, $routes, $translations, $errors, 'header');
}

foreach (($navigation['sidebar_groups'] ?? []) as $groupName => $group) {
    echo '- sidebar group: ' . $groupName . "\n";
    if (!isset($translations[$group['title_key'] ?? ''])) {
        $errors[] = 'sidebar group title translation missing: ' . $groupName;
    }
    foreach (($group['items'] ?? []) as $item) {
        validateNavigationItem($item, $routes, $translations, $errors, 'sidebar group ' . $groupName);
    }
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
    $content = routesBlock($root);
    preg_match_all('/route:\s*["\'](#!\/[a-z0-9_-]+\/[a-z0-9_-]+)["\']/i', $content, $matches);
    $routes = [];
    foreach ($matches[1] as $route) {
        $routes[strtolower($route)] = true;
    }
    return $routes;
}

function parseRouteUiConfigs(string $root, array &$errors): array
{
    $content = routesBlock($root);
    $configs = [];
    preg_match_all('/^\s{2}-\s+route:\s*["\'](#!\/[a-z0-9_-]+\/[a-z0-9_-]+)["\'][\s\S]*?(?=\n\s{2}-\s+route:|\z)/mi', $content, $blocks, PREG_SET_ORDER);

    foreach ($blocks as $block) {
        $route = strtolower($block[1]);
        $text = $block[0];
        $config = [];
        foreach (['header', 'footer', 'sidebar', 'navigation', 'breadcrumb'] as $boolKey) {
            if (preg_match('/\n\s+' . preg_quote($boolKey, '/') . ':\s*(true|false)/i', $text, $match) === 1) {
                $config[$boolKey] = strtolower($match[1]) === 'true';
            }
        }

        foreach (['layout', 'sidebar_group', 'breadcrumb_parent'] as $stringKey) {
            if (preg_match('/\n\s+' . preg_quote($stringKey, '/') . ':\s*(?:"([^"]*)"|null)/i', $text, $match) === 1) {
                $config[$stringKey] = array_key_exists(1, $match) && $match[1] !== '' ? $match[1] : null;
            }
        }

        if (preg_match('/\n\s+slideshow:\s*null/i', $text) === 1) {
            $config['slideshow'] = null;
        } elseif (preg_match('/\n\s+slideshow:\s*\n([\s\S]*?)(?=\n\s{2}-\s+route:|\z)/i', $text, $slideMatch) === 1) {
            $slideText = $slideMatch[1];
            $slide = [];
            foreach (['key', 'image', 'alt_key', 'title_key', 'caption_key', 'cta_key', 'target_route'] as $slideKey) {
                if (preg_match('/\n\s+' . preg_quote($slideKey, '/') . ':\s*"([^"]+)"/i', "\n" . $slideText, $match) === 1) {
                    $slide[$slideKey] = $match[1];
                }
            }
            if (preg_match('/\n\s+keyboard:\s*(true|false)/i', "\n" . $slideText, $match) === 1) {
                $slide['keyboard'] = strtolower($match[1]) === 'true';
            }
            $config['slideshow'] = $slide;
        } else {
            $errors[] = 'route ui config missing slideshow: ' . $route;
        }

        $configs[$route] = $config;
    }

    return $configs;
}

function parseUiNavigation(string $root, array &$errors): array
{
    $content = routesContent($root);
    $navigation = ['header' => [], 'sidebar_groups' => []];

    if (preg_match('/ui_navigation:\s*\n([\s\S]*?)```/i', $content, $match) !== 1) {
        $errors[] = 'docs/routes.md missing ui_navigation block';
        return $navigation;
    }

    $text = $match[1];
    if (preg_match('/\n\s{2}header:\s*\n([\s\S]*?)(?=\n\s{2}sidebar_groups:|\z)/i', "\n" . $text, $headerMatch) === 1) {
        preg_match_all('/-\s+route:\s*"([^"]+)"\s*\n\s+label_key:\s*"([^"]+)"(?:\s*\n\s+visibility:\s*"([^"]+)")?/i', $headerMatch[1], $items, PREG_SET_ORDER);
        foreach ($items as $item) {
            $navigation['header'][] = [
                'route' => $item[1],
                'label_key' => $item[2],
                'visibility' => $item[3] ?? '',
            ];
        }
    }

    if (preg_match_all('/\n\s{4}([a-z0-9_-]+):\s*\n\s+title_key:\s*"([^"]+)"\s*\n\s+items:\s*\n([\s\S]*?)(?=\n\s{4}[a-z0-9_-]+:|\z)/i', "\n" . $text, $groups, PREG_SET_ORDER) >= 1) {
        foreach ($groups as $group) {
            preg_match_all('/-\s+route:\s*"([^"]+)"\s*\n\s+label_key:\s*"([^"]+)"/i', $group[3], $items, PREG_SET_ORDER);
            $navigation['sidebar_groups'][$group[1]] = [
                'title_key' => $group[2],
                'items' => array_map(static fn($item) => ['route' => $item[1], 'label_key' => $item[2]], $items),
            ];
        }
    }

    return $navigation;
}

function collectTranslations(string $root): array
{
    $translations = [];
    $dir = $root . DIRECTORY_SEPARATOR . 'translations';
    foreach (glob($dir . DIRECTORY_SEPARATOR . '*' . DIRECTORY_SEPARATOR . '*.js') ?: [] as $file) {
        $content = (string) file_get_contents($file);
        preg_match_all('/["\']([a-z0-9_.-]+)["\']\s*:/i', $content, $matches);
        foreach ($matches[1] as $key) {
            $translations[$key] = true;
        }
    }
    return $translations;
}

function validateNavigationItem(array $item, array $routes, array $translations, array &$errors, string $context): void
{
    $route = strtolower((string) ($item['route'] ?? ''));
    $labelKey = (string) ($item['label_key'] ?? '');

    if (!isset($routes[$route])) {
        $errors[] = $context . ' navigation references undeclared route: ' . $route;
    }
    if ($labelKey === '' || !isset($translations[$labelKey])) {
        $errors[] = $context . ' navigation label translation missing: ' . $labelKey;
    }
}

function routesContent(string $root): string
{
    $routesPath = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'routes.md';
    return is_file($routesPath) ? (string) file_get_contents($routesPath) : '';
}

function routesBlock(string $root): string
{
    $content = routesContent($root);
    if (preg_match('/routes:\s*\n([\s\S]*?)(?=\nui_navigation:|```)/i', $content, $match) === 1) {
        return $match[1];
    }
    return '';
}

function boolLabel($value): string
{
    if ($value === true) {
        return 'true';
    }
    if ($value === false) {
        return 'false';
    }
    return 'missing';
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