/**
 * MedicineService.js - Camada de Regras de Negócio do LembreMED.
 */

class MedicineService {
    constructor(db) {
        this.db = db; // Injeção de Dependência
    }

    async cadastrarMedicamento(dados) {
        // Validação de Regras de Negócio
        if (!dados.nome || dados.nome.trim() === "") {
            throw new Error("O nome do medicamento é obrigatório.");
        }

        if (!dados.dose || dados.dose.trim() === "") {
            throw new Error("A dose deve ser informada.");
        }

        if (!dados.horario) {
            throw new Error("O horário de administração é obrigatório.");
        }

        // Formatação/Transformação
        const novoMedicamento = {
            ...dados,
            nome: dados.nome.toUpperCase(), // Exemplo de regra de negócio: nomes em caixa alta
            taken: false,
            dataCadastro: new Date().toISOString()
        };

        // Persistência via Repository/DB
        return await this.db.adicionarItem('medicamentos', novoMedicamento);
    }

    async listarTodos() {
        return await this.db.buscarItens('medicamentos');
    }

    async excluir(id) {
        return await this.db.deletarItem('medicamentos', id);
    }
}
