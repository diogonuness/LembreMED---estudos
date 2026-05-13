<?php
/**
 * LembreMED - Router
 */

class Router {
    public function route() {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        
        // Remove a pasta do projeto da URI se estiver rodando em subdiretório
        // Para simplificar, vamos assumir que a raiz serve o index.html
        if ($uri === '/' || $uri === '/index.php') {
            require_once VIEW_PATH . '/index.html';
            return;
        }

        // Roteamento de páginas estáticas da view
        $viewFile = VIEW_PATH . $uri;
        if (file_exists($viewFile) && is_file($viewFile)) {
            // Se for HTML, apenas inclui
            if (pathinfo($viewFile, PATHINFO_EXTENSION) === 'html') {
                require_once $viewFile;
            } else {
                // Para outros arquivos (CSS, JS), o ideal é que o servidor web sirva,
                // mas se cair aqui, podemos tentar servir com o header correto.
                $this->serveStatic($viewFile);
            }
            return;
        }

        // 404
        http_response_code(404);
        echo "<h1>404 - Página não encontrada</h1>";
        echo "URI: " . $uri;
    }

    private function serveStatic($file) {
        $ext = pathinfo($file, PATHINFO_EXTENSION);
        $mimes = [
            'css' => 'text/css',
            'js' => 'application/javascript',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'svg' => 'image/svg+xml'
        ];
        
        if (isset($mimes[$ext])) {
            header('Content-Type: ' . $mimes[$ext]);
        }
        readfile($file);
    }
}
