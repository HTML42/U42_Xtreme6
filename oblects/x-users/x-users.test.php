<?php

declare(strict_types=1);

require_once __DIR__ . '/x-users.class.php';

XUser::clear_cache();
XUsers::clear_cache();

$list_a = XUsers::list(['sort' => 'name_asc']);
$list_b = XUsers::list(['sort' => 'name_asc']);

assert(count($list_a) === 2);
assert($list_a[0] === $list_b[0]);
assert($list_a[0]->name === 'Ada Lovelace');

echo "x-users.test.php passed\n";
