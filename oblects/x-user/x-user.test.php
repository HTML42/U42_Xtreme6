<?php

declare(strict_types=1);

require_once __DIR__ . '/x-user.class.php';

XUser::clear_cache();

$user_a = XUser::load(1);
$user_b = XUser::load_by_id(1);
assert($user_a === $user_b);

$user_c = XUser::load('Ada Lovelace');
assert($user_c->id === 1);

$user_c->update(name: 'Ada L.', active: false);
assert($user_c->name === 'Ada L.');
assert($user_c->active === false);

echo "x-user.test.php passed\n";
