<?php

declare(strict_types=1);

require_once __DIR__ . '/user.class.php';

$u = new User(1, 'Ada', 'ada@example.com');
assert($u->id === 1);
assert($u->name === 'Ada');
assert($u->email === 'ada@example.com');

echo "user.test.php passed\n";
