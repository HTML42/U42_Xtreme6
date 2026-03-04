<?php

class XCompiler
{
    public static function validate_php_tags(string $code, string $path): void
    {
        $trimmed = trim($code);

        if (!str_starts_with($trimmed, '<?php')) {
            throw new RuntimeException("PHP-Datei muss mit <?php starten: {$path}");
        }

        if (!str_ends_with($trimmed, '?>')) {
            throw new RuntimeException("PHP-Datei muss mit ?> enden: {$path}");
        }
    }

    public static function validate_no_includes(string $code, string $path): void
    {
        if (preg_match('/\b(include|include_once|require|require_once)\b/i', $code) === 1) {
            throw new RuntimeException("Include/Require in Klassen-Datei nicht erlaubt: {$path}");
        }
    }
}
?>
