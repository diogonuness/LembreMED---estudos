/**
 * DataService.js - Camada de Dados e Regras de Negócio Unificada.
 */

class DataService {
    constructor(db) {
        this.db = db;
    }

    // --- Medicamentos ---
    async cadastrarMedicamento(dados) {
        if (!dados.nome || !dados.dose || !dados.horario) {
            throw new Error("Campos obrigatórios: Nome, Dose e Horário.");
        }

        const user = JSON.parse(localStorage.getItem('lembremed_user'));
        const novoMedicamento = {
            ...dados,
            nome: dados.nome.trim(),
            usuario_id: user ? user.email : 'anonimo',
            taken: false,
            dataCadastro: new Date().toISOString()
        };

        return await this.db.adicionarItem('medicamentos', novoMedicamento);
    }

    async atualizarMedicamento(dados) {
        if (!dados.id) throw new Error("ID do medicamento não fornecido.");
        const user = JSON.parse(localStorage.getItem('lembremed_user'));
        if (user) dados.usuario_id = user.email;
        return await this.db.atualizarItem('medicamentos', dados);
    }

    async listarMedicamentos() {
        const todos = await this.db.buscarItens('medicamentos');
        const user = JSON.parse(localStorage.getItem('lembremed_user'));
        if (!user) return [];
        return todos.filter(m => m.usuario_id === user.email);
    }

    async excluirMedicamento(id) {
        return await this.db.deletarItem('medicamentos', id);
    }

    // --- Pacientes ---
    async cadastrarPaciente(dados) {
        const user = JSON.parse(localStorage.getItem('lembremed_user'));
        const novo = {
            ...dados,
            usuario_id: user ? user.email : 'anonimo'
        };
        return await this.db.adicionarItem('pacientes', novo);
    }

    async listarPacientes() {
        const todos = await this.db.buscarItens('pacientes');
        const user = JSON.parse(localStorage.getItem('lembremed_user'));
        if (!user) return [];
        return todos.filter(p => p.usuario_id === user.email);
    }

    _getToday() {
        const d = new Date();
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }

    async confirmarDose(medId, scheduledTime, status = "Tomado") {
        const meds = await this.listarMedicamentos();
        const med = meds.find(m => m.id == medId);
        if (med) {
            // Adicionar ao Histórico
            await this.adicionarAoHistorico({
                medId: med.id,
                medName: med.nome,
                paciente: med.paciente || 'Paciente',
                scheduledTime: scheduledTime || med.horario,
                status: status, // "Tomado" ou "Perdido"
                horarioConfirmacao: new Date().toLocaleTimeString('pt-BR'),
                dataConfirmacao: this._getToday(),
                timestamp: new Date().getTime()
            });
        }
    }


    async registrarDosePerdida(medId, scheduledTime) {
        return await this.confirmarDose(medId, scheduledTime, "Perdido");
    }


    // --- Pacientes ---
    async cadastrarPaciente(dados) {
        if (!dados.nome || !dados.idade) {
            throw new Error("Nome e Idade são obrigatórios.");
        }
        const novoPaciente = {
            ...dados,
            dataCadastro: new Date().toISOString()
        };
        return await this.db.adicionarItem('pacientes', novoPaciente);
    }

    async atualizarPaciente(dados) {
        return await this.db.atualizarItem('pacientes', dados);
    }

    async listarPacientes() {
        return await this.db.buscarItens('pacientes');
    }

    async excluirPaciente(id) {
        return await this.db.deletarItem('pacientes', id);
    }

    // --- Histórico ---
    async adicionarAoHistorico(item) {
        const user = JSON.parse(localStorage.getItem('lembremed_user'));
        if (user) item.usuario_id = user.email;
        return await this.db.adicionarItem('historico', item);
    }

    async listarHistorico() {
        const todos = await this.db.buscarItens('historico');
        const user = JSON.parse(localStorage.getItem('lembremed_user'));
        if (!user) return [];
        
        const filtrados = todos.filter(h => h.usuario_id === user.email);
        return filtrados.sort((a, b) => b.timestamp - a.timestamp);
    }

    // --- Configurações & Preferências ---
    getPreferencias() {
        return {
            fontSize: localStorage.getItem('lembremed_font_size') || 'normal',
            highContrast: localStorage.getItem('lembremed_high_contrast') === 'true',
            soundEnabled: localStorage.getItem('lembremed_sound') !== 'false'
        };
    }

    salvarPreferencias(prefs) {
        if (prefs.fontSize) localStorage.setItem('lembremed_font_size', prefs.fontSize);
        if (prefs.highContrast !== undefined) localStorage.setItem('lembremed_high_contrast', prefs.highContrast);
        if (prefs.soundEnabled !== undefined) localStorage.setItem('lembremed_sound', prefs.soundEnabled);
    }
}
