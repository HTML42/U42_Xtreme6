<?php

// x_functions.php
// Framework-specific helper functions (x core).

if (!function_exists('x_path_join')) {
    function x_path_join(string ...$parts): string
    {
        $clean = [];
        foreach ($parts as $part) {
            if ($part === '') {
                continue;
            }
            $clean[] = trim($part, "/\\");
        }

        if ($clean === []) {
            return '';
        }

        return implode(DIRECTORY_SEPARATOR, $clean);
    }
}

if (!function_exists('x_user_class_name')) {
    /**
     * Resolves the project-priority user class.
     *
     * Priority:
     * 1) User (project)
     * 2) XUser (framework)
     */
    function x_user_class_name(): string
    {
        if (class_exists('User')) {
            return 'User';
        }

        return 'XUser';
    }
}

if (!function_exists('x_user_new')) {
    /**
     * Creates a user instance using project-priority class resolution.
     */
    function x_user_new(int $id = 0): object
    {
        $class = x_user_class_name();
        return new $class($id);
    }
}

if (!function_exists('x_user_load')) {
    /**
     * Loads a user using project-priority class resolution.
     */
    function x_user_load($identification = null): object
    {
        $class = x_user_class_name();

        if (is_callable([$class, 'load'])) {
            return $class::load($identification);
        }

        return x_user_new((int) ($identification ?? 0));
    }
}

if (!function_exists('x_config_load')) {
    /**
     * Loads environment-local project config with committed example fallback.
     */
    function x_config_load(): array
    {
        static $cache = null;

        if (is_array($cache)) {
            return $cache;
        }

        $root = dirname(__DIR__);
        $paths = [
            $root . DIRECTORY_SEPARATOR . '_config.json',
            $root . DIRECTORY_SEPARATOR . '_config.example.json',
        ];

        foreach ($paths as $path) {
            if (!is_file($path)) {
                continue;
            }

            $decoded = json_decode((string) file_get_contents($path), true);
            $cache = is_array($decoded) ? $decoded : [];
            return $cache;
        }

        $cache = [];
        return $cache;
    }
}

if (!function_exists('x_secrets_load')) {
    /**
     * Loads environment-local secret provider configuration from _secrets.json.
     * Secrets must never be exposed to frontend runtime config.
     */
    function x_secrets_load(?string $provider = null): array
    {
        static $cache = [];

        $providerName = strtolower((string) ($provider ?? 'local_file'));
        if (isset($cache[$providerName])) {
            return $cache[$providerName];
        }

        if ($providerName === 'env') {
            $cache[$providerName] = [
                'provider' => [
                    'default' => 'env',
                    'environment' => strtolower((string) (x_config_load()['Environment'] ?? getenv('APP_ENV') ?: 'dev')),
                ],
                'services' => [],
            ];
            return $cache[$providerName];
        }

        $path = dirname(__DIR__) . DIRECTORY_SEPARATOR . '_secrets.json';
        if (!is_file($path)) {
            $cache[$providerName] = [];
            return $cache[$providerName];
        }

        $decoded = json_decode((string) file_get_contents($path), true);
        $cache[$providerName] = is_array($decoded) ? $decoded : [];
        return $cache[$providerName];
    }
}

if (!function_exists('x_secret_provider_name')) {
    /**
     * Resolves the configured provider name, optionally for a service.
     */
    function x_secret_provider_name(array $secrets = [], ?string $service = null): string
    {
        $provider = $secrets['provider']['default'] ?? $secrets['provider']['type'] ?? 'local_file';

        if ($service !== null && isset($secrets['services'][$service]['provider'])) {
            $serviceProvider = $secrets['services'][$service]['provider'];
            $provider = is_array($serviceProvider) ? ($serviceProvider['type'] ?? $provider) : $serviceProvider;
        }

        $provider = strtolower((string) $provider);
        return in_array($provider, ['local_file', 'env', 'vault'], true) ? $provider : 'local_file';
    }
}

if (!function_exists('x_secret_env_name')) {
    /**
     * Resolves an environment-variable mapping for a secret dot-path.
     */
    function x_secret_env_name(string $path, array $secrets = []): ?string
    {
        $path = trim($path);
        if ($path === '') {
            return null;
        }

        if (isset($secrets['env'][$path]) && is_string($secrets['env'][$path])) {
            return $secrets['env'][$path];
        }

        $segments = explode('.', $path);
        if (($segments[0] ?? '') === 'services' && isset($segments[1])) {
            $service = $segments[1];
            $serviceConfig = $secrets['services'][$service] ?? [];
            $relativePath = implode('.', array_slice($segments, 2));
            if (isset($serviceConfig['env'][$relativePath]) && is_string($serviceConfig['env'][$relativePath])) {
                return $serviceConfig['env'][$relativePath];
            }
            if (isset($serviceConfig['env'][$path]) && is_string($serviceConfig['env'][$path])) {
                return $serviceConfig['env'][$path];
            }
        }

        return null;
    }
}

if (!function_exists('x_secret_get')) {
    /**
     * Reads a dot-path secret value through the configured provider without exposing the full store.
     */
    function x_secret_get(string $path, $default = null)
    {
        $segments = array_values(array_filter(explode('.', trim($path)), static fn($segment) => $segment !== ''));
        if ($segments === []) {
            return $default;
        }

        $current = x_secrets_load();
        $service = (($segments[0] ?? '') === 'services' && isset($segments[1])) ? $segments[1] : null;
        $provider = x_secret_provider_name($current, $service);

        $envName = x_secret_env_name(implode('.', $segments), $current);
        if ($envName !== null) {
            $envValue = getenv($envName);
            if ($envValue !== false && $envValue !== '') {
                return $envValue;
            }
        }

        if ($provider === 'env') {
            $derivedEnvName = 'X6_' . strtoupper(preg_replace('/[^a-z0-9]+/i', '_', implode('.', $segments)) ?? '');
            $envValue = getenv($derivedEnvName);
            return ($envValue !== false && $envValue !== '') ? $envValue : $default;
        }

        if ($provider === 'vault') {
            return $default;
        }

        foreach ($segments as $segment) {
            if (!is_array($current) || !array_key_exists($segment, $current)) {
                if (($segments[0] ?? '') === 'services' && isset($segments[1], $segments[2]) && count($segments) === 3) {
                    return x_secret_get('services.' . $segments[1] . '.credentials.' . $segments[2], $default);
                }

                return $default;
            }

            $current = $current[$segment];
        }

        return $current;
    }
}

if (!function_exists('x_secret_service_report')) {
    /**
     * Builds a value-free report of configured secret dependencies for QA/manager review.
     */
    function x_secret_service_report(?array $secrets = null): array
    {
        $secrets = $secrets ?? x_secrets_load();
        $services = [];

        foreach (($secrets['services'] ?? []) as $serviceName => $serviceConfig) {
            if (!is_array($serviceConfig)) {
                continue;
            }

            $credentialKeys = [];
            if (is_array($serviceConfig['credentials'] ?? null)) {
                $credentialKeys = array_keys($serviceConfig['credentials']);
            }

            $requiredSecrets = [];
            if (is_array($serviceConfig['required_secrets'] ?? null)) {
                foreach ($serviceConfig['required_secrets'] as $alias => $secretPath) {
                    $requiredSecrets[(string) $alias] = (string) $secretPath;
                }
            } elseif (is_array($serviceConfig['required'] ?? null)) {
                foreach ($serviceConfig['required'] as $secretPath) {
                    $requiredSecrets[(string) $secretPath] = (string) $secretPath;
                }
            }

            $envMappings = [];
            if (is_array($serviceConfig['env'] ?? null)) {
                foreach ($serviceConfig['env'] as $secretPath => $envName) {
                    $envMappings[(string) $secretPath] = (string) $envName;
                }
            }

            $services[(string) $serviceName] = [
                'purpose' => (string) ($serviceConfig['purpose'] ?? ''),
                'provider' => x_secret_provider_name($secrets, (string) $serviceName),
                'base_url_configured' => isset($serviceConfig['base_url']) && $serviceConfig['base_url'] !== '',
                'credential_keys' => $credentialKeys,
                'required_secrets' => $requiredSecrets,
                'env_mappings' => $envMappings,
            ];
        }

        return [
            'provider' => [
                'default' => x_secret_provider_name($secrets),
                'environment' => (string) ($secrets['provider']['environment'] ?? 'dev'),
            ],
            'services' => $services,
        ];
    }
}

if (!function_exists('css_minify')) {
    /**
     * Lightweight, non-invasive CSS minifier.
     */
    function css_minify(string $code): string
    {
        $output = str_replace(["\r\n", "\r"], "\n", $code);

        // Remove regular block comments, keep /*! ... */ comments.
        $output = preg_replace('~/\*(?!\!)[\s\S]*?\*/~', '', $output) ?? $output;

        // Collapse whitespace sequences.
        $output = preg_replace('/\s+/', ' ', $output) ?? $output;

        // Trim around common CSS tokens.
        $output = preg_replace('/\s*([{}:;,>])\s*/', '$1', $output) ?? $output;
        $output = preg_replace('/;}/', '}', $output) ?? $output;

        return trim($output);
    }
}

if (!function_exists('js_minify')) {
    /**
     * Lightweight, non-invasive JS minifier.
     * Only removes obvious comments/blank lines and trims line spaces.
     */
    function js_minify(string $code): string
    {
        $output = str_replace(["\r\n", "\r"], "\n", $code);

        // Remove regular block comments, keep /*! ... */ comments.
        $output = preg_replace('~/\*(?!\!)[\s\S]*?\*/~', '', $output) ?? $output;

        $lines = explode("\n", $output);
        $result = [];

        foreach ($lines as $line) {
            $trimmed = trim($line);

            if ($trimmed === '') {
                continue;
            }

            // Remove full-line single-line comments.
            if (str_starts_with($trimmed, '//')) {
                continue;
            }

            $result[] = $trimmed;
        }

        return implode("\n", $result);
    }
}

if (!function_exists('x_api_payload')) {
    /**
     * Standard API payload format (X5-compatible contract).
     */
    function x_api_payload(bool $success = false, int $status = 200, $response = null, array $errors = []): array
    {
        return [
            'success' => $success,
            'status' => $status,
            'response' => $response,
            'errors' => $errors,
        ];
    }
}

if (!function_exists('x_api_output')) {
    /**
     * Sends a standardized JSON API response with HTTP 200.
     */
    function x_api_output(bool $success = false, int $status = 200, $response = null, array $errors = []): void
    {
        http_response_code(200);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(
            x_api_payload($success, $status, $response, $errors),
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
        exit;
    }
}

if (!function_exists('x_api_validate_payload_shape')) {
    /**
     * Validates standard API payload shape for contract tests.
     */
    function x_api_validate_payload_shape(array $payload): array
    {
        $errors = [];
        foreach (['success', 'status', 'response', 'errors'] as $key) {
            if (!array_key_exists($key, $payload)) {
                $errors[$key] = 'missing key';
            }
        }

        if (array_key_exists('success', $payload) && !is_bool($payload['success'])) {
            $errors['success'] = 'must be bool';
        }
        if (array_key_exists('status', $payload) && !is_int($payload['status'])) {
            $errors['status'] = 'must be int';
        }
        if (array_key_exists('errors', $payload) && !is_array($payload['errors'])) {
            $errors['errors'] = 'must be array';
        }

        return $errors;
    }
}
