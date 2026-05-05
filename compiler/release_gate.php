<?php

$root = dirname(__DIR__);
$dist = $root . DIRECTORY_SEPARATOR . 'dist';
if (!is_dir($dist) && !mkdir($dist, 0777, true) && !is_dir($dist)) {
    fwrite(STDERR, "Release gate failed: cannot create dist directory.\n");
    exit(1);
}

$reportPath = $dist . DIRECTORY_SEPARATOR . 'release_gate_report.json';
if (is_file($reportPath)) {
    unlink($reportPath);
}

$checks = [
    ['id' => 'md_first', 'command' => 'php compiler/check_md_first.php', 'blocks' => true],
    ['id' => 'secret_leaks_prebuild', 'command' => 'php compiler/check_secret_leaks.php', 'blocks' => true],
    ['id' => 'secret_usage', 'command' => 'php compiler/report_secret_usage.php', 'blocks' => true],
    ['id' => 'sandbox_coverage', 'command' => 'php compiler/report_sandbox_coverage.php', 'blocks' => true],
    ['id' => 'ai_generation', 'command' => 'php compiler/report_ai_generation.php', 'blocks' => true],
    ['id' => 'traceability_dashboard', 'command' => 'php compiler/report_traceability_dashboard.php', 'blocks' => true],
    ['id' => 'workflow_traceability', 'command' => 'php compiler/report_workflow_traceability.php', 'blocks' => true],
    ['id' => 'object_generation', 'command' => 'php compiler/report_object_generation.php', 'blocks' => true],
    ['id' => 'model_schema', 'command' => 'php compiler/report_model_schema.php', 'blocks' => true],
    ['id' => 'model_relationships', 'command' => 'php compiler/report_model_relationships.php', 'blocks' => true],
    ['id' => 'api_contracts', 'command' => 'php compiler/report_api_contracts.php', 'blocks' => true],
    ['id' => 'frontend_boundary', 'command' => 'php compiler/check_frontend_boundary.php', 'blocks' => true],
    ['id' => 'form_components', 'command' => 'php compiler/report_form_components.php', 'blocks' => true],
    ['id' => 'form_flows', 'command' => 'php compiler/report_form_flows.php', 'blocks' => true],
    ['id' => 'ui_primitives', 'command' => 'php compiler/report_ui_primitives.php', 'blocks' => true],
    ['id' => 'compile_objects', 'command' => 'php compiler/compile_objects.php', 'blocks' => true],
    ['id' => 'compile_scripts', 'command' => 'php compiler/compile_scripts.php', 'blocks' => true],
    ['id' => 'compile_styles', 'command' => 'php compiler/compile_styles.php', 'blocks' => true],
    ['id' => 'compile_production', 'command' => 'php compiler/compile_production.php', 'blocks' => true],
    ['id' => 'secret_leaks_postbuild', 'command' => 'php compiler/check_secret_leaks.php', 'blocks' => true],
    ['id' => 'smoke_database', 'command' => 'php compiler/smoke_database.php', 'blocks' => true, 'allow_skip' => true],
];

echo "Release gate\n";
echo "============\n";

$startedAt = date(DATE_ATOM);
$results = [];
$failed = false;

foreach ($checks as $check) {
    echo "\n[release_gate] running {$check['id']}: {$check['command']}\n";
    $started = microtime(true);
    $output = [];
    $exitCode = 0;
    exec('cd ' . escapeshellarg($root) . ' && ' . $check['command'] . ' 2>&1', $output, $exitCode);
    $durationMs = (int) round((microtime(true) - $started) * 1000);
    $text = implode("\n", $output);
    $reportText = sanitizeReportOutput($text);
    $skipped = ($check['allow_skip'] ?? false) && preg_match('/\bskipped:/i', $text) === 1 && $exitCode === 0;
    $passed = $exitCode === 0;

    echo $text !== '' ? $text . "\n" : "(no output)\n";
    echo '[release_gate] ' . ($passed ? ($skipped ? 'skipped-ok' : 'passed') : 'failed') . " ({$durationMs} ms)\n";

    $results[] = [
        'id' => $check['id'],
        'command' => $check['command'],
        'exit_code' => $exitCode,
        'passed' => $passed,
        'skipped' => $skipped,
        'blocks_release' => (bool) $check['blocks'],
        'duration_ms' => $durationMs,
        'output' => $reportText,
    ];

    if (!$passed && ($check['blocks'] ?? true)) {
        $failed = true;
    }
}

$summary = [
    'started_at' => $startedAt,
    'finished_at' => date(DATE_ATOM),
    'success' => !$failed,
    'total' => count($results),
    'passed' => count(array_filter($results, static fn($result) => $result['passed'] && !$result['skipped'])),
    'skipped' => count(array_filter($results, static fn($result) => $result['skipped'])),
    'failed' => count(array_filter($results, static fn($result) => !$result['passed'])),
];

$report = [
    'summary' => $summary,
    'results' => $results,
];

file_put_contents($reportPath, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n");

echo "\nRelease gate summary\n";
echo "--------------------\n";
echo '- success: ' . ($summary['success'] ? 'yes' : 'no') . "\n";
echo '- total: ' . $summary['total'] . "\n";
echo '- passed: ' . $summary['passed'] . "\n";
echo '- skipped-ok: ' . $summary['skipped'] . "\n";
echo '- failed: ' . $summary['failed'] . "\n";
echo '- report: dist/release_gate_report.json' . "\n";

exit($failed ? 1 : 0);

function sanitizeReportOutput(string $output): string
{
    $replacements = [
        '/api_secret/i' => 'credential_secret_key',
        '/api_key/i' => 'credential_public_key',
        '/client_secret/i' => 'client_credential_secret',
        '/private_key/i' => 'private_credential_key',
    ];

    foreach ($replacements as $pattern => $replacement) {
        $output = preg_replace($pattern, $replacement, $output) ?? $output;
    }

    return $output;
}

?>