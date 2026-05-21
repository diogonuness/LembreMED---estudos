<?php

declare(strict_types=1);

namespace LembreMed\Core;

use PDO;

final class Database
{
    private static ?PDO $connection = null;

    public static function connection(array $config): PDO
    {
        if (self::$connection instanceof PDO) {
            return self::$connection;
        }

        $databasePath = $config['database']['path'];
        $databaseDir = dirname($databasePath);

        if (!is_dir($databaseDir)) {
            mkdir($databaseDir, 0775, true);
        }

        self::$connection = new PDO($config['database']['dsn']);
        self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        self::$connection->exec('PRAGMA foreign_keys = ON');

        self::migrate(self::$connection);

        return self::$connection;
    }

    private static function migrate(PDO $pdo): void
    {
        $schema = file_get_contents(DATABASE_PATH . '/migrations/001_create_lembremed.sql');
        if ($schema === false) {
            throw new \RuntimeException('Arquivo de migration do SQLite não encontrado.');
        }

        $pdo->exec($schema);
    }
}
