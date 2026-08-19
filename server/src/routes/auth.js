import { pool } from '../server.js';
import bcrypt from 'bcryptjs';
import {
  verificarToken, exigirTipos, gerarToken,
  gerarTokenReset, verificarTokenReset,
  gerarTokenVerificacao, verificarTokenVerificacao
} from '../middleware/auth.js';
import { enviarEmailRedefinicaoSenha, enviarEmailVerificacao } from '../utils/email.js';
import { emailValido } from '../utils/validacao.js';

// Tipos que podem ser criados pelo formulário público de cadastro.
// "admin" propositalmente de fora — conta admin não se cria por aqui.
const TIPOS_CADASTRO_PUBLICO = ['paciente', 'fonoaudiologo', 'estagiario'];

export async function authRoutes(server, options) {

  // 1. ROTA DE CADASTRO
  server.post('/api/auth/register', {
    config: { rateLimit: { max: 8, timeWindow: '10 minutes' } }
  }, async (request, reply) => {
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

    if (!emailValido(email)) {
      return reply.status(400).send({ error: 'Informe um e-mail válido (ex: nome@dominio.com).' });
    }

    if (!TIPOS_CADASTRO_PUBLICO.includes(tipo.toLowerCase())) {
      return reply.status(400).send({ error: 'Tipo de cadastro inválido.' });
    }

    if (registro_profissional && registro_profissional.length > 50) {
      return reply.status(400).send({ error: 'Registro profissional deve ter no máximo 50 caracteres.' });
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
        INSERT INTO usuario (nome, email, senha_hash, tipo, email_verificado)
        VALUES ($1, $2, $3, $4, FALSE)
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

      const tokenVerificacao = gerarTokenVerificacao(novoUsuario);
      const linkVerificacao = `${process.env.FRONTEND_URL}/verificar-email?token=${tokenVerificacao}`;
      enviarEmailVerificacao(novoUsuario.email, novoUsuario.nome, linkVerificacao).catch((err) => {
        server.log.error(err, 'Falha ao enviar e-mail de verificação');
      });

      return reply.status(201).send({
        message: 'Usuário cadastrado com sucesso! Confira seu e-mail para confirmar a conta.',
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
  server.post('/api/auth/login', {
    config: { rateLimit: { max: 5, timeWindow: '10 minutes' } }
  }, async (request, reply) => {
    const { email, senha } = request.body || {};

    if (!email || !senha) {
      return reply.status(400).send({ error: 'E-mail e senha são obrigatórios.' });
    }

    try {
      const result = await pool.query(
        'SELECT id, nome, email, senha_hash, tipo, email_verificado FROM usuario WHERE email = $1',
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

      if (!usuario.email_verificado) {
        return reply.status(403).send({
          error: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada (ou spam).',
          emailNaoVerificado: true
        });
      }

      delete usuario.senha_hash;
      delete usuario.email_verificado;

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

  // 3. ESQUECI MINHA SENHA — pede o e-mail, recebe um link de redefinição
  server.post('/api/auth/esqueci-senha', async (request, reply) => {
    const { email } = request.body || {};

    if (!email) {
      return reply.status(400).send({ error: 'E-mail é obrigatório.' });
    }

    // Mensagem sempre igual, exista ou não a conta — evita que alguém use
    // esse formulário pra descobrir quais e-mails estão cadastrados.
    const respostaGenerica = {
      message: 'Se esse e-mail estiver cadastrado, enviamos um link de redefinição de senha.'
    };

    try {
      const result = await pool.query(
        'SELECT id, nome, email, senha_hash FROM usuario WHERE email = $1',
        [email]
      );

      if (result.rows.length > 0) {
        const usuario = result.rows[0];
        const token = gerarTokenReset(usuario);
        const link = `${process.env.FRONTEND_URL}/redefinir-senha?token=${token}`;

        enviarEmailRedefinicaoSenha(usuario.email, usuario.nome, link).catch((err) => {
          server.log.error(err, 'Falha ao enviar e-mail de redefinição de senha');
        });
      }

      return reply.send(respostaGenerica);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao processar a solicitação.' });
    }
  });

  // 4. REDEFINIR SENHA — recebe o token do e-mail + a nova senha
  server.post('/api/auth/redefinir-senha', async (request, reply) => {
    const { token, novaSenha } = request.body || {};

    if (!token || !novaSenha) {
      return reply.status(400).send({ error: 'Token e nova senha são obrigatórios.' });
    }

    if (novaSenha.length < 6) {
      return reply.status(400).send({ error: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    try {
      let payload;
      try {
        payload = verificarTokenReset(token);
      } catch {
        return reply.status(400).send({ error: 'Link inválido ou expirado. Peça uma nova redefinição de senha.' });
      }

      if (payload.proposito !== 'reset-senha') {
        return reply.status(400).send({ error: 'Link inválido.' });
      }

      const result = await pool.query('SELECT id, senha_hash FROM usuario WHERE id = $1', [payload.id]);
      if (result.rows.length === 0) {
        return reply.status(400).send({ error: 'Usuário não encontrado.' });
      }

      const usuario = result.rows[0];

      // Se a senha já mudou desde que o link foi gerado, o "fingerprint" não
      // bate mais — o link já foi usado (ou a senha mudou por outro meio).
      if (usuario.senha_hash.slice(0, 12) !== payload.fp) {
        return reply.status(400).send({ error: 'Este link já foi usado ou não é mais válido. Peça uma nova redefinição de senha.' });
      }

      const novaSenhaHash = await bcrypt.hash(novaSenha, 6);
      await pool.query('UPDATE usuario SET senha_hash = $1 WHERE id = $2', [novaSenhaHash, usuario.id]);

      return reply.send({ message: 'Senha redefinida com sucesso! Você já pode entrar com a nova senha.' });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao redefinir senha.' });
    }
  });

  // 5. CONFIRMAR E-MAIL — recebe o token do link enviado no cadastro
  server.post('/api/auth/verificar-email', async (request, reply) => {
    const { token } = request.body || {};

    if (!token) {
      return reply.status(400).send({ error: 'Token é obrigatório.' });
    }

    try {
      let payload;
      try {
        payload = verificarTokenVerificacao(token);
      } catch {
        return reply.status(400).send({ error: 'Link inválido ou expirado. Peça um novo e-mail de confirmação.' });
      }

      if (payload.proposito !== 'verificar-email') {
        return reply.status(400).send({ error: 'Link inválido.' });
      }

      const result = await pool.query(
        'UPDATE usuario SET email_verificado = TRUE WHERE id = $1 RETURNING id',
        [payload.id]
      );

      if (result.rows.length === 0) {
        return reply.status(400).send({ error: 'Usuário não encontrado.' });
      }

      return reply.send({ message: 'E-mail confirmado com sucesso! Você já pode entrar.' });
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao confirmar e-mail.' });
    }
  });

  // 6. REENVIAR E-MAIL DE CONFIRMAÇÃO
  server.post('/api/auth/reenviar-verificacao', {
    config: { rateLimit: { max: 5, timeWindow: '10 minutes' } }
  }, async (request, reply) => {
    const { email } = request.body || {};

    if (!email) {
      return reply.status(400).send({ error: 'E-mail é obrigatório.' });
    }

    // Mesma lógica da recuperação de senha: resposta sempre igual, exista ou
    // não a conta, pra não virar uma forma de descobrir e-mails cadastrados.
    const respostaGenerica = {
      message: 'Se esse e-mail estiver cadastrado e ainda não confirmado, reenviamos o link de confirmação.'
    };

    try {
      const result = await pool.query(
        'SELECT id, nome, email, email_verificado FROM usuario WHERE email = $1',
        [email]
      );

      if (result.rows.length > 0 && !result.rows[0].email_verificado) {
        const usuario = result.rows[0];
        const token = gerarTokenVerificacao(usuario);
        const link = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;

        enviarEmailVerificacao(usuario.email, usuario.nome, link).catch((err) => {
          server.log.error(err, 'Falha ao reenviar e-mail de verificação');
        });
      }

      return reply.send(respostaGenerica);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao processar a solicitação.' });
    }
  });

  // 7. ROTA BUSCAR TODOS OS USUÁRIOS (PAINEL ADMIN)
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