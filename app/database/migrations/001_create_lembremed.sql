CREATE TABLE IF NOT EXISTS pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    idade INTEGER,
    condicao TEXT,
    contato TEXT,
    usuario_id TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS medicamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente TEXT NOT NULL DEFAULT 'Eu',
    nome TEXT NOT NULL,
    dose TEXT NOT NULL,
    horario TEXT NOT NULL,
    frequencia TEXT,
    taken INTEGER NOT NULL DEFAULT 0,
    usuario_id TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS historico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    med_id INTEGER NOT NULL,
    med_name TEXT NOT NULL,
    paciente TEXT,
    scheduled_time TEXT NOT NULL,
    status TEXT NOT NULL,
    horario_confirmacao TEXT,
    data_confirmacao TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    usuario_id TEXT NOT NULL,
    criado_em TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
