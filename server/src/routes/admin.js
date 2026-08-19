// server/src/routes/admin.js
import { pool, uploadsDir } from '../server.js';
import { verificarToken, exigirTipos } from '../middleware/auth.js';
import { registrarLog } from '../utils/logAdmin.js';
import { readdir, unlink } from 'node:fs/promises';
import path from 'node:path';

export async function adminRoutes(server, options) {
  // Todas as rotas deste arquivo exigem token válido de um usuário admin.
  // (hooks ficam restritos a este plugin — não vazam pras outras rotas)
  server.addHook('preHandler', verificarToken);
  server.addHook('preHandler', exigirTipos('admin'));

  // 1. VOLUNTÁRIOS AGUARDANDO APROVAÇÃO DE CADASTRO (CRFa)
  server.get('/api/admin/voluntarios/pendentes', async (request, reply) => {
    try {
      const result = await pool.query(
        `SELECT
           u.id, u.nome, u.email, u.tipo, u.criado_em,
           v.registro_profissional AS crfa,
           v.instituicao,
           v.status_aprovacao
         FROM voluntario v
         JOIN usuario u ON u.id = v.usuario_id
         WHERE v.status_aprovacao = 'pendente'
         ORDER BY u.criado_em ASC`
      );
      return reply.send(result.rows);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar voluntários pendentes.' });
    }
  });

  // 2. LISTAR TODOS OS VOLUNTÁRIOS (qualquer status) — auditoria/histórico completo
  server.get('/api/admin/voluntarios', async (request, reply) => {
    try {
      const result = await pool.query(
        `SELECT
           u.id, u.nome, u.email, u.tipo, u.criado_em,
           v.registro_profissional AS crfa,
           v.instituicao,
           v.status_aprovacao
         FROM voluntario v
         JOIN usuario u ON u.id = v.usuario_id
         ORDER BY u.criado_em DESC`
      );
      return reply.send(result.rows);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar voluntários.' });
    }
  });

  // 3. APROVAR VOLUNTÁRIO — limpa o motivo de uma rejeição anterior, se houver
  server.patch('/api/admin/voluntarios/:id/aprovar', async (request, reply) => {
    const { id } = request.params;

    try {
      const result = await pool.query(
        `UPDATE voluntario SET status_aprovacao = 'aprovado', motivo_rejeicao = NULL WHERE usuario_id = $1
         RETURNING usuario_id, registro_profissional, instituicao, status_aprovacao`,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Voluntário não encontrado.' });
      }

      registrarLog(request.usuario.id, 'aprovar_voluntario', 'voluntario', id);
      return reply.send(result.rows[0]);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao aprovar voluntário.' });
    }
  });

  // 4. RECUSAR CADASTRO DE VOLUNTÁRIO (mantém o cadastro e o histórico, só
  // marca como rejeitado) — motivo é obrigatório, pra pessoa entender o porquê
  server.patch('/api/admin/voluntarios/:id/rejeitar', async (request, reply) => {
    const { id } = request.params;
    const { motivo } = request.body || {};

    if (!motivo || !motivo.trim()) {
      return reply.status(400).send({ error: 'Informe o motivo da recusa.' });
    }

    try {
      const result = await pool.query(
        `UPDATE voluntario SET status_aprovacao = 'rejeitado', motivo_rejeicao = $1 WHERE usuario_id = $2
         RETURNING usuario_id, registro_profissional, instituicao, status_aprovacao, motivo_rejeicao`,
        [motivo.trim(), id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Voluntário não encontrado.' });
      }

      registrarLog(request.usuario.id, 'rejeitar_voluntario', 'voluntario', id, motivo.trim());
      return reply.send(result.rows[0]);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao recusar voluntário.' });
    }
  });

  // 5. TORNAR UM USUÁRIO EXISTENTE EM ADMIN
  server.patch('/api/admin/usuarios/:id/tornar-admin', async (request, reply) => {
    const { id } = request.params;

    try {
      const result = await pool.query(
        `UPDATE usuario SET tipo = 'admin' WHERE id = $1
         RETURNING id, nome, email, tipo, criado_em`,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Usuário não encontrado.' });
      }

      registrarLog(request.usuario.id, 'tornar_admin', 'usuario', id, `${result.rows[0].nome} (${result.rows[0].email})`);
      return reply.send(result.rows[0]);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao tornar usuário administrador.' });
    }
  });

  // 7. LISTAR TODAS AS AVALIAÇÕES (liberadas ou não) — só o admin vê tudo
  server.get('/api/admin/avaliacoes', async (request, reply) => {
    try {
      const result = await pool.query(
        `SELECT
           a.sessao_id, a.nota_fono, a.facilidade_site, a.comentario, a.liberado, a.criado_em,
           up.nome AS paciente_nome,
           uv.nome AS voluntario_nome
         FROM avaliacao a
         JOIN sessao s ON s.id = a.sessao_id
         JOIN usuario up ON up.id = s.paciente_id
         LEFT JOIN usuario uv ON uv.id = s.voluntario_id
         ORDER BY a.criado_em DESC`
      );
      return reply.send(result.rows);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar avaliações.' });
    }
  });

  // 8. LIBERAR avaliação — passa a ficar visível pro paciente e pro voluntário
  server.patch('/api/admin/avaliacoes/:sessaoId/liberar', async (request, reply) => {
    const { sessaoId } = request.params;

    try {
      const result = await pool.query(
        `UPDATE avaliacao SET liberado = TRUE WHERE sessao_id = $1 RETURNING sessao_id, liberado`,
        [sessaoId]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Avaliação não encontrada.' });
      }

      registrarLog(request.usuario.id, 'liberar_avaliacao', 'sessao', sessaoId);
      return reply.send(result.rows[0]);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao liberar avaliação.' });
    }
  });

  // 9. OCULTAR avaliação de novo — nunca apaga, só esconde do paciente/voluntário
  server.patch('/api/admin/avaliacoes/:sessaoId/ocultar', async (request, reply) => {
    const { sessaoId } = request.params;

    try {
      const result = await pool.query(
        `UPDATE avaliacao SET liberado = FALSE WHERE sessao_id = $1 RETURNING sessao_id, liberado`,
        [sessaoId]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Avaliação não encontrada.' });
      }

      registrarLog(request.usuario.id, 'ocultar_avaliacao', 'sessao', sessaoId);
      return reply.send(result.rows[0]);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao ocultar avaliação.' });
    }
  });

  // 6. MÉTRICAS GERAIS DA PLATAFORMA
  server.get('/api/admin/metricas', async (request, reply) => {
    try {
      const [totalAtendimentos, voluntariosAtivos, satisfacao] = await Promise.all([
        pool.query(`SELECT COUNT(*)::int AS total FROM sessao WHERE iniciado_por = 'voluntario'`),
        pool.query(`SELECT COUNT(*)::int AS total FROM voluntario WHERE status_aprovacao = 'aprovado'`),
        pool.query(`SELECT ROUND(AVG(nota_fono)::numeric, 1) AS media FROM avaliacao`),
      ]);

      return reply.send({
        totalAtendimentos: totalAtendimentos.rows[0].total,
        voluntariosAtivos: voluntariosAtivos.rows[0].total,
        satisfacaoMedia: satisfacao.rows[0].media ? Number(satisfacao.rows[0].media).toFixed(1) : '0.0',
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar métricas da plataforma.' });
    }
  });

  // 10. SÉRIE TEMPORAL — evolução diária dos últimos N dias (gráficos do
  // dashboard). generate_series preenche os dias sem nenhum registro com
  // zero, pra não ter "buracos" no gráfico.
  server.get('/api/admin/metricas/serie', async (request, reply) => {
    const dias = Math.min(Math.max(Number(request.query?.dias) || 30, 7), 90);

    try {
      const [atendimentosPorDia, cadastrosPorDia] = await Promise.all([
        pool.query(
          `SELECT d::date AS dia, COUNT(s.id)::int AS total
           FROM generate_series(CURRENT_DATE - ($1 - 1) * INTERVAL '1 day', CURRENT_DATE, INTERVAL '1 day') AS d
           LEFT JOIN sessao s ON s.criado_em::date = d::date AND s.iniciado_por = 'voluntario'
           GROUP BY d ORDER BY d`,
          [dias]
        ),
        pool.query(
          `SELECT d::date AS dia, COUNT(u.id)::int AS total
           FROM generate_series(CURRENT_DATE - ($1 - 1) * INTERVAL '1 day', CURRENT_DATE, INTERVAL '1 day') AS d
           LEFT JOIN usuario u ON u.criado_em::date = d::date
           GROUP BY d ORDER BY d`,
          [dias]
        ),
      ]);

      const serie = atendimentosPorDia.rows.map((linha, i) => ({
        dia: linha.dia,
        atendimentos: linha.total,
        cadastros: cadastrosPorDia.rows[i].total,
      }));

      return reply.send(serie);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar série temporal de métricas.' });
    }
  });

  // 11. LOG DE AUDITORIA — últimas ações administrativas de maior impacto
  server.get('/api/admin/logs', async (request, reply) => {
    try {
      const result = await pool.query(
        `SELECT l.id, l.acao, l.alvo_tipo, l.alvo_id, l.detalhes, l.criado_em, u.nome AS admin_nome
         FROM log_admin l
         JOIN usuario u ON u.id = l.admin_id
         ORDER BY l.criado_em DESC
         LIMIT 200`
      );
      return reply.send(result.rows);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar log de auditoria.' });
    }
  });

  // 12. LIMPAR ARQUIVOS ÓRFÃOS EM /uploads — arquivos que ficaram no disco
  // sem nenhuma mensagem apontando pra eles (ex: upload cujo insert no
  // banco falhou depois do arquivo já ter sido salvo). Ação sob demanda,
  // acionada pelo admin — nada disso roda sozinho em segundo plano.
  server.post('/api/admin/manutencao/limpar-uploads', async (request, reply) => {
    try {
      const [arquivosNoDisco, referenciados] = await Promise.all([
        readdir(uploadsDir),
        pool.query(`SELECT arquivo_url FROM mensagem WHERE arquivo_url IS NOT NULL`),
      ]);

      const nomesReferenciados = new Set(
        referenciados.rows.map((r) => r.arquivo_url.split('/').pop())
      );

      const orfaos = arquivosNoDisco.filter(
        (nome) => nome !== '.gitkeep' && !nomesReferenciados.has(nome)
      );

      for (const nome of orfaos) {
        await unlink(path.join(uploadsDir, nome)).catch(() => {});
      }

      registrarLog(request.usuario.id, 'limpar_uploads_orfaos', 'sistema', null, `${orfaos.length} arquivo(s) removido(s)`);
      return reply.send({ removidos: orfaos.length, arquivos: orfaos });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao limpar arquivos órfãos.' });
    }
  });
}
