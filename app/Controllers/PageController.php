<?php

declare(strict_types=1);

namespace LembreMed\Controllers;

final class PageController
{
    public function handle(string $path): void
    {
        $normalizedPath = $path === '/' || $path === '/index.php' ? '/index.html' : $path;
        $file = realpath(VIEW_PATH . $normalizedPath);
        $viewRoot = realpath(VIEW_PATH);

        if ($file === false || $viewRoot === false || !str_starts_with($file, $viewRoot) || !is_file($file)) {
            http_response_code(404);
            require VIEW_PATH . '/index.html';
            return;
        }

        $this->sendHeaders($file);
        readfile($file);
    }

    private function sendHeaders(string $file): void
    {
        $extension = pathinfo($file, PATHINFO_EXTENSION);
        $types = [
            'css' => 'text/css; charset=utf-8',
            'html' => 'text/html; charset=utf-8',
            'js' => 'application/javascript; charset=utf-8',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'svg' => 'image/svg+xml',
        ];

        if (isset($types[$extension])) {
            header('Content-Type: ' . $types[$extension]);
        }
    }
}
