// server/src/routes/atendimentos.js
import { pool, uploadsDir } from '../server.js';
import { verificarToken, exigirTipos } from '../middleware/auth.js';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { broadcast } from '../ws/salas.js';

const STATUS_VALIDOS = ['com_ia', 'aguardando_voluntario', 'com_voluntario', 'encerrada'];
const TAMANHO_MAX_ANEXO = 25 * 1024 * 1024; // 25MB

// usuario.tipo -> remetente_enum ('paciente' | 'ia' | 'voluntario')
function mapTipoParaRemetente(tipo) {
  const t = (tipo || '').toLowerCase();
  if (t === 'fonoaudiologo' || t === 'estagiario') return 'voluntario';
  if (t === 'ia') return 'ia';
  return 'paciente';
}

// Só o paciente dono do chamado, o voluntário que assumiu, ou um admin
// podem ver/mexer numa sessão — nunca um terceiro que só saiba o UUID.
// Exportada porque a rota de WebSocket (chatWs.js) faz a mesma checagem
// fora do hook de autenticação HTTP normal.
export function ehParticipanteOuAdmin(usuario, sessao) {
  return usuario.tipo === 'admin'
    || usuario.id === sessao.paciente_id
    || usuario.id === sessao.voluntario_id;
}

export async function buscarSessaoBasica(id) {
  const result = await pool.query(
    'SELECT id, paciente_id, voluntario_id, status FROM sessao WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

// Query base para listagens (fila do fono / auditoria do admin)
const SELECT_LISTAGEM = `
  SELECT
    s.id,
    s.status,
    s.iniciado_por,
    s.voluntario_id,
    s.criado_em,
    up.nome AS paciente_nome,
    uv.nome AS voluntario_nome,
    (
      SELECT m.conteudo FROM mensagem m
      WHERE m.sessao_id = s.id
      ORDER BY m.enviado_em ASC
      LIMIT 1
    ) AS mensagem_inicial,
    (
      SELECT m.remetente FROM mensagem m
      WHERE m.sessao_id = s.id
      ORDER BY m.enviado_em DESC
      LIMIT 1
    ) AS ultima_mensagem_remetente,
    (
      SELECT m.enviado_em FROM mensagem m
      WHERE m.sessao_id = s.id
      ORDER BY m.enviado_em DESC
      LIMIT 1
    ) AS ultima_mensagem_em,
    -- Notificação do fono só some quando ele de fato ABRE o chat (marca como
    -- lida) — não quando só responde. Ver item "marcar-lidas".
    EXISTS (
      SELECT 1 FROM mensagem m
      WHERE m.sessao_id = s.id AND m.remetente = 'paciente' AND m.lido_em IS NULL
    ) AS tem_resposta_nao_lida
  FROM sessao s
  JOIN usuario up ON up.id = s.paciente_id
  LEFT JOIN usuario uv ON uv.id = s.voluntario_id
`;

export async function atendimentosRoutes(server, options) {
  // Toda rota deste arquivo exige um token válido; checagens de dono/perfil
  // específicas de cada rota vêm depois disso.
  server.addHook('preHandler', verificarToken);

  // 1. CRIAR CHAMADO (paciente abre uma solicitação)
  server.post('/api/atendimentos', { preHandler: exigirTipos('paciente') }, async (request, reply) => {
    const { mensagem, iniciado_por } = request.body || {};
    const paciente_id = request.usuario.id;

    if (!mensagem || !iniciado_por) {
      return reply.status(400).send({ error: 'mensagem e iniciado_por são obrigatórios.' });
    }

    if (!['ia', 'voluntario'].includes(iniciado_por)) {
      return reply.status(400).send({ error: 'iniciado_por deve ser "ia" ou "voluntario".' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const statusInicial = iniciado_por === 'voluntario' ? 'aguardando_voluntario' : 'com_ia';

      const resSessao = await client.query(
        `INSERT INTO sessao (paciente_id, iniciado_por, status)
         VALUES ($1, $2, $3)
         RETURNING id, paciente_id, voluntario_id, iniciado_por, status, criado_em`,
        [paciente_id, iniciado_por, statusInicial]
      );
      const sessao = resSessao.rows[0];

      await client.query(
        `INSERT INTO mensagem (sessao_id, remetente, conteudo)
         VALUES ($1, 'paciente', $2)`,
        [sessao.id, mensagem]
      );

      await client.query('COMMIT');
      return reply.status(201).send(sessao);
    } catch (error) {
      await client.query('ROLLBACK');
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao criar solicitação de atendimento.' });
    } finally {
      client.release();
    }
  });

  // 2. LISTAR CHAMADOS DE UM PACIENTE (só os do próprio paciente, ou admin)
  server.get('/api/atendimentos/paciente/:pacienteId', async (request, reply) => {
    const { pacienteId } = request.params;

    if (request.usuario.tipo !== 'admin' && request.usuario.id !== pacienteId) {
      return reply.status(403).send({ error: 'Você só pode ver os seus próprios chamados.' });
    }

    try {
      const result = await pool.query(
        `SELECT
           s.id, s.status, s.iniciado_por, s.criado_em,
           (
             SELECT m.conteudo FROM mensagem m
             WHERE m.sessao_id = s.id
             ORDER BY m.enviado_em ASC
             LIMIT 1
           ) AS primeira_mensagem,
           (
             SELECT m.remetente FROM mensagem m
             WHERE m.sessao_id = s.id
             ORDER BY m.enviado_em DESC
             LIMIT 1
           ) AS ultima_mensagem_remetente,
           (
             SELECT m.enviado_em FROM mensagem m
             WHERE m.sessao_id = s.id
             ORDER BY m.enviado_em DESC
             LIMIT 1
           ) AS ultima_mensagem_em,
           -- Notificação do paciente só some quando ele de fato ABRE o chat
           -- (marca como lida) — não quando só responde.
           EXISTS (
             SELECT 1 FROM mensagem m
             WHERE m.sessao_id = s.id AND m.remetente = 'voluntario' AND m.lido_em IS NULL
           ) AS tem_mensagem_nao_lida
         FROM sessao s
         WHERE s.paciente_id = $1
         ORDER BY s.criado_em DESC`,
        [pacienteId]
      );
      return reply.send(result.rows);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar chamados do paciente.' });
    }
  });

  // 3. FILA DO FONOAUDIÓLOGO (chamados que pediram atendimento humano)
  // Fono/estagiário vê: a fila de espera compartilhada + os PRÓPRIOS
  // atendimentos (em andamento ou já encerrados) — nunca o histórico
  // encerrado de outro voluntário. Admin vê tudo.
  server.get('/api/atendimentos/fila', { preHandler: exigirTipos('fonoaudiologo', 'estagiario', 'admin') }, async (request, reply) => {
    try {
      const result = await pool.query(
        `${SELECT_LISTAGEM}
         WHERE s.iniciado_por = 'voluntario'
           AND ($1 = 'admin' OR s.status = 'aguardando_voluntario' OR s.voluntario_id = $2)
         ORDER BY s.criado_em ASC`,
        [request.usuario.tipo, request.usuario.id]
      );
      return reply.send(result.rows);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar fila de atendimentos.' });
    }
  });

  // 4. TODOS OS CHAMADOS (auditoria do admin)
  server.get('/api/atendimentos', { preHandler: exigirTipos('admin') }, async (request, reply) => {
    try {
      const result = await pool.query(
        `${SELECT_LISTAGEM}
         ORDER BY s.criado_em DESC`
      );
      return reply.send(result.rows);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar chamados.' });
    }
  });

  // 5. DETALHE DE UM CHAMADO (barra superior do chat)
  server.get('/api/atendimentos/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      const result = await pool.query(
        `SELECT
           s.id, s.status, s.iniciado_por, s.paciente_id, s.voluntario_id, s.criado_em,
           up.nome AS paciente_nome,
           uv.nome AS voluntario_nome,
           v.especialidade AS voluntario_especialidade
         FROM sessao s
         JOIN usuario up ON up.id = s.paciente_id
         LEFT JOIN usuario uv ON uv.id = s.voluntario_id
         LEFT JOIN voluntario v ON v.usuario_id = s.voluntario_id
         WHERE s.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Atendimento não encontrado.' });
      }

      const sessao = result.rows[0];
      if (!ehParticipanteOuAdmin(request.usuario, sessao)) {
        return reply.status(403).send({ error: 'Você não faz parte deste atendimento.' });
      }

      return reply.send(sessao);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar atendimento.' });
    }
  });

  // 6. ASSUMIR CHAMADO (voluntário aprovado pega da fila)
  server.patch('/api/atendimentos/:id/assumir', { preHandler: exigirTipos('fonoaudiologo', 'estagiario') }, async (request, reply) => {
    const { id } = request.params;
    const voluntario_id = request.usuario.id;

    try {
      const voluntario = await pool.query(
        'SELECT status_aprovacao FROM voluntario WHERE usuario_id = $1',
        [voluntario_id]
      );
      if (voluntario.rows[0]?.status_aprovacao !== 'aprovado') {
        return reply.status(403).send({ error: 'Seu cadastro ainda não foi aprovado pelo administrador.' });
      }

      const result = await pool.query(
        `UPDATE sessao
         SET voluntario_id = $1, status = 'com_voluntario'
         WHERE id = $2 AND status = 'aguardando_voluntario'
         RETURNING id, paciente_id, voluntario_id, iniciado_por, status, criado_em`,
        [voluntario_id, id]
      );

      if (result.rows.length === 0) {
        return reply.status(409).send({ error: 'Este chamado já foi assumido ou não está mais aguardando.' });
      }

      return reply.send(result.rows[0]);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao assumir atendimento.' });
    }
  });

  // 7. ATUALIZAR STATUS (ex: encerrar) — só participantes ou admin
  server.patch('/api/atendimentos/:id/status', async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body || {};

    if (!STATUS_VALIDOS.includes(status)) {
      return reply.status(400).send({ error: `status deve ser um dos seguintes: ${STATUS_VALIDOS.join(', ')}.` });
    }

    try {
      const sessao = await buscarSessaoBasica(id);
      if (!sessao) {
        return reply.status(404).send({ error: 'Atendimento não encontrado.' });
      }
      if (!ehParticipanteOuAdmin(request.usuario, sessao)) {
        return reply.status(403).send({ error: 'Você não faz parte deste atendimento.' });
      }

      const result = await pool.query(
        `UPDATE sessao SET status = $1 WHERE id = $2
         RETURNING id, paciente_id, voluntario_id, iniciado_por, status, criado_em`,
        [status, id]
      );

      return reply.send(result.rows[0]);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao atualizar status do atendimento.' });
    }
  });

  // 8. LISTAR MENSAGENS DE UM CHAMADO — só participantes ou admin
  server.get('/api/atendimentos/:id/mensagens', async (request, reply) => {
    const { id } = request.params;

    try {
      const sessao = await buscarSessaoBasica(id);
      if (!sessao) {
        return reply.status(404).send({ error: 'Atendimento não encontrado.' });
      }
      if (!ehParticipanteOuAdmin(request.usuario, sessao)) {
        return reply.status(403).send({ error: 'Você não faz parte deste atendimento.' });
      }

      const result = await pool.query(
        `SELECT
           m.id,
           m.remetente,
           m.tipo_conteudo,
           m.conteudo,
           m.arquivo_url,
           m.enviado_em AS criado_em,
           m.lido_em,
           CASE m.remetente
             WHEN 'paciente' THEN s.paciente_id
             WHEN 'voluntario' THEN s.voluntario_id
             ELSE NULL
           END AS remetente_id,
           CASE m.remetente
             WHEN 'paciente' THEN up.nome
             WHEN 'voluntario' THEN uv.nome
             ELSE 'Assistente Virtual'
           END AS nome_remetente
         FROM mensagem m
         JOIN sessao s ON s.id = m.sessao_id
         LEFT JOIN usuario up ON up.id = s.paciente_id
         LEFT JOIN usuario uv ON uv.id = s.voluntario_id
         WHERE m.sessao_id = $1
         ORDER BY m.enviado_em ASC`,
        [id]
      );
      return reply.send(result.rows);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar mensagens.' });
    }
  });

  // 9. ENVIAR MENSAGEM — só participantes; remetente vem do token, nunca do body
  server.post('/api/atendimentos/:id/mensagens', async (request, reply) => {
    const { id } = request.params;
    const { conteudo } = request.body || {};

    if (!conteudo || !conteudo.trim()) {
      return reply.status(400).send({ error: 'conteudo é obrigatório.' });
    }

    try {
      const sessao = await buscarSessaoBasica(id);
      if (!sessao) {
        return reply.status(404).send({ error: 'Atendimento não encontrado.' });
      }
      if (!ehParticipanteOuAdmin(request.usuario, sessao)) {
        return reply.status(403).send({ error: 'Você não faz parte deste atendimento.' });
      }
      if (sessao.status === 'encerrada') {
        return reply.status(400).send({ error: 'Este atendimento já foi encerrado.' });
      }

      const remetente = mapTipoParaRemetente(request.usuario.tipo);

      const result = await pool.query(
        `INSERT INTO mensagem (sessao_id, remetente, conteudo)
         VALUES ($1, $2, $3)
         RETURNING id, remetente, tipo_conteudo, conteudo, arquivo_url, enviado_em AS criado_em, lido_em`,
        [id, remetente, conteudo]
      );

      broadcast(id, { tipo: 'mensagem', mensagem: result.rows[0] });
      return reply.status(201).send(result.rows[0]);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao enviar mensagem.' });
    }
  });

  // 9.2 MARCAR MENSAGENS COMO LIDAS — só as que a OUTRA pessoa mandou;
  // chamado quando o participante abre/foca o chat.
  server.patch('/api/atendimentos/:id/mensagens/marcar-lidas', async (request, reply) => {
    const { id } = request.params;

    try {
      const sessao = await buscarSessaoBasica(id);
      if (!sessao) {
        return reply.status(404).send({ error: 'Atendimento não encontrado.' });
      }
      if (!ehParticipanteOuAdmin(request.usuario, sessao)) {
        return reply.status(403).send({ error: 'Você não faz parte deste atendimento.' });
      }

      const remetenteProprio = mapTipoParaRemetente(request.usuario.tipo);

      const result = await pool.query(
        `UPDATE mensagem SET lido_em = now()
         WHERE sessao_id = $1 AND remetente != $2 AND lido_em IS NULL
         RETURNING id`,
        [id, remetenteProprio]
      );

      if (result.rows.length > 0) {
        broadcast(id, { tipo: 'lido', mensagensIds: result.rows.map((r) => r.id) });
      }

      return reply.send({ marcadas: result.rows.length });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao marcar mensagens como lidas.' });
    }
  });

  // 9.1 ENVIAR ANEXO (foto ou vídeo) — mesmas regras da mensagem de texto
  server.post('/api/atendimentos/:id/anexo', async (request, reply) => {
    const { id } = request.params;

    try {
      const sessao = await buscarSessaoBasica(id);
      if (!sessao) {
        return reply.status(404).send({ error: 'Atendimento não encontrado.' });
      }
      if (!ehParticipanteOuAdmin(request.usuario, sessao)) {
        return reply.status(403).send({ error: 'Você não faz parte deste atendimento.' });
      }
      if (sessao.status === 'encerrada') {
        return reply.status(400).send({ error: 'Este atendimento já foi encerrado.' });
      }

      const arquivo = await request.file({ limits: { fileSize: TAMANHO_MAX_ANEXO } });
      if (!arquivo) {
        return reply.status(400).send({ error: 'Nenhum arquivo enviado.' });
      }

      const ehImagem = arquivo.mimetype.startsWith('image/');
      const ehVideo = arquivo.mimetype.startsWith('video/');
      if (!ehImagem && !ehVideo) {
        return reply.status(400).send({ error: 'Só é possível anexar foto ou vídeo.' });
      }

      const buffer = await arquivo.toBuffer();
      if (buffer.length > TAMANHO_MAX_ANEXO) {
        return reply.status(400).send({ error: 'Arquivo muito grande. Limite de 25MB.' });
      }

      const extensao = path.extname(arquivo.filename) || (ehImagem ? '.jpg' : '.mp4');
      const nomeArquivo = `${randomUUID()}${extensao}`;
      await writeFile(path.join(uploadsDir, nomeArquivo), buffer);

      const remetente = mapTipoParaRemetente(request.usuario.tipo);
      const tipoConteudo = ehImagem ? 'imagem' : 'video';
      const arquivoUrl = `/uploads/${nomeArquivo}`;

      const result = await pool.query(
        `INSERT INTO mensagem (sessao_id, remetente, tipo_conteudo, arquivo_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id, remetente, tipo_conteudo, conteudo, arquivo_url, enviado_em AS criado_em, lido_em`,
        [id, remetente, tipoConteudo, arquivoUrl]
      );

      broadcast(id, { tipo: 'mensagem', mensagem: result.rows[0] });
      return reply.status(201).send(result.rows[0]);
    } catch (error) {
      if (error.code === 'FST_REQ_FILE_TOO_LARGE' || error.message?.includes('File too large')) {
        return reply.status(400).send({ error: 'Arquivo muito grande. Limite de 25MB.' });
      }
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao enviar anexo.' });
    }
  });

  // 10. ENVIAR AVALIAÇÃO EXPRESSA — só o paciente dono do chamado, já encerrado
  server.post('/api/atendimentos/:id/avaliacao', async (request, reply) => {
    const { id } = request.params;
    const { nota_fono, facilidade_site, comentario } = request.body || {};

    if (!nota_fono || nota_fono < 1 || nota_fono > 5) {
      return reply.status(400).send({ error: 'nota_fono deve ser um número entre 1 e 5.' });
    }
    if (!['dificil', 'razoavel', 'facil'].includes(facilidade_site)) {
      return reply.status(400).send({ error: 'facilidade_site deve ser "dificil", "razoavel" ou "facil".' });
    }

    try {
      const sessao = await buscarSessaoBasica(id);
      if (!sessao) {
        return reply.status(404).send({ error: 'Atendimento não encontrado.' });
      }
      if (request.usuario.id !== sessao.paciente_id) {
        return reply.status(403).send({ error: 'Só o paciente do atendimento pode enviar a avaliação.' });
      }
      if (sessao.status !== 'encerrada') {
        return reply.status(400).send({ error: 'Só é possível avaliar um atendimento encerrado.' });
      }

      const result = await pool.query(
        `INSERT INTO avaliacao (sessao_id, nota_fono, facilidade_site, comentario)
         VALUES ($1, $2, $3, $4)
         RETURNING sessao_id, nota_fono, facilidade_site, comentario, criado_em`,
        [id, nota_fono, facilidade_site, comentario || null]
      );

      return reply.status(201).send(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') { // unique_violation (já existe avaliação para essa sessão)
        return reply.status(409).send({ error: 'Este atendimento já foi avaliado.' });
      }
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao salvar avaliação.' });
    }
  });

  // 11. VER A AVALIAÇÃO — admin sempre vê; paciente e voluntário só se o
  // admin já tiver "liberado". Nunca é apagada, só fica invisível pra eles.
  server.get('/api/atendimentos/:id/avaliacao', async (request, reply) => {
    const { id } = request.params;

    try {
      const sessao = await buscarSessaoBasica(id);
      if (!sessao) {
        return reply.status(404).send({ error: 'Atendimento não encontrado.' });
      }
      if (!ehParticipanteOuAdmin(request.usuario, sessao)) {
        return reply.status(403).send({ error: 'Você não faz parte deste atendimento.' });
      }

      const result = await pool.query(
        'SELECT sessao_id, nota_fono, facilidade_site, comentario, liberado, criado_em FROM avaliacao WHERE sessao_id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return reply.send(null);
      }

      const avaliacao = result.rows[0];
      if (request.usuario.tipo !== 'admin' && !avaliacao.liberado) {
        return reply.send(null); // existe, mas o admin ainda não liberou pra ele ver
      }

      return reply.send(avaliacao);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar avaliação.' });
    }
  });
}
