/**
 * controller.js - Refatorado com Camada de Serviço e Injeção de Dependência.
 */

class MedicineController {
    constructor(service) {
        this.service = service;
        this.init();
    }

    async init() {
        console.log("Controlador LembreMED iniciado.");
        try {
            await iniciarBanco();
            this.atualizarLista();
            this.bindEvents();
        } catch (err) {
            this.mostrarErro("Falha ao conectar com o banco de dados.");
        }
    }

    bindEvents() {
        const medForm = document.getElementById('medFormCaregiver');
        if (medForm) {
            medForm.addEventListener('submit', (e) => this.handleCadastroMedicamento(e));
        }
    }

    async handleCadastroMedicamento(e) {
        e.preventDefault();
        const form = e.target;
        
        const dados = {
            paciente: document.getElementById('mPatient').value,
            nome: document.getElementById('mName').value,
            dose: document.getElementById('mDose').value,
            horario: document.getElementById('mTime').value,
            frequencia: document.getElementById('mFreq').value
        };

        try {
            await this.service.cadastrarMedicamento(dados);
            showSuccessModal("Medicamento Agendado", `O remédio ${dados.nome} foi salvo com sucesso.`);
            form.reset();
            this.atualizarLista();
            setTimeout(() => window.location.href = 'inicio.html', 2000);
        } catch (err) {
            this.mostrarErro(err.message);
        }
    }

    async atualizarLista() {
        const container = document.getElementById('listaMedicamentosDB');
        if (!container) return;

        try {
            const medicamentos = await this.service.listarTodos();
            this.renderLista(container, medicamentos);
        } catch (err) {
            console.error("Erro ao carregar lista:", err);
        }
    }

    renderLista(container, medicamentos) {
        container.innerHTML = "";
        if (medicamentos.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>Nenhum medicamento agendado.</p></div>`;
            return;
        }

        medicamentos.forEach(med => {
            const card = document.createElement('div');
            card.className = 'card-item animate-fade';
            card.innerHTML = `
                <div class="card-item-info">
                    <h4 style="font-size: 1.2rem;">${med.nome}</h4>
                    <p>${med.dose} • <strong>${med.horario}</strong></p>
                </div>
                <button class="btn-remove" onclick="app.remover(${med.id})">Remover</button>
            `;
            container.appendChild(card);
        });
    }

    async remover(id) {
        showConfirm("Excluir", "Deseja remover este medicamento?", async () => {
            try {
                await this.service.excluir(id);
                this.atualizarLista();
                showNotification("Removido", "Medicamento excluído.");
            } catch (err) {
                this.mostrarErro("Não foi possível excluir o item.");
            }
        });
    }

    mostrarErro(mensagem) {
        // Assume que existe uma função global de erro ou usa alert como fallback
        if (typeof showErrorModal === 'function') {
            showErrorModal("Erro na Operação", mensagem);
        } else {
            alert("ERRO: " + mensagem);
        }
    }
}

// Inicialização da Aplicação com Injeção de Dependência
// O "db" aqui são as funções globais do db.js encapsuladas ou o próprio objeto global
const repository = { adicionarItem, buscarItens, deletarItem, atualizarItem }; 
const medicineService = new MedicineService(repository);
const app = new MedicineController(medicineService);

