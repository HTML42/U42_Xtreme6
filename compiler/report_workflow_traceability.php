<?php

$root = dirname(__DIR__);
$workflowDir = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'workflows';

if (!is_dir($workflowDir)) {
    echo "Workflow traceability report: no docs/workflows directory found.\n";
    exit(0);
}

$workflowFiles = glob($workflowDir . DIRECTORY_SEPARATOR . '*.md') ?: [];

echo "Workflow traceability report\n";
echo "============================\n";

foreach ($workflowFiles as $workflowFile) {
    $name = basename($workflowFile, '.md');
    $content = (string) file_get_contents($workflowFile);

    echo "\nWorkflow: " . $name . "\n";
    echo "Source: " . relativePath($root, $workflowFile) . "\n";
    echo "API calls:\n";
    printSectionBullets($content, 'api calls');
    echo "Object calls:\n";
    printSectionBullets($content, 'object calls');
    echo "Traceability:\n";
    printSectionBullets($content, 'traceability');
}

function printSectionBullets(string $content, string $section): void
{
    $pattern = '/^## ' . preg_quote($section, '/') . '\s*$(.*?)(?=^## |\z)/ims';
    if (!preg_match($pattern, $content, $match)) {
        echo "- missing section\n";
        return;
    }

    $body = trim($match[1]);
    if ($body === '') {
        echo "- empty section\n";
        return;
    }

    $lines = preg_split('/\R/', $body) ?: [];
    $printed = false;
    foreach ($lines as $line) {
        $line = trim($line);
        if (str_starts_with($line, '- ')) {
            echo $line . "\n";
            $printed = true;
        }
    }

    if (!$printed) {
        echo '- ' . preg_replace('/\s+/', ' ', $body) . "\n";
    }
}

function relativePath(string $root, string $path): string
{
    return ltrim(str_replace($root, '', $path), DIRECTORY_SEPARATOR);
}

?>