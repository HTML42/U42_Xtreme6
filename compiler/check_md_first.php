<?php

require_once __DIR__ . '/../x/x_pluralize.class.php';

$root = dirname(__DIR__);
$errors = [];

checkObjects($root, $errors);
checkObjectPairs($root, $errors);
checkObjectContracts($root, $errors);
checkApiDimensions($root, $errors);
checkApiContracts($root, $errors);
checkControllers($root, $errors);
checkRouteTemplates($root, $errors);
checkWorkflowReferences($root, $errors);
checkWorkflowContracts($root, $errors);
checkProjectGovernanceDocs($root, $errors);

if ($errors !== []) {
    echo "MD-first check failed:\n";
    foreach ($errors as $error) {
        echo '- ' . $error . "\n";
    }
    exit(1);
}

echo "MD-first check passed.\n";

function checkObjects(string $root, array &$errors): void
{
    $objectDirs = glob($root . DIRECTORY_SEPARATOR . 'objects' . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [];

    foreach ($objectDirs as $dir) {
        $name = basename($dir);
        $md = $dir . DIRECTORY_SEPARATOR . $name . '.class.md';

        foreach (['class.php', 'class.js', 'test.php', 'test.js'] as $suffix) {
            $runtime = $dir . DIRECTORY_SEPARATOR . $name . '.' . $suffix;
            if (is_file($runtime) && !is_file($md)) {
                $errors[] = 'Object runtime without markdown source: ' . relativePath($root, $runtime);
            }
        }
    }
}

function checkObjectPairs(string $root, array &$errors): void
{
    $objectDirs = glob($root . DIRECTORY_SEPARATOR . 'objects' . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [];
    $names = [];
    foreach ($objectDirs as $dir) {
        $names[basename($dir)] = true;
    }

    foreach (array_keys($names) as $name) {
        $singular = XPluralize::singularize($name);
        $plural = XPluralize::pluralize($singular);

        foreach ([$singular, $plural] as $requiredName) {
            $dir = $root . DIRECTORY_SEPARATOR . 'objects' . DIRECTORY_SEPARATOR . $requiredName;
            $md = $dir . DIRECTORY_SEPARATOR . $requiredName . '.class.md';
            if (!is_dir($dir) || !is_file($md)) {
                $errors[] = 'Object pair incomplete for ' . $name . ': missing objects/' . $requiredName . '/' . $requiredName . '.class.md';
            }
        }
    }
}

function checkObjectContracts(string $root, array &$errors): void
{
    $objectDirs = glob($root . DIRECTORY_SEPARATOR . 'objects' . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [];
    $requiredSections = [
        '## role',
        '## generator schema',
        '## properties',
        '## methods',
        '## validation rules',
        '## persistence',
        '## tests',
    ];

    foreach ($objectDirs as $dir) {
        $name = basename($dir);
        $md = $dir . DIRECTORY_SEPARATOR . $name . '.class.md';
        if (!is_file($md)) {
            continue;
        }

        $content = strtolower((string) file_get_contents($md));
        foreach ($requiredSections as $section) {
            if (!str_contains($content, $section)) {
                $errors[] = 'Object contract missing section "' . $section . '": ' . relativePath($root, $md);
            }
        }
    }
}

function checkApiDimensions(string $root, array &$errors): void
{
    $apiDirs = glob($root . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [];

    foreach ($apiDirs as $dir) {
        $dimension = basename($dir);
        $md = $dir . DIRECTORY_SEPARATOR . $dimension . '.md';
        $phpEndpoints = glob($dir . DIRECTORY_SEPARATOR . '*.php') ?: [];

        if ($phpEndpoints !== [] && !is_file($md)) {
            $errors[] = 'API dimension without markdown descriptor: api/' . $dimension;
        }
    }
}

function checkApiContracts(string $root, array &$errors): void
{
    $apiDirs = glob($root . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [];

    foreach ($apiDirs as $dir) {
        $dimension = basename($dir);
        $md = $dir . DIRECTORY_SEPARATOR . $dimension . '.md';
        if (!is_file($md)) {
            continue;
        }

        $content = strtolower((string) file_get_contents($md));
        $requiredSections = [
            '## contract version',
            '## endpoints',
            '## request',
            '## success response',
            '## error responses',
            '## auth requirements',
            '## validation rules',
            '## testability',
        ];

        foreach ($requiredSections as $section) {
            if (!str_contains($content, $section)) {
                $errors[] = 'API contract missing section "' . $section . '": ' . relativePath($root, $md);
            }
        }
    }
}

function checkControllers(string $root, array &$errors): void
{
    $controllerDir = $root . DIRECTORY_SEPARATOR . 'scripts' . DIRECTORY_SEPARATOR . 'controllers';
    if (!is_dir($controllerDir)) {
        return;
    }

    $controllers = glob($controllerDir . DIRECTORY_SEPARATOR . '*.controller.js') ?: [];
    foreach ($controllers as $controller) {
        $md = preg_replace('/\.controller\.js$/', '.controller.md', $controller);
        if (!is_string($md) || !is_file($md)) {
            $errors[] = 'Controller without markdown overlay: ' . relativePath($root, $controller);
        }
    }
}

function checkRouteTemplates(string $root, array &$errors): void
{
    $routesPath = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'routes.md';
    if (!is_file($routesPath)) {
        $errors[] = 'Missing route markdown source: docs/routes.md';
        return;
    }

    $content = (string) file_get_contents($routesPath);
    preg_match_all('/route:\s*["\']#!\/([a-z0-9_-]+)\/([a-z0-9_-]+)["\']/i', $content, $matches, PREG_SET_ORDER);

    $declaredTemplates = [];
    foreach ($matches as $match) {
        $controller = strtolower($match[1]);
        $view = strtolower($match[2]);
        $declaredTemplates['view.' . $controller . '.' . $view . '.js'] = true;
    }

    $templateDir = $root . DIRECTORY_SEPARATOR . 'templates';
    if (!is_dir($templateDir)) {
        return;
    }

    $viewTemplates = glob($templateDir . DIRECTORY_SEPARATOR . 'view.*.*.js') ?: [];
    foreach ($viewTemplates as $template) {
        $name = basename($template);
        if (!isset($declaredTemplates[$name])) {
            $errors[] = 'View template without route markdown source: ' . relativePath($root, $template);
        }
    }

    foreach (array_keys($declaredTemplates) as $name) {
        $template = $templateDir . DIRECTORY_SEPARATOR . $name;
        if (!is_file($template)) {
            $errors[] = 'Declared route without view template: templates/' . $name;
        }
    }
}

function checkWorkflowReferences(string $root, array &$errors): void
{
    $workflowReferences = [];
    $scanDirs = [
        'api',
        'docs',
        'models',
        'objects',
        'scripts',
    ];

    foreach ($scanDirs as $scanDir) {
        $base = $root . DIRECTORY_SEPARATOR . $scanDir;
        if (!is_dir($base)) {
            continue;
        }

        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($base, FilesystemIterator::SKIP_DOTS));
        foreach ($iterator as $file) {
            if (!$file instanceof SplFileInfo || !$file->isFile() || strtolower($file->getExtension()) !== 'md') {
                continue;
            }

            $path = $file->getPathname();
            if (str_contains(str_replace('\\', '/', $path), '/docs/workflows/')) {
                continue;
            }

            $content = (string) file_get_contents($path);
            preg_match_all('/workflow:\s*`?([a-z0-9_.-]+)`?/i', $content, $matches);
            foreach ($matches[1] as $workflow) {
                $workflowReferences[strtolower($workflow)][] = relativePath($root, $path);
            }
        }
    }

    foreach ($workflowReferences as $workflow => $sources) {
        $workflowFile = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'workflows' . DIRECTORY_SEPARATOR . $workflow . '.md';
        if (!is_file($workflowFile)) {
            $errors[] = 'Workflow reference without markdown source: ' . $workflow . ' referenced by ' . implode(', ', $sources);
        }
    }
}

function checkWorkflowContracts(string $root, array &$errors): void
{
    $workflowDir = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'workflows';
    if (!is_dir($workflowDir)) {
        return;
    }

    $workflowFiles = glob($workflowDir . DIRECTORY_SEPARATOR . '*.md') ?: [];
    $requiredSections = [
        '## goal',
        '## inputs',
        '## steps',
        '## api calls',
        '## object calls',
        '## side effects',
        '## success path',
        '## failure paths',
        '## traceability',
    ];

    foreach ($workflowFiles as $workflowFile) {
        $content = strtolower((string) file_get_contents($workflowFile));
        foreach ($requiredSections as $section) {
            if (!str_contains($content, $section)) {
                $errors[] = 'Workflow contract missing section "' . $section . '": ' . relativePath($root, $workflowFile);
            }
        }
    }
}

function checkProjectGovernanceDocs(string $root, array &$errors): void
{
    $required = [
        'docs/md_first.md',
        'docs/routes.md',
        'docs/ui_primitives.md',
        'docs/release_qa.md',
    ];

    foreach ($required as $relative) {
        if (!is_file($root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relative))) {
            $errors[] = 'Missing project governance markdown source: ' . $relative;
        }
    }
}

function relativePath(string $root, string $path): string
{
    return ltrim(str_replace($root, '', $path), DIRECTORY_SEPARATOR);
}

?>
