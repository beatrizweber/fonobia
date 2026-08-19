  import Fastify from 'fastify';
  import cors from '@fastify/cors';
  import multipart from '@fastify/multipart';
  import fastifyStatic from '@fastify/static';
  import rateLimit from '@fastify/rate-limit';
  import websocket from '@fastify/websocket';
  import dotenv from 'dotenv';
  import pg from 'pg';
  import path from 'node:path';
  import { fileURLToPath } from 'node:url';
  import { authRoutes } from './routes/auth.js';
  import { chatRoutes } from './routes/chat.js';
  import { atendimentosRoutes } from './routes/atendimentos.js';
  import { adminRoutes } from './routes/admin.js';
  import { perfilRoutes } from './routes/perfil.js';
  import { estatisticasRoutes } from './routes/estatisticas.js';
  import { faqRoutes } from './routes/faq.js';
  import { chatWsRoutes } from './routes/chatWs.js';

  dotenv.config();

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  export const uploadsDir = path.join(__dirname, '..', 'uploads');

  const { Pool } = pg;

  // Exportamos o Pool configurado dinamicamente via .env
  // DB_SSL=true liga SSL pro banco — quase todo Postgres hospedado (Render,
  // Supabase, Neon etc.) exige isso e recusa a conexão sem ele. Localmente
  // fica desligado por padrão porque o Postgres local geralmente não usa SSL.
  export const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  // logger ligado (só warn/error) — sem isso, erros de start (ex: porta já
  // em uso) ficam mudos e só aparece "Failed running" sem explicação nenhuma
  const server = Fastify({ logger: { level: 'warn' } });

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

  // Em desenvolvimento é comum abrir o front em mais de uma porta ao mesmo
  // tempo (ex: 5173 pra testar como admin, 5174 pra testar como outro
  // usuário) — por isso qualquer porta localhost continua liberada. Em cima
  // disso, liberamos também o(s) domínio(s) reais definidos em produção via
  // CORS_ORIGENS (lista separada por vírgula) — cai de volta pra FRONTEND_URL
  // se essa variável não existir, já que os dois representam a mesma coisa
  // ("onde o front está hospedado").
  const origensDeProducao = (process.env.CORS_ORIGENS || process.env.FRONTEND_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  await server.register(cors, {
    origin: (origin, cb) => {
      if (!origin || /^http:\/\/localhost:\d+$/.test(origin) || origensDeProducao.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error('Origem não permitida pelo CORS'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  });

  // Limite de tentativas contra força bruta — desligado por padrão (global:
  // false) e ligado só nas rotas sensíveis (login/cadastro), cada uma com
  // seu próprio limite definido na rota.
  await server.register(rateLimit, {
    global: false,
    errorResponseBuilder: (request, context) => ({
      statusCode: context.statusCode,
      error: `Muitas tentativas. Tente novamente em ${Math.ceil(context.ttl / 1000 / 60)} minuto(s).`,
    }),
  });

  // Chat em tempo real (mensagem instantânea + "digitando...") — a mesma
  // rota HTTP de sempre continua sendo a fonte da verdade (persiste no
  // banco); o WebSocket só distribui os eventos pra quem está com o chat
  // aberto naquele momento.
  await server.register(websocket);

  // Upload de anexos (foto/vídeo no chat humano) — 25MB, salvos localmente
  // em /uploads e servidos como arquivo estático em http://.../uploads/nome
  await server.register(multipart, {
    limits: { fileSize: 25 * 1024 * 1024 }
  });
  await server.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/uploads/',
  });

  await server.register(authRoutes);
  await server.register(chatRoutes);
  await server.register(atendimentosRoutes);
  await server.register(adminRoutes);
  await server.register(perfilRoutes);
  await server.register(estatisticasRoutes);
  await server.register(faqRoutes);
  await server.register(chatWsRoutes);

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