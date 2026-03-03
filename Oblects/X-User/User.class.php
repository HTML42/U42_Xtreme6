<?php

declare(strict_types=1);

/**
 * Framework-Basisklasse (X-Kontext): User.
 *
 * Hinweis: X*-Dateien sind framework-bezogen und werden ggf. bei Updates überschrieben.
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
