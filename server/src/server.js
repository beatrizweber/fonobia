  import Fastify from 'fastify';
  import cors from '@fastify/cors';
  import dotenv from 'dotenv';
  import pg from 'pg';
  import { authRoutes } from './routes/auth.js';
  import { chatRoutes } from './routes/chat.js';
  import { atendimentosRoutes } from './routes/atendimentos.js';
  import { adminRoutes } from './routes/admin.js';
  import { perfilRoutes } from './routes/perfil.js';

  dotenv.config();

  const { Pool } = pg;

  // Exportamos o Pool configurado dinamicamente via .env
  export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
  });

  const server = Fastify();

  // Permite PATCH/POST com Content-Type: application/json e corpo vazio
  // (ex: aprovar/rejeitar voluntário, que só precisam do :id da URL)
  server.addContentTypeParser('application/json', { parseAs: 'string' }, (request, body, done) => {
    if (!body) {
      done(null, {});
      return;
    }
    try {
      done(null, JSON.parse(body));
    } catch (err) {
      err.statusCode = 400;
      done(err, undefined);
    }
  });

  await server.register(cors, {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  });

  await server.register(authRoutes);
  await server.register(chatRoutes);
  await server.register(atendimentosRoutes);
  await server.register(adminRoutes);
  await server.register(perfilRoutes);

  server.get('/api/health', async () => {
    return { status: 'OK', message: 'Backend do AjudaÁudio está no ar!' };
  });

  //Apenas para criação dos usuários admins
  server.get('/usuarios', async () => {
    return await pool.query('SELECT * FROM usuario')
  })

  server.delete('/usuarios/:id', async (request, reply) => {
    const id = request.params.id;
    const resultado = await pool.query(`DELETE FROM usuario where id = $1`, [id]);
    reply.status(200).send({message:"O usuário com o id: " + id + " foi deletado com sucesso!"});
  })
  const PORT = process.env.PORT || 3001;

  const start = async () => {
    try {
      await server.listen({ port: Number(PORT), host: '0.0.0.0' });
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  };

  start();