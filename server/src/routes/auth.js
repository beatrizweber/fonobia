import { pool } from '../server.js';
import bcrypt from 'bcryptjs';

export async function authRoutes(server, options) {
  
  // ROTA DE CADASTRO
  server.post('/api/auth/register', async (request, reply) => {
    const { 
      nome, 
      email, 
      senha, 
      tipo, 
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

    const client = await pool.connect();

    try {
      // 1. Checa e-mail existente
      const checkEmail = await client.query('SELECT id FROM usuario WHERE email = $1', [email]);
      if (checkEmail.rows.length > 0) {
        client.release();
        return reply.status(400).send({ error: 'E-mail já cadastrado.' });
      }

      // 2. Hash da senha
      const senhaHash = await bcrypt.hash(senha, 6);

      // 3. Transação SQL
      await client.query('BEGIN');

      const insertUsuario = `
        INSERT INTO usuario (nome, email, senha_hash, tipo)
        VALUES ($1, $2, $3, $4)
        RETURNING id, nome, email, tipo, criado_em;
      `;
      const resUsuario = await client.query(insertUsuario, [nome, email, senhaHash, tipo]);
      const novoUsuario = resUsuario.rows[0];

      if (tipo === 'paciente') {
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
      } else if (tipo === 'fonoaudiologo' || tipo === 'estagiario') {
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

      return reply.status(201).send({
        message: 'Cadastro realizado com sucesso!',
        usuario: novoUsuario
      });

    } catch (error) {
      await client.query('ROLLBACK');
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao cadastrar no banco de dados.' });
    } finally {
      client.release();
    }
  });

  // ROTA DE LOGIN
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

      return reply.send({
        message: 'Login realizado com sucesso!',
        usuario
      });

    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro no servidor ao tentar logar.' });
    }
  });
}