<?php

$root = dirname(__DIR__);
$errors = [];

echo "AI generation report\n";
echo "====================\n";

$changedFiles = gitChangedFiles($root);
$groups = classifyFiles($changedFiles);

echo "Changed files by category\n";
foreach ($groups as $group => $files) {
    echo '- ' . $group . ': ' . count($files) . "\n";
    foreach ($files as $file) {
        echo '  - ' . $file . "\n";
    }
}

$hasMarkdownSource = $groups['markdown'] !== [];
$hasRuntime = $groups['runtime'] !== [] || $groups['compiler'] !== [];
$hasGenerated = $groups['generated'] !== [];
$hasGovernanceEvidence = $groups['governance'] !== [];

echo "\nEvidence\n";
echo '- markdown/source evidence: ' . yesNo($hasMarkdownSource) . "\n";
echo '- runtime/compiler changes: ' . yesNo($hasRuntime) . "\n";
echo '- generated artifacts changed: ' . yesNo($hasGenerated) . "\n";
echo '- governance evidence: ' . yesNo($hasGovernanceEvidence) . "\n";

$runtimeOnly = [];
if (($hasRuntime || $hasGenerated) && !$hasMarkdownSource) {
    $runtimeOnly = array_merge($groups['runtime'], $groups['compiler'], $groups['generated']);
    $errors[] = 'runtime/compiler/generated changes without markdown source evidence';
}

if ($hasGenerated && !$hasRuntime && !$hasMarkdownSource) {
    $errors[] = 'generated artifacts changed without visible source changes';
}

if (($hasRuntime || $hasGenerated) && !$hasMarkdownSource && !$hasGovernanceEvidence) {
    $errors[] = 'manager evidence incomplete: include markdown or governance evidence after QA';
}

echo "\nRuntime-only risk\n";
if ($runtimeOnly === []) {
    echo "- none detected\n";
} else {
    foreach ($runtimeOnly as $file) {
        echo '- ' . $file . "\n";
    }
}

echo "\nRecommended QA commands\n";
foreach (requiredQaCommands() as $command) {
    echo '- ' . $command . "\n";
}

if ($errors !== []) {
    echo "\nAI generation validation failed:\n";
    foreach ($errors as $error) {
        echo '- ' . $error . "\n";
    }
    exit(1);
}

echo "\nAI generation validation passed.\n";

function gitChangedFiles(string $root): array
{
    $command = 'git -C ' . escapeshellarg($root) . ' --no-pager status --short';
    exec($command, $lines, $exitCode);
    if ($exitCode !== 0) {
        return [];
    }

    $files = [];
    foreach ($lines as $line) {
        $path = trim(substr($line, 3));
        if ($path === '') {
            continue;
        }
        if (str_contains($path, ' -> ')) {
            $parts = explode(' -> ', $path);
            $path = end($parts);
        }
        $normalizedPath = str_replace('\\', '/', $path);
        if (in_array($normalizedPath, ignoredGeneratedReports(), true)) {
            continue;
        }

        $files[] = $normalizedPath;
    }

    sort($files, SORT_STRING);
    return array_values(array_unique($files));
}

function ignoredGeneratedReports(): array
{
    return [
        'dist/release_gate_report.json',
        'dist/traceability_dashboard.json',
    ];
}

function classifyFiles(array $files): array
{
    $groups = [
        'markdown' => [],
        'runtime' => [],
        'compiler' => [],
        'generated' => [],
        'governance' => [],
        'other' => [],
    ];

    foreach ($files as $file) {
        if (str_starts_with($file, 'dist/')) {
            $groups['generated'][] = $file;
            continue;
        }
        if (in_array($file, ['agents.md', '_config.json', '_config.example.json', '.gitignore'], true)) {
            $groups['governance'][] = $file;
            continue;
        }
        if (str_ends_with($file, '.md') || str_starts_with($file, 'docs/') || str_starts_with($file, 'api/') && str_ends_with($file, '.md') || str_starts_with($file, 'objects/') && str_ends_with($file, '.md') || str_starts_with($file, 'models/') && str_ends_with($file, '.md')) {
            $groups['markdown'][] = $file;
            continue;
        }
        if (str_starts_with($file, 'compiler/')) {
            $groups['compiler'][] = $file;
            continue;
        }
        if (preg_match('/\.(php|js|css)$/i', $file) === 1 || str_starts_with($file, 'scripts/') || str_starts_with($file, 'templates/') || str_starts_with($file, 'styles/') || str_starts_with($file, 'x/')) {
            $groups['runtime'][] = $file;
            continue;
        }
        $groups['other'][] = $file;
    }

    return $groups;
}

function requiredQaCommands(): array
{
    return [
        'php compiler/release_gate.php',
        'php compiler/check_md_first.php',
        'php compiler/check_secret_leaks.php',
        'php compiler/report_secret_usage.php',
        'php compiler/report_sandbox_coverage.php',
        'php compiler/report_ai_generation.php',
        'php compiler/report_api_contracts.php',
        'php compiler/check_frontend_boundary.php',
        'php compiler/compile_scripts.php',
        'php compiler/compile_production.php',
        'php compiler/smoke_database.php',
        'git --no-pager diff --stat',
    ];
}

function yesNo(bool $value): string
{
    return $value ? 'yes' : 'no';
}

?>