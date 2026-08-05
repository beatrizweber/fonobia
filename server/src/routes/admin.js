// server/src/routes/admin.js
import { pool } from '../server.js';
import { verificarToken, exigirTipos } from '../middleware/auth.js';

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

  // 3. APROVAR VOLUNTÁRIO
  server.patch('/api/admin/voluntarios/:id/aprovar', async (request, reply) => {
    const { id } = request.params;

    try {
      const result = await pool.query(
        `UPDATE voluntario SET status_aprovacao = 'aprovado' WHERE usuario_id = $1
         RETURNING usuario_id, registro_profissional, instituicao, status_aprovacao`,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Voluntário não encontrado.' });
      }

      return reply.send(result.rows[0]);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao aprovar voluntário.' });
    }
  });

  // 4. RECUSAR CADASTRO DE VOLUNTÁRIO (mantém o cadastro e o histórico, só marca como rejeitado)
  server.patch('/api/admin/voluntarios/:id/rejeitar', async (request, reply) => {
    const { id } = request.params;

    try {
      const result = await pool.query(
        `UPDATE voluntario SET status_aprovacao = 'rejeitado' WHERE usuario_id = $1
         RETURNING usuario_id, registro_profissional, instituicao, status_aprovacao`,
        [id]
      );

      if (result.rows.length === 0) {
        return reply.status(404).send({ error: 'Voluntário não encontrado.' });
      }

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

      return reply.send(result.rows[0]);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao tornar usuário administrador.' });
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
}
