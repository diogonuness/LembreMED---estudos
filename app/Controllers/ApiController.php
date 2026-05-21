<?php

declare(strict_types=1);

namespace LembreMed\Controllers;

use LembreMed\Core\Database;
use LembreMed\Core\HttpResponse;
use LembreMed\Models\Historico;
use LembreMed\Models\Medicamento;
use LembreMed\Models\Paciente;
use LembreMed\Services\RegistroService;

final class ApiController
{
    private RegistroService $service;

    public function __construct(array $config)
    {
        $pdo = Database::connection($config);
        $this->service = new RegistroService([
            'pacientes' => new Paciente($pdo),
            'medicamentos' => new Medicamento($pdo),
            'historico' => new Historico($pdo),
        ]);
    }

    public function handle(string $method, string $path): void
    {
        $parts = array_values(array_filter(explode('/', trim($path, '/'))));
        $resource = $parts[1] ?? '';
        $id = isset($parts[2]) ? (int) $parts[2] : null;
        $usuarioId = $_SERVER['HTTP_X_LEMBREMED_USER'] ?? 'anonimo';
        $payload = $this->input();

        try {
            match ($method) {
                'GET' => HttpResponse::json(['data' => $this->service->listar($resource, $usuarioId)]),
                'POST' => HttpResponse::json(['data' => $this->service->criar($resource, $payload, $usuarioId)], 201),
                'PUT', 'PATCH' => HttpResponse::json(['data' => $this->service->atualizar($resource, $id, $payload, $usuarioId)]),
                'DELETE' => HttpResponse::json(['data' => $this->service->excluir($resource, $id, $usuarioId)]),
                default => HttpResponse::json(['error' => 'Método HTTP não permitido.'], 405),
            };
        } catch (\InvalidArgumentException $exception) {
            HttpResponse::json(['error' => $exception->getMessage()], 422);
        } catch (\Throwable $exception) {
            HttpResponse::json(['error' => 'Erro interno ao processar a requisição.'], 500);
        }
    }

    private function input(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === false || trim($raw) === '') {
            return $_POST;
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $decoded : [];
    }
}
