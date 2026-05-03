<?php

if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
    x_api_output(false, 405, null, ['method' => 'method not allowed']);
}

$input = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$username = (string) ($input['username'] ?? '');
$password = (string) ($input['password'] ?? '');

$result = XUser::login($username, $password);
x_api_output($result['success'], $result['status'], $result['response'], $result['errors']);
