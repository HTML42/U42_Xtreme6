<?php

if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'GET') {
    x_api_output(false, 405, null, ['method' => 'method not allowed']);
}

$users = XUsers::load();
x_api_output(true, 200, $users, []);
