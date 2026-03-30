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
