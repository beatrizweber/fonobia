// server/src/routes/estatisticas.js
import { pool } from '../server.js';

// Números públicos de impacto — nenhum dado sensível, só agregados.
// Sem autenticação de propósito: é pra reforçar a proposta social do
// projeto pra qualquer visitante do site.
export async function estatisticasRoutes(server, options) {
  server.get('/api/estatisticas', async (request, reply) => {
    try {
      const [totalAtendimentos, voluntariosAtivos, satisfacao, disponiveisAgora] = await Promise.all([
        pool.query(`SELECT COUNT(*)::int AS total FROM sessao WHERE iniciado_por = 'voluntario'`),
        pool.query(`SELECT COUNT(*)::int AS total FROM voluntario WHERE status_aprovacao = 'aprovado'`),
        pool.query(`SELECT ROUND(AVG(nota_fono)::numeric, 1) AS media FROM avaliacao`),
        pool.query(`SELECT COUNT(*)::int AS total FROM voluntario WHERE status_aprovacao = 'aprovado' AND disponivel = TRUE`),
      ]);

      return reply.send({
        totalAtendimentos: totalAtendimentos.rows[0].total,
        voluntariosAtivos: voluntariosAtivos.rows[0].total,
        satisfacaoMedia: satisfacao.rows[0].media ? Number(satisfacao.rows[0].media).toFixed(1) : '0.0',
        voluntariosDisponiveisAgora: disponiveisAgora.rows[0].total,
      });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar estatísticas.' });
    }
  });

  // Série temporal pública — mesma lógica do painel admin, mas só com
  // agregados (sem nenhum dado individual), pra alimentar o gráfico da
  // página de Impacto sem exigir login.
  server.get('/api/estatisticas/serie', async (request, reply) => {
    const dias = Math.min(Math.max(Number(request.query?.dias) || 30, 7), 90);

    try {
      const result = await pool.query(
        `SELECT d::date AS dia, COUNT(s.id)::int AS total
         FROM generate_series(CURRENT_DATE - ($1 - 1) * INTERVAL '1 day', CURRENT_DATE, INTERVAL '1 day') AS d
         LEFT JOIN sessao s ON s.criado_em::date = d::date AND s.iniciado_por = 'voluntario'
         GROUP BY d ORDER BY d`,
        [dias]
      );

      return reply.send(result.rows.map((linha) => ({ dia: linha.dia, atendimentos: linha.total })));
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar série de estatísticas.' });
    }
  });
}
