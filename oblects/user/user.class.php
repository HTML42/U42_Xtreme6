<?php

declare(strict_types=1);

class User
{
    public function __construct(
        public int $id,
        public string $name,
        public string $email,
    ) {
        if (trim($this->name) === '' || trim($this->email) === '') {
            throw new InvalidArgumentException('name und email dürfen nicht leer sein');
        }
    }
}
