<?php

declare(strict_types=1);

namespace LembreMed\Models;

use PDO;

abstract class BaseModel
{
    public function __construct(protected readonly PDO $pdo)
    {
    }

    abstract public function all(string $usuarioId): array;

    abstract public function create(array $data, string $usuarioId): array;

    abstract public function update(int $id, array $data, string $usuarioId): array;

    abstract public function delete(int $id, string $usuarioId): bool;
}
