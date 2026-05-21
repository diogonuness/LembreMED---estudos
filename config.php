<?php

declare(strict_types=1);

define('BASE_PATH', __DIR__);
define('APP_PATH', BASE_PATH . '/app');
define('VIEW_PATH', BASE_PATH . '/view');
define('DATABASE_PATH', APP_PATH . '/database');
define('DB_PATH', DATABASE_PATH . '/lembremed.sqlite');
define('DB_DSN', 'sqlite:' . DB_PATH);

$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
define('BASE_URL', $protocol . '://' . $host);

return [
    'app' => [
        'name' => 'LembreMED',
        'base_path' => BASE_PATH,
        'view_path' => VIEW_PATH,
    ],
    'database' => [
        'dsn' => DB_DSN,
        'path' => DB_PATH,
    ],
];
