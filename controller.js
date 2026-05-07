/**
 * controller.js - Master Controller do LembreMED.
 * Centraliza a lógica de UI, Alertas e Integração com DataService.
 */

class AppController {
    constructor(service) {
        this.service = service;
        this.reminderInterval = null;
        this.init();
    }

    async init() {
        console.log("LembreMED Master Controller iniciado.");
        try {
            await iniciarBanco();
            this.applySettings();
            this.checkAuth();
            this.setupReminders();
            this.renderCurrentPage();
            this.bindGlobalEvents();
        } catch (err) {
            console.error("Erro na inicialização:", err);
        }
    }

    // --- Core & Auth ---
    checkAuth() {
        const logged = localStorage.getItem('lembremed_logged');
        const user = JSON.parse(localStorage.getItem('lembremed_user'));
        const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('cadastro.html');

        if (!logged || !user) {
            if (!isAuthPage) {
                const prefix = window.location.pathname.includes('/pages/') ? '../' : '';
                window.location.href = prefix + (window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html');
            }
            return;
        }

        const nameDisplay = document.getElementById('userNameDisplay');
        if (nameDisplay) nameDisplay.innerText = `Olá, ${user.nome}`;
    }

    logout() {
        localStorage.removeItem('lembremed_logged');
        const prefix = window.location.pathname.includes('/pages/') ? '../' : '';
        window.location.href = prefix + (window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html');
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.toggle('open');
    }

    applySettings() {
        const prefs = this.service.getPreferencias();
        document.body.classList.remove('font-large', 'font-xl', 'high-contrast');
        
        if (prefs.fontSize !== 'normal') document.body.classList.add(`font-${prefs.fontSize}`);
        if (prefs.highContrast) document.body.classList.add('high-contrast');

        // Atualizar inputs na página de config
        const configName = document.getElementById('configName');
        const user = JSON.parse(localStorage.getItem('lembremed_user'));
        if (configName && user) configName.value = user.nome;
    }

    // --- Alertas & Lembretes ---
    setupReminders() {
        if (this.reminderInterval) clearInterval(this.reminderInterval);
        
        // Verifica a cada 1 minuto
        this.reminderInterval = setInterval(() => this.checkMedicationTimes(), 60000);
        this.checkMedicationTimes(); // Verificação imediata
    }

    async checkMedicationTimes() {
        const meds = await this.service.listarMedicamentos();
        const history = await this.service.listarHistorico();
        const today = new Date().toLocaleDateString('pt-BR');
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

        for (const med of meds) {
            // Verifica se é exatamente o horário de agora
            if (med.horario === currentTime) {
                // Verifica se já não foi registrado hoje
                const jaRegistrado = history.find(h => 
                    h.medId === med.id && 
                    h.dataConfirmacao === today && 
                    h.scheduledTime === med.horario
                );

                if (!jaRegistrado) {
                    this.notificar(med);
                }
            }
        }
    }

    notificar(med) {
        // Notificação Visual (Toast)
        this.showToast("Hora do Remédio", `${med.nome} (${med.dose})`, "💊", "success");

        // Notificação Sonora (Beep Simples)
        const prefs = this.service.getPreferencias();
        if (prefs.soundEnabled) {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
            oscillator.connect(audioCtx.destination);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        }

        // Web Notification API (se permitido)
        if (Notification.permission === "granted") {
            new Notification("LembreMED: " + med.nome, { body: `Dose: ${med.dose} agora!` });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }

    // --- Rendering ---
    renderCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('inicio.html') || path.includes('paciente-view.html')) {
            this.renderDashboard();
            this.renderHistorico(); // Garantir que o histórico também atualize nessas vistas
            
            if (typeof renderMedicamentos === 'function') renderMedicamentos();
            if (typeof renderDiseases === 'function') renderDiseases();
        }
        if (path.includes('medicamentos.html')) this.renderMedicamentos();
        if (path.includes('historico.html')) this.renderHistorico();
        if (path.includes('pacientes.html')) this.renderPacientes();
        if (path.includes('configuracoes.html')) this.renderConfiguracoes();
    }


    async renderDashboard() {
        console.log("Iniciando renderDashboard...");
        const meds = await this.service.listarMedicamentos();
        const history = await this.service.listarHistorico();
        const today = this.service._getToday();
        const now = new Date();
        const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
        
        console.log("Config Atual:", { today, currentTotalMinutes, medsCount: meds.length, historyCount: history.length });

        const nextDoseContainer = document.getElementById('nextDoseContainer') || document.getElementById('dosesDoDiaList');
        const statsTaken = document.getElementById('statTaken');
        const statPending = document.getElementById('statPending');
        const statMissed = document.getElementById('statMissed');

        if (!nextDoseContainer) return;

        const dosesDoDia = [];
        let autoMissedHandled = false;
        
        for (const med of meds) {
            if (!med.horario) continue;
            
            // Expandir frequências
            const baseTime = med.horario;
            const [baseH, baseM] = baseTime.split(':').map(Number);
            const baseMinutes = baseH * 60 + baseM;
            
            let intervals = [baseMinutes];
            
            if (med.frequencia === "2x ao dia (12/12h)") intervals = [baseMinutes, (baseMinutes + 720) % 1440];
            if (med.frequencia === "3x ao dia (8/8h)") intervals = [baseMinutes, (baseMinutes + 480) % 1440, (baseMinutes + 960) % 1440];
            if (med.frequencia === "4x ao dia (6/6h)") intervals = [baseMinutes, (baseMinutes + 360) % 1440, (baseMinutes + 720) % 1440, (baseMinutes + 1080) % 1440];

            for (let scheduledMinutes of intervals) {
                const h = Math.floor(scheduledMinutes / 60).toString().padStart(2, '0');
                const m = (scheduledMinutes % 60).toString().padStart(2, '0');
                const timeStr = `${h}:${m}`;

                const jaRegistrado = history.find(h => 
                    String(h.medId) === String(med.id) && 
                    h.dataConfirmacao === today && 
                    h.scheduledTime === timeStr
                );

                if (!jaRegistrado) {
                    if (currentTotalMinutes > scheduledMinutes + 60) {
                        await this.service.registrarDosePerdida(med.id, timeStr);
                        autoMissedHandled = true;
                    } else {
                        dosesDoDia.push({ ...med, horario: timeStr, scheduledMinutes });
                    }
                }
            }
        }

        if (autoMissedHandled) return this.renderDashboard();

        // Atualizar Adesão
        const takenToday = history.filter(h => h.dataConfirmacao === today && h.status === "Tomado").length;
        const missedToday = history.filter(h => h.dataConfirmacao === today && h.status === "Perdido").length;
        const totalToday = takenToday + missedToday + dosesDoDia.length;
        const percent = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

        const circle = document.getElementById('adherenceCircle') || document.getElementById('patientAdherenceCircle');
        const text = document.getElementById('adherenceText') || document.getElementById('patientAdherenceText');
        if (circle) circle.style.strokeDasharray = `${percent}, 100`;
        if (text) text.innerText = `${percent}%`;

        if (statsTaken) statsTaken.innerText = takenToday;
        if (statPending) statPending.innerText = dosesDoDia.length;
        if (statMissed) statMissed.innerText = missedToday;

        // Renderizar Lista
        nextDoseContainer.innerHTML = dosesDoDia.length ? "" : '<div class="empty-state"><p>Tudo em dia por enquanto!</p></div>';
        dosesDoDia.sort((a,b) => a.scheduledMinutes - b.scheduledMinutes);

        dosesDoDia.forEach(med => {
            const item = document.createElement('div');
            item.className = 'card-item animate-fade';
            item.innerHTML = `
                <div class="card-item-info">
                    <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700;">${med.paciente && med.paciente !== 'Eu' ? med.paciente : 'Minha Dose'}</span>
                    <h4>${med.nome}</h4>
                    <p>${med.dose} • <strong>${med.horario}</strong></p>
                </div>
                <button class="btn btn-primary" onclick="app.confirmarMed(${med.id}, '${med.horario}')">Tomar</button>
            `;
            nextDoseContainer.appendChild(item);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }



    async renderMedicamentos() {
        const container = document.getElementById('listaMedicamentosDB') || document.getElementById('medListContainer');
        if (!container) return;

        const meds = await this.service.listarMedicamentos();
        container.innerHTML = meds.length ? "" : '<div class="empty-state"><p>Nenhum registro encontrado. Clique em \'Novo\' para começar.</p></div>';

        meds.forEach(med => {
            const item = document.createElement('div');
            item.className = 'card-item animate-fade';
            item.innerHTML = `
                <div class="card-item-info">
                    <h4>${med.nome}</h4>
                    <p>${med.dose} • <strong>${med.horario}</strong></p>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-outline" style="padding: 0.5rem;" onclick="app.abrirEdicao(${med.id})">
                        <i data-lucide="edit-3"></i>
                    </button>
                    <button class="btn-remove" style="padding: 0.5rem;" onclick="app.excluirMed(${med.id})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;
            container.appendChild(item);
        });
        
        this.popularSelectPacientes();
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    async renderPacientes() {
        const container = document.getElementById('patientListContainer');
        if (!container) return;

        const patients = await this.service.listarPacientes();
        container.innerHTML = patients.length ? "" : '<div class="empty-state"><p>Nenhum registro encontrado. Clique em \'Novo\' para começar.</p></div>';

        patients.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card patient-card animate-fade';
            card.innerHTML = `
                <h3>${p.nome}</h3>
                <p>${p.condicao}</p>
                <div style="display: flex; gap: 0.5rem; margin-top: 1.5rem;">
                    <button class="btn btn-outline" style="flex: 1; padding: 0.8rem;" onclick="app.abrirEdicaoPaciente(${p.id})">
                        <i data-lucide="edit-3"></i> Editar Dados
                    </button>
                    <button class="btn-remove" style="padding: 0.8rem; border-radius: 12px;" onclick="app.excluirPaciente(${p.id})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            `;
            container.appendChild(card);
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    async popularSelectPacientes() {
        const select = document.getElementById('mPatient');
        if (!select) return;

        const patients = await this.service.listarPacientes();
        select.innerHTML = '<option value="" disabled selected>Selecione um paciente</option>';
        patients.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.nome;
            opt.innerText = p.nome;
            select.appendChild(opt);
        });
    }

    async renderHistorico() {
        const container = document.getElementById('patientHistoryContainer');
        if (!container) return;

        const history = await this.service.listarHistorico();
        container.innerHTML = history.length ? "" : '<div class="empty-state"><p>O histórico aparecerá aqui após as confirmações.</p></div>';

        history.forEach(h => {
            const isTomado = h.status === "Tomado";
            const statusClass = isTomado ? "success" : "error";
            
            const item = document.createElement('div');
            item.className = 'card-item animate-fade';
            item.innerHTML = `
                <div class="card-item-info">
                    <h4 style="display: flex; align-items: center; gap: 0.75rem;">
                        ${h.medName} 
                        <span class="status-pill ${statusClass}">
                            ${h.status || 'Tomado'}
                        </span>
                    </h4>
                    <p>Agendado para ${h.scheduledTime} em ${h.dataConfirmacao}</p>
                    <p style="font-size: 0.8rem; color: var(--text-sub);">Registro em: ${h.horarioConfirmacao}</p>
                </div>
                <div class="card-item-action">
                    <span style="color: ${isTomado ? 'var(--primary)' : 'var(--text-danger)'}; font-size: 1.5rem;">
                        <i data-lucide="${isTomado ? 'check-circle' : 'x-circle'}"></i>
                    </span>
                </div>
            `;
            container.appendChild(item);
        });
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }


    async renderConfiguracoes() {
        const prefs = this.service.getPreferencias();
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        const soundNotif = document.getElementById('soundNotif');
        const highContrast = document.getElementById('highContrastCheck');

        if (fontSizeSelect) fontSizeSelect.value = prefs.fontSize;
        if (soundNotif) soundNotif.checked = prefs.soundEnabled;
        if (highContrast) highContrast.checked = prefs.highContrast;
    }

    // --- Actions ---
    async salvarConfiguracoes() {
        const fontSize = document.getElementById('fontSizeSelect').value;
        const soundEnabled = document.getElementById('soundNotif').checked;
        const highContrast = document.getElementById('highContrastCheck')?.checked;

        this.service.salvarPreferencias({ fontSize, soundEnabled, highContrast });
        this.applySettings();
        this.showToast("Configurações Salvas", "Suas preferências foram atualizadas.", "⚙️", "success");
    }

    async salvarPerfil() {
        const newName = document.getElementById('configName').value;
        const user = JSON.parse(localStorage.getItem('lembremed_user'));
        if (user && newName) {
            user.nome = newName;
            localStorage.setItem('lembremed_user', JSON.stringify(user));
            this.showToast("Perfil Atualizado", "Seu nome foi salvo com sucesso.", "👤", "success");
            setTimeout(() => window.location.reload(), 1000);
        }
    }

    limparDados() {
        if (confirm("ATENÇÃO: Isso apagará TODOS os dados (medicamentos, pacientes, histórico). Deseja continuar?")) {
            const pass = prompt("Para confirmar, digite a senha 'apagar':");
            if (pass === 'apagar') {
                indexedDB.deleteDatabase(dbName);
                localStorage.clear();
                alert("Banco de dados removido. A página será reiniciada.");
                window.location.href = '../index.html';
            } else {
                alert("Senha incorreta.");
            }
        }
    }

    async verPaciente(id) {
        window.location.href = `paciente-view.html?id=${id}`;
    }

    async confirmarMed(id, scheduledTime) {
        try {
            await this.service.confirmarDose(id, scheduledTime);
            this.showToast("Dose Confirmada", "Medicamento registrado no histórico.", "✅", "success");
            this.renderCurrentPage();
        } catch (err) {
            this.showToast("Erro", "Não foi possível confirmar a dose.", "❌", "error");
        }
    }

    async excluirMed(id) {
        const modal = document.getElementById('confirmModal');
        if (!modal) return;
        
        document.getElementById('confirmTitle').innerText = "Excluir Medicamento";
        document.getElementById('confirmMessage').innerText = "Tem certeza que deseja remover este medicamento?";
        modal.style.display = 'flex';
        
        const btnConfirm = document.getElementById('btnConfirmAction');
        const newBtn = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);

        newBtn.onclick = async () => {
            try {
                await this.service.excluirMedicamento(id);
                this.showToast("Excluído", "Medicamento removido com sucesso!", "🗑️", "success");
                modal.style.display = 'none';
                this.renderCurrentPage();
            } catch (err) {
                this.showToast("Erro", "Não foi possível excluir.", "❌", "error");
            }
        };
    }

    async abrirEdicao(id) {
        const meds = await this.service.listarMedicamentos();
        const med = meds.find(m => m.id == id);
        if (med) {
            const isPatientView = !!document.getElementById('medFormPatient');
            if (isPatientView) {
                document.getElementById('medId').value = med.id;
                document.getElementById('medName').value = med.nome;
                document.getElementById('medDose').value = med.dose;
                document.getElementById('medTime').value = med.horario;
                document.getElementById('medFreq').value = med.frequencia;
                document.querySelector('#medPatientModal h2').innerText = 'Editar Medicamento';
                openModal('medPatientModal');
            } else {
                document.getElementById('medIdCaregiver').value = med.id;
                document.getElementById('mName').value = med.nome;
                document.getElementById('mDose').value = med.dose;
                document.getElementById('mTime').value = med.horario;
                document.getElementById('mFreq').value = med.frequencia;
                document.getElementById('mPatient').value = med.paciente;
                document.querySelector('#medCaregiverModal h2').innerText = 'Editar Medicamento';
                openModal('medCaregiverModal');
            }
        }
    }

    async abrirEdicaoPaciente(id) {
        const patients = await this.service.listarPacientes();
        const p = patients.find(item => item.id == id);
        if (p) {
            document.getElementById('pName').value = p.nome;
            document.getElementById('pAge').value = p.idade;
            document.getElementById('pCondition').value = p.condicao;
            document.getElementById('pContact').value = p.contato;
            
            let idField = document.getElementById('pIdCaregiver');
            if (!idField) {
                idField = document.createElement('input');
                idField.type = 'hidden';
                idField.id = 'pIdCaregiver';
                document.getElementById('patientFormCaregiver').appendChild(idField);
            }
            idField.value = p.id;

            document.querySelector('#patientCaregiverModal h2').innerText = 'Editar Paciente';
            openModal('patientCaregiverModal');
        }
    }

    async excluirPaciente(id) {
        const modal = document.getElementById('confirmModal');
        if (!modal) return;

        document.getElementById('confirmTitle').innerText = "Excluir Paciente";
        document.getElementById('confirmMessage').innerText = "Esta ação removerá todos os dados do paciente permanentemente.";
        modal.style.display = 'flex';
        
        const btnConfirm = document.getElementById('btnConfirmAction');
        const newBtn = btnConfirm.cloneNode(true);
        btnConfirm.parentNode.replaceChild(newBtn, btnConfirm);

        newBtn.onclick = async () => {
            try {
                await this.service.excluirPaciente(id);
                this.showToast("Removido", "Paciente excluído com sucesso.", "🗑️", "success");
                modal.style.display = 'none';
                this.renderCurrentPage();
            } catch (err) {
                this.showToast("Erro", "Não foi possível excluir o paciente.", "❌", "error");
            }
        };
    }

    async abrirEdicao(id) {
        const meds = await this.service.listarMedicamentos();
        const med = meds.find(m => m.id == id);
        if (med) {
            const isPatientView = !!document.getElementById('medFormPatient');
            const formId = isPatientView ? 'medFormPatient' : 'medFormCaregiver';
            const form = document.getElementById(formId);

            if (form) {
                if (isPatientView) {
                    document.getElementById('medId').value = med.id;
                    document.getElementById('medName').value = med.nome;
                    document.getElementById('medDose').value = med.dose;
                    document.getElementById('medTime').value = med.horario;
                    document.getElementById('medFreq').value = med.frequencia;
                    document.querySelector('#medPatientModal h2').innerText = 'Editar Medicamento';
                    openModal('medPatientModal');
                } else {
                    // Caregiver View
                    document.getElementById('mName').value = med.nome;
                    document.getElementById('mDose').value = med.dose;
                    document.getElementById('mTime').value = med.horario;
                    document.getElementById('mFreq').value = med.frequencia;
                    document.getElementById('mPatient').value = med.paciente;
                    
                    // Add hidden ID field if not exists
                    let idField = document.getElementById('medIdCaregiver');
                    if (!idField) {
                        idField = document.createElement('input');
                        idField.type = 'hidden';
                        idField.id = 'medIdCaregiver';
                        form.appendChild(idField);
                    }
                    idField.value = med.id;

                    document.querySelector('.card-title h3').innerText = 'Editar Medicamento';
                    form.querySelector('button').innerText = 'Salvar Alterações';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
        }
    }

    async abrirEdicaoPaciente(id) {
        const patients = await this.service.listarPacientes();
        const p = patients.find(item => item.id == id);
        if (p) {
            document.getElementById('pName').value = p.nome;
            document.getElementById('pAge').value = p.idade;
            document.getElementById('pCondition').value = p.condicao;
            document.getElementById('pContact').value = p.contato;
            
            // Reutiliza o campo oculto se necessário ou apenas identifica o form
            const form = document.getElementById('patientFormCaregiver');
            let idField = document.getElementById('pIdCaregiver');
            if (!idField) {
                idField = document.createElement('input');
                idField.type = 'hidden';
                idField.id = 'pIdCaregiver';
                form.appendChild(idField);
            }
            idField.value = p.id;

            document.querySelector('#patientCaregiverModal h2').innerText = 'Editar Paciente';
            openModal('patientCaregiverModal');
        }
    }

    async excluirPaciente(id) {
        showConfirm("Excluir Paciente", "Esta ação removerá todos os dados do paciente permanentemente.", async () => {
            try {
                await this.service.excluirPaciente(id);
                this.showToast("Removido", "Paciente excluído com sucesso.", "🗑️", "success");
                this.renderCurrentPage();
            } catch (err) {
                this.showToast("Erro", "Não foi possível excluir o paciente.", "❌", "error");
            }
        });
    }

    // --- Events & UI ---
    bindGlobalEvents() {
        const medForm = document.getElementById('medFormCaregiver') || document.getElementById('medFormPatient');
        if (medForm) {
            medForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const isPatientView = !!document.getElementById('medFormPatient');
                const id = isPatientView ? document.getElementById('medId').value : document.getElementById('medIdCaregiver')?.value;
                
                const dados = {
                    paciente: isPatientView ? 'Eu' : document.getElementById('mPatient').value,
                    nome: isPatientView ? document.getElementById('medName').value : document.getElementById('mName').value,
                    dose: isPatientView ? document.getElementById('medDose').value : document.getElementById('mDose').value,
                    horario: isPatientView ? document.getElementById('medTime').value : document.getElementById('mTime').value,
                    frequencia: isPatientView ? document.getElementById('medFreq').value : document.getElementById('mFreq').value
                };
                
                try {
                    if (id && id !== '') {
                        dados.id = parseInt(id);
                        await this.service.atualizarMedicamento(dados);
                        this.showToast("Atualizado", "Medicamento atualizado com sucesso!", "✅", "success");
                        isPatientView ? closeModal('medPatientModal') : closeModal('medCaregiverModal');
                    } else {
                        await this.service.cadastrarMedicamento(dados);
                        this.showToast("Sucesso", "Medicamento criado com sucesso!", "💊", "success");
                        isPatientView ? closeModal('medPatientModal') : closeModal('medCaregiverModal');
                    }
                    
                    medForm.reset();
                    if (isPatientView) {
                        document.getElementById('medId').value = '';
                    } else {
                        const idField = document.getElementById('medIdCaregiver');
                        if (idField) idField.value = '';
                        document.querySelector('.card-title h3').innerText = 'Cadastrar Medicamento';
                        medForm.querySelector('button').innerText = 'Cadastrar Medicamento';
                    }

                    this.renderCurrentPage();
                } catch (err) {
                    this.showToast("Erro", err.message, "❌", "error");
                }
            });
        }

        const patientForm = document.getElementById('patientFormCaregiver');
        if (patientForm) {
            patientForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const id = document.getElementById('pIdCaregiver')?.value;
                const dados = {
                    nome: document.getElementById('pName').value,
                    idade: document.getElementById('pAge').value,
                    condicao: document.getElementById('pCondition').value,
                    contato: document.getElementById('pContact').value
                };

                try {
                    if (id && id !== '') {
                        dados.id = parseInt(id);
                        await this.service.atualizarPaciente(dados);
                        this.showToast("Atualizado", "Dados do paciente atualizados.", "✅", "success");
                    } else {
                        await this.service.cadastrarPaciente(dados);
                        this.showToast("Paciente Salvo", `${dados.nome} foi cadastrado.`, "👤", "success");
                    }
                    
                    closeModal('patientCaregiverModal');
                    patientForm.reset();
                    const idField = document.getElementById('pIdCaregiver');
                    if (idField) idField.value = '';

                    this.renderCurrentPage();
                } catch (err) {
                    this.showToast("Erro", err.message, "❌", "error");
                }
            });
        }
    }

    showToast(title, message, icon = "🔔", type = "success") {
        const container = document.getElementById("notificationContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        
        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                <span class="toast-message">${message}</span>
            </div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }
}

// Inicialização Global
const repository = { adicionarItem, buscarItens, deletarItem, atualizarItem };
const dataService = new DataService(repository);
const app = new AppController(dataService);

// Exposição Global para compatibilidade com HTML
window.toggleSidebar = () => app.toggleSidebar();
window.logout = () => app.logout();
window.openModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'flex';
};
window.closeModal = (id) => {
    const modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
};
