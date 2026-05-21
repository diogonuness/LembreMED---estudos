<?php

declare(strict_types=1);

namespace LembreMed\Models;

final class Paciente extends BaseModel
{
    public function all(string $usuarioId): array
    {
        $stmt = $this->pdo->prepare('SELECT id, nome, idade, condicao, contato, usuario_id FROM pacientes WHERE usuario_id = :usuario_id ORDER BY nome');
        $stmt->execute(['usuario_id' => $usuarioId]);
        return $stmt->fetchAll();
    }

    public function create(array $data, string $usuarioId): array
    {
        $stmt = $this->pdo->prepare('INSERT INTO pacientes (nome, idade, condicao, contato, usuario_id) VALUES (:nome, :idade, :condicao, :contato, :usuario_id)');
        $stmt->execute([
            'nome' => trim((string) ($data['nome'] ?? '')),
            'idade' => (int) ($data['idade'] ?? 0),
            'condicao' => trim((string) ($data['condicao'] ?? '')),
            'contato' => trim((string) ($data['contato'] ?? '')),
            'usuario_id' => $usuarioId,
        ]);

        return $this->find((int) $this->pdo->lastInsertId(), $usuarioId);
    }

    public function update(int $id, array $data, string $usuarioId): array
    {
        $stmt = $this->pdo->prepare('UPDATE pacientes SET nome = :nome, idade = :idade, condicao = :condicao, contato = :contato WHERE id = :id AND usuario_id = :usuario_id');
        $stmt->execute([
            'id' => $id,
            'nome' => trim((string) ($data['nome'] ?? '')),
            'idade' => (int) ($data['idade'] ?? 0),
            'condicao' => trim((string) ($data['condicao'] ?? '')),
            'contato' => trim((string) ($data['contato'] ?? '')),
            'usuario_id' => $usuarioId,
        ]);

        return $this->find($id, $usuarioId);
    }

    public function delete(int $id, string $usuarioId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM pacientes WHERE id = :id AND usuario_id = :usuario_id');
        return $stmt->execute(['id' => $id, 'usuario_id' => $usuarioId]);
    }

    private function find(int $id, string $usuarioId): array
    {
        $stmt = $this->pdo->prepare('SELECT id, nome, idade, condicao, contato, usuario_id FROM pacientes WHERE id = :id AND usuario_id = :usuario_id');
        $stmt->execute(['id' => $id, 'usuario_id' => $usuarioId]);
        return $stmt->fetch() ?: [];
    }
}
