<?php


header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'status' => 'ok',
    'message' => 'API endpoint ready',
], JSON_THROW_ON_ERROR);
