<?php

declare(strict_types=1);

namespace LembreMed\Core;

final class HttpResponse
{
    public static function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    }

    public static function notFound(string $message = 'Recurso não encontrado.'): void
    {
        self::json(['error' => $message], 404);
    }
}
