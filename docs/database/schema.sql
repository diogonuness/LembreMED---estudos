CREATE TABLE "usuarios" (
  "id" integer PRIMARY KEY,
  "nome" varchar NOT NULL,
  "email" varchar UNIQUE NOT NULL,
  "senha" text NOT NULL,
  "criado_em" timestamp DEFAULT (now())
);

CREATE TABLE "pacientes" (
  "id" integer PRIMARY KEY,
  "nome" varchar NOT NULL,
  "data_nascimento" date,
  "contato_emergencia" varchar,
  "usuario_id" integer NOT NULL,
  "criado_em" timestamp DEFAULT (now())
);

CREATE TABLE "doencas" (
  "id" integer PRIMARY KEY,
  "nome" varchar NOT NULL,
  "descricao" text,
  "aprovado" boolean DEFAULT false
);

CREATE TABLE "medicamentos" (
  "id" integer PRIMARY KEY,
  "nome" varchar NOT NULL,
  "dose" varchar NOT NULL,
  "frequencia" varchar,
  "horario_primeira_dose" time,
  "forma_farmaceutica" varchar,
  "paciente_id" integer NOT NULL,
  "doenca_id" integer,
  "criado_em" timestamp DEFAULT (now())
);

CREATE TABLE "historico" (
  "id" integer PRIMARY KEY,
  "medicamento_id" integer NOT NULL,
  "usuario_id" integer NOT NULL,
  "data_agendada" timestamp NOT NULL,
  "data_confirmada" timestamp,
  "status" varchar NOT NULL
);

ALTER TABLE "pacientes" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "medicamentos" ADD FOREIGN KEY ("paciente_id") REFERENCES "pacientes" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "medicamentos" ADD FOREIGN KEY ("doenca_id") REFERENCES "doencas" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "historico" ADD FOREIGN KEY ("medicamento_id") REFERENCES "medicamentos" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "historico" ADD FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") DEFERRABLE INITIALLY IMMEDIATE;
