<?php

declare(strict_types=1);

namespace LembreMed\Services;

use LembreMed\Models\BaseModel;

final class RegistroService
{
    /** @param array<string, BaseModel> $models */
    public function __construct(private readonly array $models)
    {
    }

    public function listar(string $resource, string $usuarioId): array
    {
        return $this->model($resource)->all($usuarioId);
    }

    public function criar(string $resource, array $data, string $usuarioId): array
    {
        $this->validar($resource, $data);
        return $this->model($resource)->create($data, $usuarioId);
    }

    public function atualizar(string $resource, ?int $id, array $data, string $usuarioId): array
    {
        if (!$id) {
            throw new \InvalidArgumentException('ID obrigatório para atualização.');
        }

        $this->validar($resource, $data);
        return $this->model($resource)->update($id, $data, $usuarioId);
    }

    public function excluir(string $resource, ?int $id, string $usuarioId): array
    {
        if (!$id) {
            throw new \InvalidArgumentException('ID obrigatório para exclusão.');
        }

        return ['deleted' => $this->model($resource)->delete($id, $usuarioId)];
    }

    private function model(string $resource): BaseModel
    {
        if (!isset($this->models[$resource])) {
            throw new \InvalidArgumentException('Recurso inválido para a API.');
        }

        return $this->models[$resource];
    }

    private function validar(string $resource, array $data): void
    {
        if ($resource === 'pacientes' && empty($data['nome'])) {
            throw new \InvalidArgumentException('Nome do paciente é obrigatório.');
        }

        if ($resource === 'medicamentos' && (empty($data['nome']) || empty($data['dose']) || empty($data['horario']))) {
            throw new \InvalidArgumentException('Nome, dose e horário do medicamento são obrigatórios.');
        }
    }
}
