<?php

$root = dirname(__DIR__);
$errors = [];
$supportedComponents = ['input', 'select', 'textarea', 'checkbox', 'radio', 'upload', 'hidden', 'date'];
$requiredSections = [
    '## role',
    '## api contract',
    '## fields',
    '## rendering',
    '## validation',
    '## error handling',
    '## translations',
    '## accessibility',
];

echo "Form component report\n";
echo "=====================\n";

$formsDir = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'forms';
if (!is_dir($formsDir)) {
    $errors[] = 'missing docs/forms directory';
} else {
    foreach (glob($formsDir . DIRECTORY_SEPARATOR . '*.md') ?: [] as $formMd) {
        $relative = relativePath($root, $formMd);
        $content = (string) file_get_contents($formMd);
        $lower = strtolower($content);
        echo "\nForm: " . basename($formMd, '.md') . "\n";

        foreach ($requiredSections as $section) {
            if (!str_contains($lower, $section)) {
                $errors[] = $relative . ': missing required section ' . $section;
            }
        }

        $template = parseInlineValue($content, 'template');
        if ($template === null) {
            $errors[] = $relative . ': missing template mapping';
        } elseif ($template === 'reference-only') {
            echo '- template: reference-only' . "\n";
        } else {
            echo '- template: ' . $template . "\n";
            if (!templateExists($root, $template)) {
                $errors[] = $relative . ': mapped template not found: ' . $template;
            }
        }

        $endpoint = parseInlineValue($content, 'endpoint');
        if ($endpoint === null || !preg_match('/^\/api\/[a-z0-9_-]+\/[a-z0-9_-]+$/', $endpoint)) {
            $errors[] = $relative . ': missing or invalid endpoint';
        } else {
            echo '- endpoint: ' . $endpoint . "\n";
        }

        preg_match_all('/^-\s+component:\s*([a-z0-9_-]+)/mi', $content, $componentMatches);
        foreach ($componentMatches[1] as $component) {
            $component = strtolower($component);
            if (!in_array($component, $supportedComponents, true)) {
                $errors[] = $relative . ': unsupported component type ' . $component;
            }
        }
        echo '- fields: ' . count($componentMatches[1]) . "\n";

        if (in_array('upload', array_map('strtolower', $componentMatches[1]), true)) {
            foreach (['accept', 'max size', 'max files'] as $uploadKey) {
                if (parseInlineValue($content, $uploadKey) === null) {
                    $errors[] = $relative . ': upload field missing ' . $uploadKey;
                }
            }
        }

        preg_match_all('/`(forms\.[a-z0-9_.-]+)`/i', $content, $translationMatches);
        foreach (array_unique($translationMatches[1]) as $translationKey) {
            if (!translationKeyExists($root, $translationKey)) {
                $errors[] = $relative . ': missing translation key ' . $translationKey;
            }
        }
    }
}

if ($errors !== []) {
    echo "\nForm component validation failed:\n";
    foreach ($errors as $error) {
        echo '- ' . $error . "\n";
    }
    exit(1);
}

echo "\nForm component validation passed.\n";

function parseInlineValue(string $content, string $key): ?string
{
    if (preg_match('/^-\s*' . preg_quote($key, '/') . ':\s*`?([^`\r\n]+)`?/mi', $content, $match) === 1) {
        return trim($match[1]);
    }
    return null;
}

function templateExists(string $root, string $template): bool
{
    $templatesDir = $root . DIRECTORY_SEPARATOR . 'templates';
    $file = $templatesDir . DIRECTORY_SEPARATOR . str_replace('.', '.', strtolower($template)) . '.js';
    if (is_file($file)) {
        return true;
    }

    foreach (glob($templatesDir . DIRECTORY_SEPARATOR . '*.js') ?: [] as $templateFile) {
        $content = (string) file_get_contents($templateFile);
        if (str_contains($content, "window.TEMPLATES['" . $template . "']") || str_contains($content, 'window.TEMPLATES["' . $template . '"]')) {
            return true;
        }
    }

    return false;
}

function translationKeyExists(string $root, string $key): bool
{
    $translationDir = $root . DIRECTORY_SEPARATOR . 'translations';
    if (!is_dir($translationDir)) {
        return false;
    }

    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($translationDir, FilesystemIterator::SKIP_DOTS));
    foreach ($iterator as $file) {
        if (!$file instanceof SplFileInfo || !$file->isFile() || strtolower($file->getExtension()) !== 'js') {
            continue;
        }

        if (str_contains((string) file_get_contents($file->getPathname()), "'" . $key . "'") || str_contains((string) file_get_contents($file->getPathname()), '"' . $key . '"')) {
            return true;
        }
    }

    return false;
}

function relativePath(string $root, string $path): string
{
    return ltrim(str_replace('\\', '/', str_replace($root, '', $path)), '/');
}

?>