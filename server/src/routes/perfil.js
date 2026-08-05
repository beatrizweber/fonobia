// server/src/routes/perfil.js
import { pool } from '../server.js';
import { verificarToken } from '../middleware/auth.js';

export async function perfilRoutes(server, options) {
  // Todas as rotas aqui só enxergam/alteram o perfil de quem está logado —
  // o :id nunca vem da URL nem do body, sempre do token verificado.
  server.addHook('preHandler', verificarToken);

  // 1. VER O PRÓPRIO PERFIL COMPLETO (inclui dados extras de paciente/voluntário)
  server.get('/api/perfil', async (request, reply) => {
    const { id, tipo } = request.usuario;

    try {
      const resUsuario = await pool.query(
        'SELECT id, nome, email, tipo, criado_em FROM usuario WHERE id = $1',
        [id]
      );

      if (resUsuario.rows.length === 0) {
        return reply.status(404).send({ error: 'Usuário não encontrado.' });
      }

      const perfil = resUsuario.rows[0];

      if (tipo === 'paciente') {
        const resExtra = await pool.query(
          'SELECT cartao_sus, data_nascimento, modelo_aparelho, lado_aparelho FROM paciente WHERE usuario_id = $1',
          [id]
        );
        Object.assign(perfil, resExtra.rows[0]);
      } else if (tipo === 'fonoaudiologo' || tipo === 'estagiario') {
        const resExtra = await pool.query(
          'SELECT registro_profissional, instituicao, status_aprovacao FROM voluntario WHERE usuario_id = $1',
          [id]
        );
        Object.assign(perfil, resExtra.rows[0]);
      }

      return reply.send(perfil);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar perfil.' });
    }
  });

  // 2. EDITAR O PRÓPRIO PERFIL
  server.patch('/api/perfil', async (request, reply) => {
    const { id, tipo } = request.usuario;
    const {
      nome,
      cartao_sus,
      data_nascimento,
      modelo_aparelho,
      lado_aparelho,
      registro_profissional,
      instituicao
    } = request.body || {};

    if (!nome || !nome.trim()) {
      return reply.status(400).send({ error: 'Nome é obrigatório.' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const resUsuario = await client.query(
        'UPDATE usuario SET nome = $1 WHERE id = $2 RETURNING id, nome, email, tipo, criado_em',
        [nome.trim(), id]
      );
      const perfil = resUsuario.rows[0];

      if (tipo === 'paciente') {
        const resExtra = await client.query(
          `UPDATE paciente
           SET cartao_sus = $1, data_nascimento = $2, modelo_aparelho = $3, lado_aparelho = $4
           WHERE usuario_id = $5
           RETURNING cartao_sus, data_nascimento, modelo_aparelho, lado_aparelho`,
          [cartao_sus || null, data_nascimento || null, modelo_aparelho || null, lado_aparelho || 'bilateral', id]
        );
        Object.assign(perfil, resExtra.rows[0]);
      } else if (tipo === 'fonoaudiologo' || tipo === 'estagiario') {
        // O registro profissional credencia o voluntário a atender pacientes de
        // verdade. Se ele já estava aprovado e mudou esse número, volta pra
        // "pendente" — evita alguém ficar trocando o CRFa livremente sem
        // o admin rever de novo.
        const atual = await client.query(
          'SELECT registro_profissional, status_aprovacao FROM voluntario WHERE usuario_id = $1',
          [id]
        );
        const registroNovo = registro_profissional || null;
        const registroMudou = atual.rows[0]?.registro_profissional !== registroNovo;
        const precisaReaprovacao = registroMudou && atual.rows[0]?.status_aprovacao === 'aprovado';
        const statusFinal = precisaReaprovacao ? 'pendente' : atual.rows[0]?.status_aprovacao;

        const resExtra = await client.query(
          `UPDATE voluntario
           SET registro_profissional = $1, instituicao = $2, status_aprovacao = $3
           WHERE usuario_id = $4
           RETURNING registro_profissional, instituicao, status_aprovacao`,
          [registroNovo, instituicao || null, statusFinal, id]
        );
        Object.assign(perfil, resExtra.rows[0]);
        perfil.reaprovacaoNecessaria = precisaReaprovacao;
      }

      await client.query('COMMIT');
      return reply.send(perfil);
    } catch (error) {
      await client.query('ROLLBACK');
      if (error.code === '23505') {
        return reply.status(400).send({ error: 'Este número de cartão SUS já está cadastrado para outro paciente.' });
      }
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao atualizar perfil.' });
    } finally {
      client.release();
    }
  });
}
