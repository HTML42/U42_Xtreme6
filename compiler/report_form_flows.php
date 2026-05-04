<?php

$root = dirname(__DIR__);
$errors = [];

echo "Form flow audit\n";
echo "===============\n";

$documentedForms = loadDocumentedForms($root);
$runtimeForms = loadRuntimeForms($root);
$controllerBindings = loadControllerBindings($root);

echo "\nDocumented forms: " . count($documentedForms) . "\n";
foreach ($documentedForms as $formId => $form) {
    echo '- ' . $formId . ' -> ' . $form['endpoint'] . "\n";
}

echo "\nRuntime forms: " . count($runtimeForms) . "\n";
foreach ($runtimeForms as $formId => $form) {
    echo '- ' . $formId . ' in ' . $form['source'] . "\n";
}

foreach ($runtimeForms as $formId => $form) {
    if (!isset($documentedForms[$formId])) {
        $errors[] = 'runtime form without docs/forms source: ' . $formId . ' in ' . $form['source'];
        continue;
    }

    if (!$form['hasStatus']) {
        $errors[] = 'runtime form missing .x_form_status live region: ' . $formId . ' in ' . $form['source'];
    }
    if (!$form['hasSubmit']) {
        $errors[] = 'runtime form missing submit button: ' . $formId . ' in ' . $form['source'];
    }
    if ($form['hasAction']) {
        $errors[] = 'runtime form has action attribute; submit must be FormAjax only: ' . $formId . ' in ' . $form['source'];
    }
}

foreach ($documentedForms as $formId => $form) {
    if ($form['referenceOnly']) {
        continue;
    }

    if (!isset($runtimeForms[$formId])) {
        $errors[] = 'documented form without runtime template form id: ' . $formId . ' in ' . $form['source'];
    }
    if (!isset($controllerBindings[$formId])) {
        $errors[] = 'documented form without controller FormAjax binding: ' . $formId . ' in ' . $form['source'];
    }
}

if (!frontendUsesSubmitForm($root)) {
    $errors[] = 'XApi.submitForm(...) usage not found in frontend controllers';
}

if (frontendUsesNativeSubmit($root)) {
    $errors[] = 'native form.submit() usage found in frontend scripts; use XApi.submitForm(...)';
}

if ($errors !== []) {
    echo "\nForm flow audit failed:\n";
    foreach ($errors as $error) {
        echo '- ' . $error . "\n";
    }
    exit(1);
}

echo "\nForm flow audit passed. All runtime forms are documented and bound to FormAjax.\n";

function loadDocumentedForms(string $root): array
{
    $forms = [];
    $formsDir = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'forms';
    foreach (glob($formsDir . DIRECTORY_SEPARATOR . '*.md') ?: [] as $file) {
        $content = (string) file_get_contents($file);
        $formId = parseInlineValue($content, 'form id');
        if ($formId === null) {
            continue;
        }

        $template = parseInlineValue($content, 'template') ?? parseInlineValue($content, 'generated/runtime template') ?? '';
        $forms[$formId] = [
            'source' => relativePath($root, $file),
            'endpoint' => parseInlineValue($content, 'endpoint') ?? 'missing',
            'template' => $template,
            'referenceOnly' => $template === 'reference-only' || str_contains($content, 'reference-only'),
        ];
    }

    return $forms;
}

function loadRuntimeForms(string $root): array
{
    $forms = [];
    $templateDir = $root . DIRECTORY_SEPARATOR . 'templates';
    foreach (glob($templateDir . DIRECTORY_SEPARATOR . '*.js') ?: [] as $file) {
        $content = (string) file_get_contents($file);
        preg_match_all('/<form\b([^>]*)>([\s\S]*?)<\/form>/i', $content, $matches, PREG_SET_ORDER);
        foreach ($matches as $match) {
            $attrs = $match[1];
            $inner = $match[2];
            if (preg_match('/\bid=["\']([^"\']+)["\']/i', $attrs, $idMatch) !== 1) {
                continue;
            }

            $formId = $idMatch[1];
            $forms[$formId] = [
                'source' => relativePath($root, $file),
                'hasStatus' => str_contains($inner, 'x_form_status') && str_contains($inner, 'aria-live'),
                'hasSubmit' => preg_match('/type=["\']submit["\']/i', $inner) === 1,
                'hasAction' => preg_match('/\baction=["\']/i', $attrs) === 1,
            ];
        }
    }

    return $forms;
}

function loadControllerBindings(string $root): array
{
    $bindings = [];
    $scriptsDir = $root . DIRECTORY_SEPARATOR . 'scripts';
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($scriptsDir, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if (!$file instanceof SplFileInfo || !$file->isFile() || strtolower($file->getExtension()) !== 'js') {
            continue;
        }

        $content = (string) file_get_contents($file->getPathname());
        preg_match_all('/bindForm\(\s*["\']([^"\']+)["\']/i', $content, $matches);
        foreach ($matches[1] as $formId) {
            $bindings[$formId] = relativePath($root, $file->getPathname());
        }
    }

    return $bindings;
}

function frontendUsesSubmitForm(string $root): bool
{
    return frontendContains($root, '/XApi\.submitForm\s*\(/');
}

function frontendUsesNativeSubmit(string $root): bool
{
    return frontendContains($root, '/\.submit\s*\(/');
}

function frontendContains(string $root, string $pattern): bool
{
    $scriptsDir = $root . DIRECTORY_SEPARATOR . 'scripts';
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($scriptsDir, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if (!$file instanceof SplFileInfo || !$file->isFile() || strtolower($file->getExtension()) !== 'js') {
            continue;
        }

        if (preg_match($pattern, (string) file_get_contents($file->getPathname())) === 1) {
            return true;
        }
    }

    return false;
}

function parseInlineValue(string $content, string $key): ?string
{
    if (preg_match('/^-\s*' . preg_quote($key, '/') . ':\s*`?([^`\r\n]+)`?/mi', $content, $match) === 1) {
        return trim($match[1]);
    }
    return null;
}

function relativePath(string $root, string $path): string
{
    return ltrim(str_replace('\\', '/', str_replace($root, '', $path)), '/');
}

?>