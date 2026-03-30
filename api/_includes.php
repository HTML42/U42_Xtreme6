<?php

$root = dirname(__DIR__);

$xFiles = [
    $root . '/x/x_functions.php',
    $root . '/x/x_pluralize.class.php',
    $root . '/x/x_db_json.class.php',
    $root . '/x/x_db_mysql.class.php',
    $root . '/x/x_db.class.php',
    $root . '/x/x_compiler.class.php',
];

foreach ($xFiles as $file) {
    if (is_file($file)) {
        require_once $file;
    }
}

$objectsProd = $root . '/dist/objects--prod.php';
if (is_file($objectsProd)) {
    require_once $objectsProd;
}
