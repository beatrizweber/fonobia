-- ============================================================
-- EscutaBem — Schema do banco de dados (PostgreSQL)
-- ============================================================


-- ============================================================
-- ENUMS
-- Tipos fixos de valores aceitos pelo banco.
-- O banco rejeita automaticamente qualquer valor fora da lista.
-- ============================================================

-- Perfis possíveis de um usuário no sistema
CREATE TYPE tipo_usuario_enum AS ENUM (
    'paciente',
    'fonoaudiologo',
    'estagiario',
    'admin'
);

-- Por onde a sessão de chat foi iniciada
CREATE TYPE inicio_sessao_enum AS ENUM (
    'ia',          -- paciente escolheu conversar com a IA
    'voluntario'   -- paciente escolheu falar direto com um humano
);

-- Estado atual de uma sessão de chat
CREATE TYPE status_sessao_enum AS ENUM (
    'com_ia',               -- IA está respondendo
    'aguardando_voluntario',-- paciente pediu humano, ninguém assumiu ainda
    'com_voluntario',       -- voluntário está atendendo
    'encerrada'             -- conversa finalizada
);

-- Quem enviou a mensagem
CREATE TYPE remetente_enum AS ENUM (
    'paciente',
    'ia',
    'voluntario'
);

-- Formato do conteúdo da mensagem
CREATE TYPE tipo_conteudo_enum AS ENUM (
    'texto',
    'audio'
);


-- ============================================================
-- TABELA: usuario
-- Centraliza todos os perfis do sistema.
-- Pacientes, fonoaudiólogos, estagiários e admins são todos
-- cadastrados aqui primeiro.
-- ============================================================
CREATE TABLE usuario (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome        VARCHAR(100)        NOT NULL,
    email       VARCHAR(100)        NOT NULL UNIQUE,
    senha_hash  VARCHAR(255)        NOT NULL,  -- nunca salvar a senha direta, apenas o hash
    tipo        tipo_usuario_enum   NOT NULL,
    criado_em   TIMESTAMPTZ         NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- TABELA: paciente
-- Dados extras exclusivos de quem usa o aparelho auditivo.
-- Ligada 1-para-1 com usuario.
-- ============================================================
CREATE TABLE paciente (
    -- mesmo id do usuario, funciona como chave primária e estrangeira ao mesmo tempo
    usuario_id      UUID        PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    cartao_sus      VARCHAR(15),                -- pode ser nulo se o paciente ainda não tiver
    data_nascimento DATE,
    modelo_aparelho VARCHAR(100),               -- ajuda a IA a saber qual manual consultar
    lado_aparelho   VARCHAR(10)                 -- 'esquerdo', 'direito' ou 'bilateral'
);

-- Garante que dois pacientes não tenham o mesmo cartão do SUS,
-- mas permite que o campo fique vazio (NULL) sem conflito
CREATE UNIQUE INDEX idx_paciente_cartao_sus
    ON paciente (cartao_sus)
    WHERE cartao_sus IS NOT NULL;


-- ============================================================
-- TABELA: voluntario
-- Dados extras de fonoaudiólogos e estagiários.
-- Ligada 1-para-1 com usuario.
-- ============================================================
CREATE TABLE voluntario (
    usuario_id              UUID                PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    registro_profissional   VARCHAR(20),        -- CRFa para formados, comprovante de matrícula para estagiários
    instituicao             VARCHAR(100),       -- universidade ou clínica
    aprovado                BOOLEAN             NOT NULL DEFAULT FALSE  -- admin precisa aprovar antes do voluntário atender
);


-- ============================================================
-- TABELA: sessao
-- Representa uma conversa completa entre um paciente e o sistema.
-- Cada sessão começa com IA ou direto com voluntário, conforme
-- escolha do paciente.
-- ============================================================
CREATE TABLE sessao (
    id              UUID                    PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id     UUID                    NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    -- RESTRICT: impede apagar um usuário que ainda tem sessões registradas
    voluntario_id   UUID                    REFERENCES usuario(id) ON DELETE SET NULL,
    -- SET NULL: se o voluntário for removido, a sessão continua mas sem vínculo
    iniciado_por    inicio_sessao_enum      NOT NULL,   -- 'ia' ou 'voluntario'
    status          status_sessao_enum      NOT NULL DEFAULT 'com_ia',
    criado_em       TIMESTAMPTZ             NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Agiliza a busca por todas as sessões de um paciente
CREATE INDEX idx_sessao_paciente_id ON sessao (paciente_id);

-- Agiliza a busca por sessões atribuídas a um voluntário específico
CREATE INDEX idx_sessao_voluntario_id ON sessao (voluntario_id)
    WHERE voluntario_id IS NOT NULL;

-- Agiliza a busca por sessões aguardando atendimento (fila de espera)
CREATE INDEX idx_sessao_status ON sessao (status);


-- ============================================================
-- TABELA: mensagem
-- Guarda cada mensagem trocada dentro de uma sessão.
-- É a tabela que mais cresce com o tempo.
-- ============================================================
CREATE TABLE mensagem (
    id              BIGSERIAL               PRIMARY KEY,  -- número sequencial, mais eficiente que UUID para tabelas grandes
    sessao_id       UUID                    NOT NULL REFERENCES sessao(id) ON DELETE CASCADE,
    -- CASCADE: apagar a sessão apaga todas as mensagens junto
    remetente       remetente_enum          NOT NULL,     -- 'paciente', 'ia' ou 'voluntario'
    tipo_conteudo   tipo_conteudo_enum      NOT NULL DEFAULT 'texto',
    conteudo        TEXT,                                 -- texto digitado ou transcrição do áudio
    audio_url       TEXT,                                 -- link do arquivo de áudio (URLs podem ser longas)
    enviado_em      TIMESTAMPTZ             NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Agiliza a busca por todas as mensagens de uma sessão (a query mais frequente do sistema)
CREATE INDEX idx_mensagem_sessao_id ON mensagem (sessao_id);
