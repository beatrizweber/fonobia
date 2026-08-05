import { pool } from '../server.js';
import bcrypt from 'bcryptjs';
import { verificarToken, exigirTipos, gerarToken } from '../middleware/auth.js';

// Tipos que podem ser criados pelo formulário público de cadastro.
// "admin" propositalmente de fora — conta admin não se cria por aqui.
const TIPOS_CADASTRO_PUBLICO = ['paciente', 'fonoaudiologo', 'estagiario'];

export async function authRoutes(server, options) {

  // 1. ROTA DE CADASTRO
  server.post('/api/auth/register', async (request, reply) => {
    const {
      nome,
      email,
      senha,
      tipo, // 'paciente', 'fonoaudiologo' ou 'estagiario'
      cartao_sus,
      data_nascimento,
      modelo_aparelho,
      lado_aparelho,
      registro_profissional,
      instituicao
    } = request.body || {};

    if (!nome || !email || !senha || !tipo) {
      return reply.status(400).send({ error: 'Nome, e-mail, senha e tipo são obrigatórios.' });
    }

    if (!TIPOS_CADASTRO_PUBLICO.includes(tipo.toLowerCase())) {
      return reply.status(400).send({ error: 'Tipo de cadastro inválido.' });
    }

    const client = await pool.connect();

    try {
      const checkEmail = await client.query('SELECT id FROM usuario WHERE email = $1', [email]);
      if (checkEmail.rows.length > 0) {
        client.release();
        return reply.status(400).send({ error: 'E-mail já cadastrado.' });
      }

      const senhaHash = await bcrypt.hash(senha, 6);
      await client.query('BEGIN');

      const insertUsuario = `
        INSERT INTO usuario (nome, email, senha_hash, tipo)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nome, email, tipo, criado_em;
      `;
      const resUsuario = await client.query(insertUsuario, [nome, email, senhaHash, tipo.toLowerCase()]);
      const novoUsuario = resUsuario.rows[0];

      if (tipo.toLowerCase() === 'paciente') {
        const insertPaciente = `
          INSERT INTO paciente (usuario_id, cartao_sus, data_nascimento, modelo_aparelho, lado_aparelho)
          VALUES ($1, $2, $3, $4, $5);
        `;
        await client.query(insertPaciente, [
          novoUsuario.id,
          cartao_sus || null,
          data_nascimento || null,
          modelo_aparelho || null,
          lado_aparelho || 'bilateral'
        ]);
      } else if (tipo.toLowerCase() === 'fonoaudiologo' || tipo.toLowerCase() === 'estagiario') {
        const insertVoluntario = `
          INSERT INTO voluntario (usuario_id, registro_profissional, instituicao)
          VALUES ($1, $2, $3);
        `;
        await client.query(insertVoluntario, [
          novoUsuario.id,
          registro_profissional || null,
          instituicao || null
        ]);
      }

      await client.query('COMMIT');
      client.release();

      return reply.status(201).send({
        message: 'Usuário cadastrado com sucesso!',
        usuario: novoUsuario
      });

    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao cadastrar usuário.' });
    }
  });

  // 2. ROTA DE LOGIN
  server.post('/api/auth/login', async (request, reply) => {
    const { email, senha } = request.body || {};

    if (!email || !senha) {
      return reply.status(400).send({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
      const result = await pool.query(
        'SELECT id, nome, email, senha_hash, tipo FROM usuario WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return reply.status(400).send({ error: 'E-mail ou senha incorretos.' });
      }

      const usuario = result.rows[0];
      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

      if (!senhaValida) {
        return reply.status(400).send({ error: 'E-mail ou senha incorretos.' });
      }

      delete usuario.senha_hash;

      const token = gerarToken(usuario);

      return reply.send({
        message: 'Login realizado com sucesso!',
        usuario,
        token
      });

    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro no servidor ao tentar logar.' });
    }
  });

  // 3. ROTA BUSCAR TODOS OS USUÁRIOS (PAINEL ADMIN)
  server.get('/api/admin/usuarios', { preHandler: [verificarToken, exigirTipos('admin')] }, async (request, reply) => {
    try {
      const result = await pool.query(
        'SELECT id, nome, email, tipo, criado_em FROM usuario ORDER BY id DESC'
      );

      return reply.send(result.rows);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar lista de usuários.' });
    }
  });
}