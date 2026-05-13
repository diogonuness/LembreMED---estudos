<?php
/**
 * LembreMED - Configurações Gerais
 */

define('BASE_PATH', __DIR__);
define('APP_PATH', BASE_PATH . '/app');
define('VIEW_PATH', BASE_PATH . '/view');

// Configurações do Banco de Dados (SQLite)
define('DB_PATH', APP_PATH . '/database/database.sqlite');
define('DB_DSN', 'sqlite:' . DB_PATH);

// URL Base (Ajustar se necessário para seu ambiente local)
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
define('BASE_URL', $protocol . '://' . $host . '/');
