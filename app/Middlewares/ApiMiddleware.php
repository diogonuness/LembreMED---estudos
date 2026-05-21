<?php

declare(strict_types=1);

namespace LembreMed\Middlewares;

final class ApiMiddleware
{
    public function handle(string $method): void
    {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Headers: Content-Type, X-LembreMED-User');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');

        if ($method === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }
}
