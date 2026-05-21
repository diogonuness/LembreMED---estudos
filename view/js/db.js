/**
 * Camada de infraestrutura do front-end.
 * O navegador não acessa SQL: ele conversa com a API PHP, que persiste em SQLite.
 */

const dbName = "LembreMedSQLiteAPI";
const apiBaseUrl = "/api";

async function iniciarBanco() {
    return true;
}

function usuarioAtual() {
    const user = JSON.parse(localStorage.getItem("lembremed_user") || "null");
    return user?.email || "anonimo";
}

async function apiRequest(tabela, options = {}) {
    const response = await fetch(`${apiBaseUrl}/${tabela}${options.id ? `/${options.id}` : ""}`, {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            "X-LembreMED-User": usuarioAtual()
        },
        body: options.body ? JSON.stringify(options.body) : undefined
    });

    const payload = await response.json();
    if (!response.ok) {
        throw new Error(payload.error || "Erro ao acessar a API.");
    }

    return payload.data;
}

async function adicionarItem(tabela, item) {
    const created = await apiRequest(tabela, { method: "POST", body: item });
    return created.id;
}

async function buscarItens(tabela) {
    return await apiRequest(tabela);
}

async function deletarItem(tabela, id) {
    const result = await apiRequest(tabela, { method: "DELETE", id });
    return !!result.deleted;
}

async function atualizarItem(tabela, item) {
    const { id, ...body } = item;
    await apiRequest(tabela, { method: "PUT", id, body });
    return true;
}
