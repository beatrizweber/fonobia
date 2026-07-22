import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import pg from 'pg';
import { authRoutes } from './routes/auth.js';
import { chatRoutes } from './routes/chat.js';

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

await server.register(cors, {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE']
});

await server.register(authRoutes);
await server.register(chatRoutes);

server.get('/api/health', async () => {
  return { status: 'OK', message: 'Backend do AjudaÁudio está no ar!' };
});

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