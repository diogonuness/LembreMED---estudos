<?php

declare(strict_types=1);

namespace LembreMed\Core;

use LembreMed\Controllers\ApiController;
use LembreMed\Controllers\PageController;
use LembreMed\Middlewares\ApiMiddleware;

final class Router
{
    public function __construct(private readonly array $config)
    {
    }

    public function dispatch(): void
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';

        if (str_starts_with($path, '/api/')) {
            (new ApiMiddleware())->handle($method);
            (new ApiController($this->config))->handle($method, $path);
            return;
        }

        (new PageController())->handle($path);
    }
}
