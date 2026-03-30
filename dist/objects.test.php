<?php

/* SOURCE: objects\x_user\x_user.test.php */
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


/* SOURCE: objects\x_users\x_users.test.php */
// Basic runtime assertions for XUsers.

XUsers::clear_cache();
$users = XUsers::load(1);

if (!is_array($users)) {
    echo "FAIL: x_users.test.php - XUsers::load did not return an array\n";
    return;
}

if (count($users) !== 1) {
    echo "FAIL: x_users.test.php - Expected one user entry, got " . count($users) . "\n";
    return;
}

if (!isset($users[0]) || !property_exists($users[0], 'id') || $users[0]->id !== 1) {
    echo "FAIL: x_users.test.php - First entry is not a XUser with id 1\n";
    return;
}

echo "PASS: x_users.test.php - XUsers list contains XUser id 1\n";
?>
