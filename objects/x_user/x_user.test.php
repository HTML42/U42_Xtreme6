<?php

// Basic runtime assertions for XUser.

XUser::clear_cache();
$user = XUser::load_by_id(1);

if (!property_exists($user, 'id')) {
    echo "FAIL: x_user.test.php - XUser object has no id property\n";
    return;
}

if ($user->id !== 1) {
    echo "FAIL: x_user.test.php - Expected id 1, got {$user->id}\n";
    return;
}

echo "PASS: x_user.test.php - XUser id is 1\n";
?>
