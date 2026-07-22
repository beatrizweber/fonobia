# 🎧 AjudaÁudio

O **AjudaÁudio** é uma plataforma desenvolvida para conectar pacientes usuários de aparelhos auditivos a fonoaudiólogos e estagiários voluntários, além de oferecer suporte através de assistência técnica inteligente.

---

## 🛠️ Tecnologias Utilizadas

### **Front-end (`/client`)**
* **React** + **Vite**
* **Tailwind CSS** (Estilização)
* **Lucide React** (Ícones)
* **React Router DOM** (Navegação)

### **Back-end (`/server`)**
* **Node.js**
* **Fastify** (Framework web leve e rápido)
* **`pg`** (Driver nativo do PostgreSQL com `Pool`)
* **`bcryptjs`** (Criptografia de senhas)
* **`dotenv`** (Gerenciamento de variáveis de ambiente)

### **Banco de Dados**
* **PostgreSQL** (Relacional)

---

## 🚀 Como Rodar o Projeto

### 📋 Pré-requisitos
* **Node.js** (v18 ou superior)
* **PostgreSQL** instalado e rodando em sua máquina
* **Git**

---

### 1️⃣ Configuração do Banco de Dados (PostgreSQL)

Abra o seu gerenciador de banco de dados (DBeaver, pgAdmin, etc.) ou via terminal `psql`, crie o banco de dados `ajudaaudio` e execute o script SQL abaixo para criar a estrutura completa:

```sql
-- Cria o banco de dados (se ainda não existir)
CREATE DATABASE ajudaaudio;

-- Conecte-se ao banco criado antes de rodar os comandos abaixo

-- ENUMS
CREATE TYPE tipo_usuario_enum AS ENUM ('paciente', 'fonoaudiologo', 'estagiario', 'admin');
CREATE TYPE inicio_sessao_enum AS ENUM ('ia', 'voluntario');
CREATE TYPE status_sessao_enum AS ENUM ('com_ia', 'aguardando_voluntario', 'com_voluntario', 'encerrada');
CREATE TYPE remetente_enum AS ENUM ('paciente', 'ia', 'voluntario');
CREATE TYPE tipo_conteudo_enum AS ENUM ('texto', 'audio');

-- TABELA: usuario
CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    tipo tipo_usuario_enum NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TABELA: paciente
CREATE TABLE paciente (
    usuario_id UUID PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    cartao_sus VARCHAR(15),
    data_nascimento DATE,
    modelo_aparelho VARCHAR(100),
    lado_aparelho VARCHAR(10)
);

CREATE UNIQUE INDEX idx_paciente_cartao_sus
    ON paciente (cartao_sus)
    WHERE cartao_sus IS NOT NULL;

-- TABELA: voluntario
CREATE TABLE voluntario (
    usuario_id UUID PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    registro_profissional VARCHAR(20),
    instituicao VARCHAR(100),
    aprovado BOOLEAN NOT NULL DEFAULT FALSE
);

-- TABELA: sessao
CREATE TABLE sessao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    voluntario_id UUID REFERENCES usuario(id) ON DELETE SET NULL,
    iniciado_por inicio_sessao_enum NOT NULL,
    status status_sessao_enum NOT NULL DEFAULT 'com_ia',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessao_paciente_id ON sessao (paciente_id);
CREATE INDEX idx_sessao_voluntario_id ON sessao (voluntario_id) WHERE voluntario_id IS NOT NULL;
CREATE INDEX idx_sessao_status ON sessao (status);

-- TABELA: mensagem
CREATE TABLE mensagem (
    id BIGSERIAL PRIMARY KEY,
    sessao_id UUID NOT NULL REFERENCES sessao(id) ON DELETE CASCADE,
    remetente remetente_enum NOT NULL,
    tipo_conteudo tipo_conteudo_enum NOT NULL DEFAULT 'texto',
    conteudo TEXT,
    audio_url TEXT,
    enviado_em TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mensagem_sessao_id ON mensagem (sessao_id);
```

---

### 2️⃣ Configuração do Back-end (`/server`)

Entre na pasta do servidor:

```bash
cd server
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` dentro da pasta `server/` copiando o modelo abaixo com as credenciais do seu PostgreSQL local:

```env
PORT=3001
DB_USER=postgres
DB_HOST=localhost
DB_NAME=ajudaaudio
DB_PASSWORD=sua_senha_do_postgres
DB_PORT=5432
```

Inicie o servidor:

```bash
npm start
```

O servidor rodará em `http://localhost:3001`.

---

### 3️⃣ Configuração do Front-end (`/client`)

Abra um novo terminal na raiz do projeto e entre na pasta do cliente:

```bash
cd client
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento do React:

```bash
npm run dev
```

O front-end rodará em `http://localhost:5173`.

---

## 📌 Rotas Disponíveis na API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Verifica o status do servidor |
| POST | `/api/auth/register` | Realiza o cadastro (Paciente, Fonoaudiólogo ou Estagiário) |
| POST | `/api/auth/login` | Realiza o login do usuário |
| POST | `/api/chat` | Envia mensagens para a IA |

---

## 🔒 Segurança

O arquivo `.env` está listado no `.gitignore` para garantir que senhas e credenciais do banco de dados não sejam enviadas ao repositório público.