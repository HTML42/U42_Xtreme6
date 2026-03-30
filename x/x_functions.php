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
