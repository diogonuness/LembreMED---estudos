<?php

declare(strict_types=1);

namespace LembreMed\Models;

final class Medicamento extends BaseModel
{
    public function all(string $usuarioId): array
    {
        $stmt = $this->pdo->prepare('SELECT id, paciente, nome, dose, horario, frequencia, taken, usuario_id FROM medicamentos WHERE usuario_id = :usuario_id ORDER BY horario, nome');
        $stmt->execute(['usuario_id' => $usuarioId]);
        return $stmt->fetchAll();
    }

    public function create(array $data, string $usuarioId): array
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO medicamentos (paciente, nome, dose, horario, frequencia, taken, usuario_id) VALUES (:paciente, :nome, :dose, :horario, :frequencia, :taken, :usuario_id)'
        );
        $stmt->execute($this->params($data, $usuarioId));

        return $this->find((int) $this->pdo->lastInsertId(), $usuarioId);
    }

    public function update(int $id, array $data, string $usuarioId): array
    {
        $stmt = $this->pdo->prepare(
            'UPDATE medicamentos SET paciente = :paciente, nome = :nome, dose = :dose, horario = :horario, frequencia = :frequencia, taken = :taken WHERE id = :id AND usuario_id = :usuario_id'
        );
        $params = $this->params($data, $usuarioId);
        $params['id'] = $id;
        $stmt->execute($params);

        return $this->find($id, $usuarioId);
    }

    public function delete(int $id, string $usuarioId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM medicamentos WHERE id = :id AND usuario_id = :usuario_id');
        return $stmt->execute(['id' => $id, 'usuario_id' => $usuarioId]);
    }

    private function params(array $data, string $usuarioId): array
    {
        return [
            'paciente' => trim((string) ($data['paciente'] ?? 'Eu')),
            'nome' => trim((string) ($data['nome'] ?? '')),
            'dose' => trim((string) ($data['dose'] ?? '')),
            'horario' => trim((string) ($data['horario'] ?? '')),
            'frequencia' => trim((string) ($data['frequencia'] ?? '')),
            'taken' => !empty($data['taken']) ? 1 : 0,
            'usuario_id' => $usuarioId,
        ];
    }

    private function find(int $id, string $usuarioId): array
    {
        $stmt = $this->pdo->prepare('SELECT id, paciente, nome, dose, horario, frequencia, taken, usuario_id FROM medicamentos WHERE id = :id AND usuario_id = :usuario_id');
        $stmt->execute(['id' => $id, 'usuario_id' => $usuarioId]);
        return $stmt->fetch() ?: [];
    }
}
