<?php

class XPluralize
{
    protected static array $irregular_singular_to_plural = [
        'person' => 'people',
        'man' => 'men',
        'woman' => 'women',
        'child' => 'children',
        'mouse' => 'mice',
        'goose' => 'geese',
        'user' => 'users',
    ];

    protected static array $irregular_plural_to_singular = [
        'people' => 'person',
        'men' => 'man',
        'women' => 'woman',
        'children' => 'child',
        'mice' => 'mouse',
        'geese' => 'goose',
        'users' => 'user',
    ];

    public static function pluralize(string $name): string
    {
        [$prefix, $word] = self::split_prefix($name);
        $plural = self::pluralize_word($word);
        return $prefix . $plural;
    }

    public static function singularize(string $name): string
    {
        [$prefix, $word] = self::split_prefix($name);
        $singular = self::singularize_word($word);
        return $prefix . $singular;
    }

    public static function pair(string $singular_name): array
    {
        $singular = self::singularize($singular_name);
        $plural = self::pluralize($singular);

        return [
            'singular' => $singular,
            'plural' => $plural,
        ];
    }

    protected static function split_prefix(string $name): array
    {
        $normalized = trim(strtolower($name));

        if (str_starts_with($normalized, 'x_')) {
            return ['x_', substr($normalized, 2)];
        }

        return ['', $normalized];
    }

    protected static function pluralize_word(string $word): string
    {
        if ($word === '') {
            return '';
        }

        if (isset(self::$irregular_singular_to_plural[$word])) {
            return self::$irregular_singular_to_plural[$word];
        }

        if (preg_match('/[^aeiou]y$/', $word) === 1) {
            return substr($word, 0, -1) . 'ies';
        }

        if (preg_match('/(s|x|z|ch|sh)$/', $word) === 1) {
            return $word . 'es';
        }

        return $word . 's';
    }

    protected static function singularize_word(string $word): string
    {
        if ($word === '') {
            return '';
        }

        if (isset(self::$irregular_plural_to_singular[$word])) {
            return self::$irregular_plural_to_singular[$word];
        }

        if (preg_match('/[^aeiou]ies$/', $word) === 1) {
            return substr($word, 0, -3) . 'y';
        }

        if (preg_match('/(ses|xes|zes|ches|shes)$/', $word) === 1) {
            return substr($word, 0, -2);
        }

        if (str_ends_with($word, 's') && !str_ends_with($word, 'ss')) {
            return substr($word, 0, -1);
        }

        return $word;
    }
}
?>