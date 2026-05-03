<?php

require_once __DIR__ . '/../x/x_functions.php';
require_once __DIR__ . '/../x/x_pluralize.class.php';
require_once __DIR__ . '/../x/x_db_json.class.php';
require_once __DIR__ . '/../x/x_db_mysql.class.php';
require_once __DIR__ . '/../x/x_db.class.php';

$root = dirname(__DIR__);
$objectsRuntime = $root . DIRECTORY_SEPARATOR . 'dist' . DIRECTORY_SEPARATOR . 'objects--prod.php';
$configPath = $root . DIRECTORY_SEPARATOR . 'config.json';
$dbConfigPath = $root . DIRECTORY_SEPARATOR . '_db.json';

if (!is_file($objectsRuntime)) {
    fwrite(STDERR, "[smoke_database] failed: dist/objects--prod.php is missing. Run php compiler/compile_objects.php first.\n");
    exit(1);
}

require_once $objectsRuntime;

$config = is_file($configPath) ? (json_decode((string) file_get_contents($configPath), true) ?: []) : [];
$engine = strtolower((string) ($config['Database'] ?? 'json'));

echo "[smoke_database] engine={$engine}\n";

if ($engine === 'mysql' && !is_file($dbConfigPath)) {
    echo "[smoke_database] skipped: MYSQL configured but _db.json is missing. Copy _db.example.json to _db.json for live MySQL smoke tests.\n";
    exit(0);
}

try {
    XDB::reset();
    $db = XDB::instance();
    $actualEngine = $db->engine();

    $suffix = substr(sha1((string) microtime(true)), 0, 8);
    $username = 'smoke_' . $suffix;
    $email = $username . '@example.test';
    $password = 'SmokePass123!';

    $registration = XUser::register([
        'username' => $username,
        'email' => $email,
        'password' => $password,
        'password2' => $password,
    ]);

    assertSmoke($registration['success'] === true, 'registration succeeds');
    $userId = (int) ($registration['response']['id'] ?? 0);
    assertSmoke($userId > 0, 'registration returns user id');

    $login = XUser::login($username, $password);
    assertSmoke($login['success'] === true, 'login succeeds');
    assertSmoke((int) ($login['response']['id'] ?? 0) === $userId, 'login returns same user id');

    $rowsBeforeDelete = $db->select('users', ['id' => $userId]);
    assertSmoke(count($rowsBeforeDelete) === 1, 'select finds inserted user');

    $deleted = $db->delete('users', ['id' => $userId]);
    assertSmoke($deleted === 1, 'delete removes smoke user');

    $rowsAfterDelete = $db->select('users', ['id' => $userId]);
    assertSmoke($rowsAfterDelete === [], 'select confirms smoke user deletion');

    echo "[smoke_database] passed ({$actualEngine})\n";
} catch (Throwable $error) {
    fwrite(STDERR, '[smoke_database] failed: ' . $error->getMessage() . "\n");
    exit(1);
}

function assertSmoke(bool $condition, string $message): void
{
    if (!$condition) {
        throw new RuntimeException($message);
    }

    echo "  ✓ {$message}\n";
}

?>
