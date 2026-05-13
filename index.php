<?php
/**
 * LembreMED - Front Controller
 */

require_once 'config.php';
require_once 'autoload.php';

// Inicia o roteamento
$router = new Router();
$router->route();
