<?php
/**
 * LembreMED - Autoload de Classes
 */

spl_autoload_register(function ($class) {
    // Mapeamento simples: Nome da classe deve ser igual ao nome do arquivo
    // Procuramos em todas as subpastas de app/
    $directories = [
        APP_PATH . '/controller/',
        APP_PATH . '/model/',
        APP_PATH . '/middleware/',
        APP_PATH . '/services/',
        APP_PATH . '/router/',
    ];

    foreach ($directories as $directory) {
        $file = $directory . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});
