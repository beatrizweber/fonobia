-- ============================================================
-- AjudaÁudio — Schema do banco de dados (PostgreSQL)
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

--PARTE 2 - Executar Separado =================================

-- ============================================================
-- Nível de facilidade de uso da plataforma reportado pelo paciente
-- ============================================================
CREATE TYPE facilidade_site_enum AS ENUM (
    'dificil',
    'razoavel',
    'facil'
);


-- ============================================================
-- TABELA: avaliacao
-- Avaliação expressa preenchida pelo paciente ao final de uma sessão
-- com voluntário. Uma avaliação por sessão (chave primária = sessao_id).
-- ============================================================
CREATE TABLE avaliacao (
    sessao_id       UUID                    PRIMARY KEY REFERENCES sessao(id) ON DELETE CASCADE,
    -- CASCADE: apagar a sessão apaga a avaliação junto
    nota_fono       SMALLINT                NOT NULL CHECK (nota_fono BETWEEN 1 AND 5),
    facilidade_site facilidade_site_enum    NOT NULL,
    comentario      TEXT,                                 -- opcional
    criado_em       TIMESTAMPTZ             NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--PARTE 3 - Executar Separado =================================

-- ============================================================
-- Substitui o boolean "aprovado" por um estado de aprovação com
-- 3 valores. Projeto social: nunca apagamos o cadastro de um
-- voluntário rejeitado, só marcamos o status — o histórico e os
-- dados da pessoa continuam no banco.
-- ============================================================
CREATE TYPE status_aprovacao_enum AS ENUM (
    'pendente',   -- aguardando análise do admin
    'aprovado',   -- CRFa/matrícula validada, pode atender
    'rejeitado'   -- cadastro recusado, mas mantido no histórico
);

ALTER TABLE voluntario
    ADD COLUMN status_aprovacao status_aprovacao_enum NOT NULL DEFAULT 'pendente';

-- Migra quem já estava aprovado antes dessa mudança
UPDATE voluntario SET status_aprovacao = 'aprovado' WHERE aprovado = TRUE;

ALTER TABLE voluntario DROP COLUMN aprovado;

--PARTE 4 - Executar Separado =================================

-- ============================================================
-- Aumenta o limite de registro_profissional: 20 caracteres era
-- suficiente pra CRFa, mas curto demais pra "comprovante de
-- matrícula" de estagiário — cadastro falhava com erro genérico.
-- ============================================================
ALTER TABLE voluntario
    ALTER COLUMN registro_profissional TYPE VARCHAR(50);

-- ============================================================
-- Controle de liberação da avaliação. Por padrão, uma avaliação
-- fica visível SÓ para o admin — nunca é apagada, só liberada ou
-- ocultada pro fono e pro paciente quando o admin decidir.
-- ============================================================
ALTER TABLE avaliacao
    ADD COLUMN liberado BOOLEAN NOT NULL DEFAULT FALSE;

--PARTE 5 - Executar Separado =================================

-- ============================================================
-- Suporte a anexar foto/vídeo no chat humano. Renomeia audio_url
-- pra arquivo_url (nome genérico, guarda qualquer tipo de anexo)
-- e adiciona 'imagem'/'video' no enum de tipo de conteúdo.
-- ============================================================
ALTER TYPE tipo_conteudo_enum ADD VALUE 'imagem';
ALTER TYPE tipo_conteudo_enum ADD VALUE 'video';

ALTER TABLE mensagem RENAME COLUMN audio_url TO arquivo_url;

--PARTE 6 - Executar Separado =================================

-- ============================================================
-- Confirmação de e-mail no cadastro. DEFAULT TRUE pra não travar
-- as contas que já existiam antes dessa migração (inclusive admin,
-- que nunca passa pela rota pública de cadastro) — só as contas
-- criadas a partir de agora nascem como FALSE (a rota de registro
-- passa esse valor explicitamente) e precisam clicar no link
-- enviado por e-mail antes de conseguir logar.
-- ============================================================
ALTER TABLE usuario
    ADD COLUMN email_verificado BOOLEAN NOT NULL DEFAULT TRUE;

--PARTE 7 - Executar Separado =================================

-- ============================================================
-- Motivo da rejeição de cadastro de voluntário — visível pra
-- pessoa entender o porquê, não só "foi recusado". Fica NULL
-- enquanto pendente/aprovado, só é preenchido junto do rejeitar.
-- ============================================================
ALTER TABLE voluntario
    ADD COLUMN motivo_rejeicao TEXT;

--PARTE 8 - Executar Separado =================================

-- ============================================================
-- FAQ gerenciável pelo admin. Antes era um array fixo dentro do
-- componente React — qualquer alteração exigia mexer no código e
-- fazer novo deploy. Agora vive no banco.
-- ============================================================
CREATE TABLE faq_categoria (
    id      SERIAL PRIMARY KEY,
    nome    VARCHAR(100)    NOT NULL,
    ordem   INT             NOT NULL DEFAULT 0
);

CREATE TABLE faq_item (
    id              SERIAL PRIMARY KEY,
    categoria_id    INT             NOT NULL REFERENCES faq_categoria(id) ON DELETE CASCADE,
    titulo          VARCHAR(200)    NOT NULL,
    descricao       VARCHAR(300),
    resposta        TEXT            NOT NULL,
    ordem           INT             NOT NULL DEFAULT 0,
    criado_em       TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faq_item_categoria_id ON faq_item (categoria_id);

-- Migra o conteúdo que já existia fixo no front (client/src/pages/Faq.jsx)
-- pra ninguém perder as perguntas que já estavam lá.
INSERT INTO faq_categoria (nome, ordem) VALUES
    ('Uso no dia a dia', 1),
    ('Carga e pilha', 2),
    ('Limpeza e cuidados', 3),
    ('Problemas comuns', 4),
    ('Conectar ao celular', 5);

INSERT INTO faq_item (categoria_id, titulo, descricao, resposta, ordem) VALUES
    ((SELECT id FROM faq_categoria WHERE nome = 'Uso no dia a dia'),
     'Como colocar o aparelho na orelha',
     'O encaixe correto faz toda a diferença na escuta.',
     'Certifique-se de identificar o lado correto (geralmente vermelho para o ouvido direito e azul para o esquerdo). Posicione o corpo do aparelho atrás da orelha e, suavemente, insira a oliva/molde no canal auditivo até sentir que está firme e confortável.',
     1),
    ((SELECT id FROM faq_categoria WHERE nome = 'Uso no dia a dia'),
     'Posso usar o aparelho na chuva ou no banho?',
     'Cuidados com água, suor e umidade.',
     'Não. A maioria dos aparelhos auditivos não é à prova d''água. Retire-os sempre antes do banho, ao nadar ou em chuvas fortes. Se molhar sem querer, desligue imediatamente, remova a pilha (se houver) e coloque no desumidificador.',
     2),

    ((SELECT id FROM faq_categoria WHERE nome = 'Carga e pilha'),
     'Como carregar o aparelho auditivo',
     'Passo a passo simples para deixar seu aparelho com bateria cheia.',
     'Coloque os aparelhos no carregador fornecido, garantindo que os contatos de recarga estejam limpos e bem encaixados. A luz do carregador geralmente piscará enquanto carrega e ficará fixa quando a carga estiver completa.',
     1),
    ((SELECT id FROM faq_categoria WHERE nome = 'Carga e pilha'),
     'Meu aparelho não liga, o que faço?',
     'Veja o que verificar antes de procurar a assistência.',
     '1. Verifique se a pilha/bateria tem carga.
2. Veja se a gaveta de pilha está totalmente fechada.
3. Confira se a saída de som não está entupida por cera de ouvido.
4. Certifique-se de que o aparelho está ligado.',
     2),
    ((SELECT id FROM faq_categoria WHERE nome = 'Carga e pilha'),
     'Como trocar a pilha do aparelho',
     'Para aparelhos que usam pilha (não recarregáveis).',
     'Abra a gaveta da pilha, remova a pilha gasta e retire o adesivo de proteção da pilha nova. Espere 1 minuto para a pilha ''respirar'' antes de inseri-la com o lado positivo (+) voltado para cima. Feche a gaveta.',
     3),

    ((SELECT id FROM faq_categoria WHERE nome = 'Limpeza e cuidados'),
     'Como limpar o molde do aparelho',
     'A limpeza diária aumenta a vida útil do aparelho.',
     'Use um pano seco e macio ou uma flanela para limpar o aparelho todos os dias. Para o molde de silicone, você pode usar a escovinha apropriada para remover o excesso de cera. Nunca use álcool ou produtos químicos.',
     1),
    ((SELECT id FROM faq_categoria WHERE nome = 'Limpeza e cuidados'),
     'Como guardar o aparelho à noite',
     'Guardar do jeito certo evita umidade e dano.',
     'Abra a gavetinha da pilha para desligar e economizar energia. Guarde o aparelho dentro do estojo protetor junto com o sílica gel (desumidificador) em um local seco e fora do alcance de crianças e animais domésticos.',
     2),

    ((SELECT id FROM faq_categoria WHERE nome = 'Problemas comuns'),
     'Meu aparelho está apitando, o que fazer?',
     'O apito (microfonia) tem causas simples de resolver.',
     'O apito acontece quando o som sai do aparelho e entra de volta no microfone. Verifique se o molde/oliva está bem encaixado na orelha. Se continuar apitando mesmo bem posicionado, procure seu fonoaudiólogo para verificar se há cera no ouvido ou necessidade de ajuste.',
     1),
    ((SELECT id FROM faq_categoria WHERE nome = 'Problemas comuns'),
     'Quando devo voltar ao SUS para revisão?',
     'Revisões periódicas mantêm seu aparelho funcionando bem.',
     'O acompanhamento recomendado é de pelo menos 1 vez a cada 6 meses, ou sempre que notar alteração na sua audição, desconforto no som ou avaria no aparelho.',
     2),

    ((SELECT id FROM faq_categoria WHERE nome = 'Conectar ao celular'),
     'Como conectar o aparelho ao celular',
     'Alguns aparelhos modernos se conectam ao celular por Bluetooth.',
     'Ative o Bluetooth do celular, abra as configurações de ''Acessibilidade'' ou o aplicativo próprio do fabricante do seu aparelho auditivo e coloque o aparelho em modo de pareamento (desligando e ligando novamente).',
     1);

--PARTE 9 - Executar Separado =================================

-- ============================================================
-- Confirmação de leitura ("visto") nas mensagens do chat humano.
-- ============================================================
ALTER TABLE mensagem
    ADD COLUMN lido_em TIMESTAMPTZ;

--PARTE 10 - Executar Separado =================================

-- ============================================================
-- Disponibilidade do voluntário ("online"/"ausente"), pra quem
-- pede atendimento saber se tem alguém pra atender agora. Só é
-- relevante quando aprovado — mas o campo existe pra todo mundo,
-- sem condicional na tabela.
-- ============================================================
ALTER TABLE voluntario
    ADD COLUMN disponivel BOOLEAN NOT NULL DEFAULT TRUE;

--PARTE 11 - Executar Separado =================================

-- ============================================================
-- Bio curta + especialidade do voluntário — aparece pro paciente
-- durante o atendimento, pra saber com quem está falando.
-- ============================================================
ALTER TABLE voluntario
    ADD COLUMN bio TEXT,
    ADD COLUMN especialidade VARCHAR(100);

--PARTE 12 - Executar Separado =================================

-- ============================================================
-- Log de auditoria das ações administrativas. Guarda só as ações
-- de maior impacto (aprovar/rejeitar voluntário, promover admin,
-- liberar/ocultar avaliação, mexer no FAQ) — não é log de sistema,
-- é rastro de responsabilidade de quem fez o quê.
-- ============================================================
CREATE TABLE log_admin (
    id          BIGSERIAL       PRIMARY KEY,
    admin_id    UUID            NOT NULL REFERENCES usuario(id) ON DELETE RESTRICT,
    acao        VARCHAR(60)     NOT NULL,
    alvo_tipo   VARCHAR(30)     NOT NULL,
    alvo_id     VARCHAR(100),
    detalhes    TEXT,
    criado_em   TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_log_admin_criado_em ON log_admin (criado_em DESC);