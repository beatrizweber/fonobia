// server/src/routes/perfil.js
import { pool } from '../server.js';
import { verificarToken } from '../middleware/auth.js';
import { randomUUID } from 'node:crypto';
import { emailValido } from '../utils/validacao.js';

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
          `SELECT registro_profissional, instituicao, status_aprovacao, motivo_rejeicao, disponivel, bio, especialidade
           FROM voluntario WHERE usuario_id = $1`,
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
      email,
      cartao_sus,
      data_nascimento,
      modelo_aparelho,
      lado_aparelho,
      registro_profissional,
      instituicao,
      bio,
      especialidade
    } = request.body || {};

    if (!nome || !nome.trim()) {
      return reply.status(400).send({ error: 'Nome é obrigatório.' });
    }

    if (!email || !email.trim()) {
      return reply.status(400).send({ error: 'E-mail é obrigatório.' });
    }

    if (!emailValido(email)) {
      return reply.status(400).send({ error: 'Informe um e-mail válido (ex: nome@dominio.com).' });
    }

    if (registro_profissional && registro_profissional.length > 50) {
      return reply.status(400).send({ error: 'Registro profissional deve ter no máximo 50 caracteres.' });
    }

    if (especialidade && especialidade.length > 100) {
      return reply.status(400).send({ error: 'Especialidade deve ter no máximo 100 caracteres.' });
    }

    if (bio && bio.length > 500) {
      return reply.status(400).send({ error: 'A bio deve ter no máximo 500 caracteres.' });
    }

    const client = await pool.connect();
    try {
      const emailEmUso = await client.query('SELECT id FROM usuario WHERE email = $1 AND id != $2', [email.trim(), id]);
      if (emailEmUso.rows.length > 0) {
        return reply.status(400).send({ error: 'Este e-mail já está em uso por outra conta.' });
      }

      await client.query('BEGIN');

      const resUsuario = await client.query(
        'UPDATE usuario SET nome = $1, email = $2 WHERE id = $3 RETURNING id, nome, email, tipo, criado_em',
        [nome.trim(), email.trim(), id]
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
           SET registro_profissional = $1, instituicao = $2, status_aprovacao = $3, bio = $4, especialidade = $5
           WHERE usuario_id = $6
           RETURNING registro_profissional, instituicao, status_aprovacao, bio, especialidade, disponivel`,
          [registroNovo, instituicao || null, statusFinal, bio?.trim() || null, especialidade?.trim() || null, id]
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

  // 3. LIGAR/DESLIGAR DISPONIBILIDADE — só voluntário; separado do resto do
  // perfil porque é um botão rápido (não passa pelo formulário de edição)
  server.patch('/api/perfil/disponibilidade', async (request, reply) => {
    const { id, tipo } = request.usuario;
    const { disponivel } = request.body || {};

    if (tipo !== 'fonoaudiologo' && tipo !== 'estagiario') {
      return reply.status(403).send({ error: 'Só voluntários têm disponibilidade.' });
    }
    if (typeof disponivel !== 'boolean') {
      return reply.status(400).send({ error: 'disponivel deve ser true ou false.' });
    }

    try {
      const result = await pool.query(
        'UPDATE voluntario SET disponivel = $1 WHERE usuario_id = $2 RETURNING disponivel',
        [disponivel, id]
      );
      return reply.send(result.rows[0]);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao atualizar disponibilidade.' });
    }
  });

  // 4. EXPORTAR MEUS DADOS (LGPD) — tudo que o sistema guarda sobre a
  // própria pessoa: cadastro, sessões que participou e as mensagens delas.
  server.get('/api/perfil/exportar', async (request, reply) => {
    const { id, tipo } = request.usuario;

    try {
      const resUsuario = await pool.query(
        'SELECT id, nome, email, tipo, criado_em FROM usuario WHERE id = $1',
        [id]
      );
      if (resUsuario.rows.length === 0) {
        return reply.status(404).send({ error: 'Usuário não encontrado.' });
      }
      const exportacao = { usuario: resUsuario.rows[0], geradoEm: new Date().toISOString() };

      if (tipo === 'paciente') {
        const resExtra = await pool.query(
          'SELECT cartao_sus, data_nascimento, modelo_aparelho, lado_aparelho FROM paciente WHERE usuario_id = $1',
          [id]
        );
        exportacao.dadosDePaciente = resExtra.rows[0] || null;
      } else if (tipo === 'fonoaudiologo' || tipo === 'estagiario') {
        const resExtra = await pool.query(
          `SELECT registro_profissional, instituicao, status_aprovacao, disponivel, bio, especialidade
           FROM voluntario WHERE usuario_id = $1`,
          [id]
        );
        exportacao.dadosDeVoluntario = resExtra.rows[0] || null;
      }

      const resSessoes = await pool.query(
        `SELECT id, status, iniciado_por, criado_em
         FROM sessao WHERE paciente_id = $1 OR voluntario_id = $1
         ORDER BY criado_em ASC`,
        [id]
      );

      const sessoesComMensagens = [];
      for (const sessao of resSessoes.rows) {
        const resMensagens = await pool.query(
          `SELECT remetente, tipo_conteudo, conteudo, arquivo_url, enviado_em
           FROM mensagem WHERE sessao_id = $1 ORDER BY enviado_em ASC`,
          [sessao.id]
        );
        sessoesComMensagens.push({ ...sessao, mensagens: resMensagens.rows });
      }
      exportacao.atendimentos = sessoesComMensagens;

      reply.header('Content-Disposition', `attachment; filename="meus-dados-ajudaaudio.json"`);
      return reply.send(exportacao);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao exportar seus dados.' });
    }
  });

  // 5. EXCLUIR MINHA CONTA (LGPD) — anonimiza em vez de apagar de fato: as
  // sessões/mensagens continuam existindo (fazem parte do histórico de
  // atendimento de outras pessoas), mas os dados que identificam ESSA
  // pessoa são substituídos por um placeholder, e a senha vira inutilizável.
  server.delete('/api/perfil', async (request, reply) => {
    const { id, tipo } = request.usuario;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const emailAnonimo = `removido-${randomUUID()}@deletado.local`;
      const senhaInutilizavel = randomUUID();

      await client.query(
        `UPDATE usuario SET nome = 'Usuário removido', email = $1, senha_hash = $2 WHERE id = $3`,
        [emailAnonimo, senhaInutilizavel, id]
      );

      if (tipo === 'paciente') {
        await client.query(
          `UPDATE paciente SET cartao_sus = NULL, data_nascimento = NULL, modelo_aparelho = NULL WHERE usuario_id = $1`,
          [id]
        );
      } else if (tipo === 'fonoaudiologo' || tipo === 'estagiario') {
        await client.query(
          `UPDATE voluntario
           SET registro_profissional = NULL, instituicao = NULL, bio = NULL, especialidade = NULL, disponivel = FALSE
           WHERE usuario_id = $1`,
          [id]
        );
      }

      await client.query('COMMIT');
      return reply.send({ message: 'Sua conta foi removida.' });
    } catch (error) {
      await client.query('ROLLBACK');
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao excluir a conta.' });
    } finally {
      client.release();
    }
  });
}
