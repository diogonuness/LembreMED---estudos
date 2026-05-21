# Arquitetura de Pastas e Responsabilidades

## Estrutura principal

- `index.php`: Front Controller. Recebe todas as requisições, carrega `config.php`, registra o autoload e entrega o fluxo ao router.
- `autoload.php`: autoload PSR-4 do namespace `LembreMed\` para a pasta `app/`.
- `config.php`: caminhos globais e configuração do SQLite.
- `app/Core`: infraestrutura compartilhada, como `Router`, `Database` e resposta HTTP.
- `app/Controllers`: entrada da lógica de aplicação. `PageController` serve a interface e `ApiController` expõe os dados para o front.
- `app/Models`: acesso isolado ao SQLite. SQL fica aqui, não na view.
- `app/Services`: regras de validação e orquestração entre controller e model.
- `app/Middlewares`: tratamento comum antes do controller, como CORS e `OPTIONS`.
- `app/database`: arquivo `.sqlite` e migrations.
- `view`: HTML, CSS e JS da interface.

## Fluxo da requisição

1. O navegador solicita `/pages/medicamentos.html` ou `/api/medicamentos`.
2. `index.php` instancia `LembreMed\Core\Router`.
3. O router decide o caminho:
   - páginas e assets vão para `PageController`;
   - rotas `/api/...` passam pelo middleware e chegam ao `ApiController`.
4. `ApiController` chama `RegistroService`.
5. `RegistroService` valida a operação e seleciona o model correto.
6. O model executa SQL no SQLite via PDO.
7. A API retorna JSON para `view/js/db.js`.
8. `DataService.js` e `controller.js` atualizam a tela.

## Separação importante

O front-end conhece apenas funções como `buscarItens`, `adicionarItem`, `atualizarItem` e `deletarItem`. Ele não conhece tabelas SQL, queries ou PDO. A persistência fica isolada em `app/Models` e `app/database`.
