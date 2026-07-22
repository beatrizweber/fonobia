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

Abra o seu gerenciador de banco de dados (DBeaver, pgAdmin, etc.) ou via terminal `psql`, crie o banco de dados `ajudaaudio` e execute o script SQL abaixo para criar o esquema relacional:

```sql
-- Cria o banco de dados (se ainda não existir)
CREATE DATABASE ajudaaudio;

-- Cria extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela central de usuários
CREATE TABLE IF NOT EXISTS usuario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) CHECK (tipo IN ('paciente', 'fonoaudiologo', 'estagiario')) NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Pacientes
CREATE TABLE IF NOT EXISTS paciente (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID UNIQUE NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  cartao_sus VARCHAR(50),
  data_nascimento DATE,
  modelo_aparelho VARCHAR(100),
  lado_aparelho VARCHAR(20) DEFAULT 'bilateral'
);

-- 3. Tabela de Voluntários (Fonoaudiólogos e Estagiários)
CREATE TABLE IF NOT EXISTS voluntario (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID UNIQUE NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  registro_profissional VARCHAR(100),
  instituicao VARCHAR(255)
);