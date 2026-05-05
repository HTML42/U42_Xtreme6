<?php

$root = dirname(__DIR__);
$dist = $root . DIRECTORY_SEPARATOR . 'dist';
$errors = [];

if (!is_dir($dist) && !mkdir($dist, 0777, true) && !is_dir($dist)) {
    echo "Traceability dashboard failed: cannot create dist directory.\n";
    exit(1);
}

echo "MD traceability dashboard\n";
echo "=========================\n";

$features = [];
$features = array_merge($features, collectObjects($root));
$features = array_merge($features, collectModels($root));
$features = array_merge($features, collectApis($root));
$features = array_merge($features, collectWorkflows($root));
$features = array_merge($features, collectRoutes($root));
$features = array_merge($features, collectForms($root));
$features = array_merge($features, collectUiPrimitives($root));
$features = array_merge($features, collectSecrets($root));
$features = array_merge($features, collectSandbox($root));

foreach ($features as &$feature) {
    $feature['status'] = determineStatus($feature);
    if ($feature['status'] !== 'release-ready') {
        $errors[] = $feature['domain'] . '/' . $feature['name'] . ' is not release-ready: ' . $feature['status'];
    }
}
unset($feature);

$summary = summarize($features);

echo "\nSummary\n";
foreach ($summary as $key => $value) {
    echo '- ' . $key . ': ' . $value . "\n";
}

echo "\nFeatures\n";
foreach ($features as $feature) {
    echo '- [' . $feature['status'] . '] ' . $feature['domain'] . '/' . $feature['name'] . "\n";
    echo '  - md: ' . implodeOrNone($feature['md_sources']) . "\n";
    echo '  - runtime: ' . implodeOrNone($feature['runtime_artifacts']) . "\n";
    echo '  - checks: ' . implodeOrNone($feature['checks']) . "\n";
}

$report = [
    'generated_at' => date(DATE_ATOM),
    'summary' => $summary,
    'features' => $features,
];

file_put_contents(
    $dist . DIRECTORY_SEPARATOR . 'traceability_dashboard.json',
    json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n"
);

if ($errors !== []) {
    echo "\nTraceability dashboard validation failed:\n";
    foreach ($errors as $error) {
        echo '- ' . $error . "\n";
    }
    exit(1);
}

echo "\nTraceability dashboard validation passed.\n";
echo "Report: dist/traceability_dashboard.json\n";

function collectObjects(string $root): array
{
    $features = [];
    foreach (glob($root . DIRECTORY_SEPARATOR . 'objects' . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [] as $dir) {
        $name = basename($dir);
        $md = 'objects/' . $name . '/' . $name . '.class.md';
        $runtime = [
            'objects/' . $name . '/' . $name . '.class.php',
            'objects/' . $name . '/' . $name . '.class.js',
            'objects/' . $name . '/' . $name . '.test.php',
            'objects/' . $name . '/' . $name . '.test.js',
        ];

        $features[] = feature('objects', $name, [$md], existingPaths($root, $runtime), [
            'php compiler/check_md_first.php',
            'php compiler/report_object_generation.php',
        ]);
    }
    return $features;
}

function collectModels(string $root): array
{
    $features = [];
    foreach (glob($root . DIRECTORY_SEPARATOR . 'models' . DIRECTORY_SEPARATOR . '*.md') ?: [] as $file) {
        $name = basename($file, '.md');
        $features[] = feature('models', $name, ['models/' . basename($file)], [], [
            'php compiler/report_model_schema.php',
            'php compiler/report_model_relationships.php',
        ]);
    }
    return $features;
}

function collectApis(string $root): array
{
    $features = [];
    foreach (glob($root . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [] as $dir) {
        $dimension = basename($dir);
        $md = 'api/' . $dimension . '/' . $dimension . '.md';
        if (!is_file($root . DIRECTORY_SEPARATOR . $md)) {
            continue;
        }
        $runtime = [];
        foreach (glob($dir . DIRECTORY_SEPARATOR . '*.php') ?: [] as $php) {
            $runtime[] = 'api/' . $dimension . '/' . basename($php);
        }
        $features[] = feature('api', $dimension, [$md], $runtime, [
            'php compiler/report_api_contracts.php',
            'php compiler/check_frontend_boundary.php',
        ]);
    }
    return $features;
}

function collectWorkflows(string $root): array
{
    $features = [];
    foreach (glob($root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'workflows' . DIRECTORY_SEPARATOR . '*.md') ?: [] as $file) {
        $name = basename($file, '.md');
        $features[] = feature('workflows', $name, ['docs/workflows/' . basename($file)], [], [
            'php compiler/check_md_first.php',
            'php compiler/report_workflow_traceability.php',
        ]);
    }
    return $features;
}

function collectRoutes(string $root): array
{
    $features = [];
    $routes = parseRoutes($root);
    foreach ($routes as $route) {
        $controller = $route['controller'];
        $view = $route['view'];
        $features[] = feature('routes', $controller . '/' . $view, ['docs/routes.md'], existingPaths($root, [
            'scripts/controllers/' . $controller . '.controller.md',
            'scripts/controllers/' . $controller . '.controller.js',
            'templates/view.' . $controller . '.' . $view . '.js',
        ]), [
            'php compiler/check_md_first.php',
            'php compiler/report_ui_primitives.php',
        ]);
    }
    return $features;
}

function collectForms(string $root): array
{
    $features = [];
    foreach (glob($root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'forms' . DIRECTORY_SEPARATOR . '*.md') ?: [] as $file) {
        $name = basename($file, '.md');
        $features[] = feature('forms', $name, ['docs/forms/' . basename($file)], [], [
            'php compiler/report_form_components.php',
            'php compiler/report_form_flows.php',
        ]);
    }
    return $features;
}

function collectUiPrimitives(string $root): array
{
    $templates = existingPaths($root, [
        'templates/body.js',
        'templates/header.js',
        'templates/sidebar.js',
        'templates/footer.js',
        'templates/breadcrumb.js',
        'templates/slideshow.js',
    ]);
    return [feature('ui_primitives', 'route_composition', ['docs/ui_primitives.md', 'docs/routes.md'], $templates, [
        'php compiler/report_ui_primitives.php',
    ])];
}

function collectSecrets(string $root): array
{
    return [feature('secrets', 'credentials_provider', ['docs/secrets.md', '_secrets.example.json'], ['compiler/report_secret_usage.php'], [
        'php compiler/report_secret_usage.php',
        'php compiler/check_secret_leaks.php',
    ])];
}

function collectSandbox(string $root): array
{
    return [feature('sandbox', 'mock_scenarios', ['docs/sandbox.md', 'docs/sandbox_scenarios.json'], ['scripts/x_api_mocks.js'], [
        'php compiler/report_sandbox_coverage.php',
    ])];
}

function parseRoutes(string $root): array
{
    $path = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'routes.md';
    $content = is_file($path) ? (string) file_get_contents($path) : '';
    if (preg_match('/routes:\s*\n([\s\S]*?)(?=\nui_navigation:|```)/i', $content, $blockMatch) === 1) {
        $content = $blockMatch[1];
    }
    preg_match_all('/^\s{2}-\s+route:\s*"#!\/([a-z0-9_-]+)\/([a-z0-9_-]+)"/mi', $content, $matches, PREG_SET_ORDER);
    $routes = [];
    $seen = [];
    foreach ($matches as $match) {
        $key = strtolower($match[1]) . '/' . strtolower($match[2]);
        if (isset($seen[$key])) {
            continue;
        }
        $seen[$key] = true;
        $routes[] = ['controller' => strtolower($match[1]), 'view' => strtolower($match[2])];
    }
    return $routes;
}

function feature(string $domain, string $name, array $mdSources, array $runtimeArtifacts, array $checks): array
{
    return [
        'domain' => $domain,
        'name' => $name,
        'md_sources' => array_values($mdSources),
        'runtime_artifacts' => array_values($runtimeArtifacts),
        'checks' => array_values($checks),
    ];
}

function determineStatus(array $feature): string
{
    if ($feature['md_sources'] === []) {
        return 'missing-md';
    }
    if ($feature['checks'] === []) {
        return 'implemented';
    }
    if ($feature['runtime_artifacts'] === [] && in_array($feature['domain'], ['objects', 'api', 'routes', 'ui_primitives', 'secrets', 'sandbox'], true)) {
        return 'specified';
    }
    return 'release-ready';
}

function existingPaths(string $root, array $paths): array
{
    $existing = [];
    foreach ($paths as $path) {
        if (is_file($root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $path))) {
            $existing[] = $path;
        }
    }
    return $existing;
}

function summarize(array $features): array
{
    $summary = [
        'total' => count($features),
        'specified' => 0,
        'generated' => 0,
        'implemented' => 0,
        'tested' => 0,
        'release-ready' => 0,
    ];
    foreach ($features as $feature) {
        $status = $feature['status'] ?? 'specified';
        if (!array_key_exists($status, $summary)) {
            $summary[$status] = 0;
        }
        $summary[$status]++;
    }
    return $summary;
}

function implodeOrNone(array $values): string
{
    return $values === [] ? 'none' : implode(', ', $values);
}

?>