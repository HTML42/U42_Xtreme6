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
