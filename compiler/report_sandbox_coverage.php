<?php

$root = dirname(__DIR__);
$errors = [];

echo "Sandbox coverage report\n";
echo "=======================\n";

$scenarioPath = $root . DIRECTORY_SEPARATOR . 'docs' . DIRECTORY_SEPARATOR . 'sandbox_scenarios.json';
$scenarioConfig = loadJson($scenarioPath, $errors, 'docs/sandbox_scenarios.json');

$documentedEndpoints = collectApiEndpoints($root, $errors);
$scenarioEndpoints = collectScenarioEndpoints($scenarioConfig, $errors);

$requiredTypes = $scenarioConfig['coverage']['requiredScenarioTypes'] ?? [];
if (!is_array($requiredTypes) || $requiredTypes === []) {
    $errors[] = 'docs/sandbox_scenarios.json missing coverage.requiredScenarioTypes';
    $requiredTypes = [];
}

$typesPresent = [];
foreach (($scenarioConfig['scenarios'] ?? []) as $scenarioName => $scenario) {
    if (!is_array($scenario)) {
        continue;
    }
    $type = strtolower((string) ($scenario['type'] ?? $scenarioName));
    $typesPresent[$type] = true;
}

echo 'Scenario source: docs/sandbox_scenarios.json' . "\n";
echo 'Default scenario: ' . (string) ($scenarioConfig['defaultScenario'] ?? 'missing') . "\n";
echo 'Scenario types: ' . implode(', ', array_keys($typesPresent)) . "\n";

foreach ($requiredTypes as $requiredType) {
    $requiredType = strtolower((string) $requiredType);
    if (!isset($typesPresent[$requiredType])) {
        $errors[] = 'missing required sandbox scenario type: ' . $requiredType;
    }
}

echo "\nDocumented API endpoints\n";
foreach ($documentedEndpoints as $endpoint) {
    echo '- ' . $endpoint . "\n";
}

echo "\nScenario endpoint coverage\n";
foreach ($documentedEndpoints as $endpoint) {
    $coveredBy = [];
    foreach ($scenarioEndpoints as $scenarioName => $endpoints) {
        if (isset($endpoints[$endpoint])) {
            $coveredBy[] = $scenarioName;
        }
    }

    if ($coveredBy === []) {
        $errors[] = 'documented endpoint has no sandbox scenario coverage: ' . $endpoint;
        echo '- ' . $endpoint . ': missing' . "\n";
    } else {
        echo '- ' . $endpoint . ': ' . implode(', ', $coveredBy) . "\n";
    }
}

if ($errors !== []) {
    echo "\nSandbox coverage validation failed:\n";
    foreach ($errors as $error) {
        echo '- ' . $error . "\n";
    }
    exit(1);
}

echo "\nSandbox coverage validation passed.\n";

function loadJson(string $path, array &$errors, string $label): array
{
    if (!is_file($path)) {
        $errors[] = 'missing file: ' . $label;
        return [];
    }

    $decoded = json_decode((string) file_get_contents($path), true);
    if (!is_array($decoded)) {
        $errors[] = 'invalid JSON object: ' . $label;
        return [];
    }

    return $decoded;
}

function collectApiEndpoints(string $root, array &$errors): array
{
    $endpoints = [];
    foreach (glob($root . DIRECTORY_SEPARATOR . 'api' . DIRECTORY_SEPARATOR . '*', GLOB_ONLYDIR) ?: [] as $dir) {
        $dimension = basename($dir);
        $md = $dir . DIRECTORY_SEPARATOR . $dimension . '.md';
        if (!is_file($md)) {
            continue;
        }

        $content = (string) file_get_contents($md);
        preg_match_all('/-\s*`?(GET|POST|PUT|PATCH|DELETE)\s+\/api\/([a-z0-9_-]+\/[a-z0-9_-]+)`?/i', $content, $matches, PREG_SET_ORDER);
        foreach ($matches as $match) {
            $endpoints[strtoupper($match[1]) . ' ' . strtolower($match[2])] = true;
        }
    }

    if ($endpoints === []) {
        $errors[] = 'no documented API endpoints found';
    }

    return array_keys($endpoints);
}

function collectScenarioEndpoints(array $scenarioConfig, array &$errors): array
{
    $result = [];
    if (!is_array($scenarioConfig['scenarios'] ?? null)) {
        $errors[] = 'docs/sandbox_scenarios.json missing scenarios object';
        return $result;
    }

    foreach ($scenarioConfig['scenarios'] as $scenarioName => $scenario) {
        if (!is_array($scenario) || !is_array($scenario['endpoints'] ?? null)) {
            $errors[] = 'scenario missing endpoints object: ' . $scenarioName;
            continue;
        }

        $result[(string) $scenarioName] = [];
        foreach ($scenario['endpoints'] as $endpointKey => $definition) {
            $key = normalizeEndpointKey((string) $endpointKey);
            if ($key === null) {
                $errors[] = 'invalid scenario endpoint key: ' . $scenarioName . ' -> ' . $endpointKey;
                continue;
            }

            if (!is_array($definition) || !is_array($definition['payload'] ?? null)) {
                $errors[] = 'scenario endpoint missing payload: ' . $scenarioName . ' -> ' . $endpointKey;
                continue;
            }

            foreach (['success', 'status', 'response', 'errors'] as $payloadKey) {
                if (!array_key_exists($payloadKey, $definition['payload'])) {
                    $errors[] = 'scenario payload missing ' . $payloadKey . ': ' . $scenarioName . ' -> ' . $endpointKey;
                }
            }

            $result[(string) $scenarioName][$key] = true;
        }
    }

    return $result;
}

function normalizeEndpointKey(string $endpointKey): ?string
{
    if (preg_match('/^(GET|POST|PUT|PATCH|DELETE)\s+\/?(?:api\/)?([a-z0-9_-]+\/[a-z0-9_-]+)$/i', trim($endpointKey), $match) !== 1) {
        return null;
    }

    return strtoupper($match[1]) . ' ' . strtolower($match[2]);
}

?>