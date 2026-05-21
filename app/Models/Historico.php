<?php

declare(strict_types=1);

namespace LembreMed\Models;

final class Historico extends BaseModel
{
    public function all(string $usuarioId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, med_id AS medId, med_name AS medName, paciente, scheduled_time AS scheduledTime, status, horario_confirmacao AS horarioConfirmacao, data_confirmacao AS dataConfirmacao, timestamp, usuario_id FROM historico WHERE usuario_id = :usuario_id ORDER BY timestamp DESC'
        );
        $stmt->execute(['usuario_id' => $usuarioId]);
        return $stmt->fetchAll();
    }

    public function create(array $data, string $usuarioId): array
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO historico (med_id, med_name, paciente, scheduled_time, status, horario_confirmacao, data_confirmacao, timestamp, usuario_id) VALUES (:med_id, :med_name, :paciente, :scheduled_time, :status, :horario_confirmacao, :data_confirmacao, :timestamp, :usuario_id)'
        );
        $stmt->execute($this->params($data, $usuarioId));

        return $this->find((int) $this->pdo->lastInsertId(), $usuarioId);
    }

    public function update(int $id, array $data, string $usuarioId): array
    {
        $stmt = $this->pdo->prepare(
            'UPDATE historico SET med_id = :med_id, med_name = :med_name, paciente = :paciente, scheduled_time = :scheduled_time, status = :status, horario_confirmacao = :horario_confirmacao, data_confirmacao = :data_confirmacao, timestamp = :timestamp WHERE id = :id AND usuario_id = :usuario_id'
        );
        $params = $this->params($data, $usuarioId);
        $params['id'] = $id;
        $stmt->execute($params);

        return $this->find($id, $usuarioId);
    }

    public function delete(int $id, string $usuarioId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM historico WHERE id = :id AND usuario_id = :usuario_id');
        return $stmt->execute(['id' => $id, 'usuario_id' => $usuarioId]);
    }

    private function params(array $data, string $usuarioId): array
    {
        return [
            'med_id' => (int) ($data['medId'] ?? $data['med_id'] ?? 0),
            'med_name' => trim((string) ($data['medName'] ?? $data['med_name'] ?? '')),
            'paciente' => trim((string) ($data['paciente'] ?? 'Paciente')),
            'scheduled_time' => trim((string) ($data['scheduledTime'] ?? $data['scheduled_time'] ?? '')),
            'status' => trim((string) ($data['status'] ?? 'Tomado')),
            'horario_confirmacao' => trim((string) ($data['horarioConfirmacao'] ?? date('H:i:s'))),
            'data_confirmacao' => trim((string) ($data['dataConfirmacao'] ?? date('Y-m-d'))),
            'timestamp' => (int) ($data['timestamp'] ?? time()),
            'usuario_id' => $usuarioId,
        ];
    }

    private function find(int $id, string $usuarioId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id, med_id AS medId, med_name AS medName, paciente, scheduled_time AS scheduledTime, status, horario_confirmacao AS horarioConfirmacao, data_confirmacao AS dataConfirmacao, timestamp, usuario_id FROM historico WHERE id = :id AND usuario_id = :usuario_id'
        );
        $stmt->execute(['id' => $id, 'usuario_id' => $usuarioId]);
        return $stmt->fetch() ?: [];
    }
}
