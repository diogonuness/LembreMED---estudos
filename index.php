<?php

declare(strict_types=1);

use LembreMed\Core\Router;

$config = require_once __DIR__ . '/config.php';
require_once __DIR__ . '/autoload.php';

$router = new Router($config);
$router->dispatch();
