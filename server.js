import Fastify from 'fastify';
import { Pool } from 'pg';
import rotasUsuario from './src/routes/usuarios';

const sql = new Pool ({
    host: "localhost",
    database: "fonobia",
    user: "postgres",
    password: "senai",
});

const server = Fastify ();

server.register(rotasUsuario, { sql });

server.listen({ port: 3000});