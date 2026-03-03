<?php

declare(strict_types=1);

/**
 * framework-basisklasse (x-kontext): user.
 *
 * hinweis: x*-dateien sind framework-bezogen und werden ggf. bei updates überschrieben.
 */
class User
{
    public function __construct(
        public int $id,
        public string $name,
        public string $email,
    ) {
    }
}
