import { usuariosController } from "../controllers/usuariosControllers";

export default async function rotasUsuario(servidor, options) {
    
    const { sql } = options;

    server.get('/usuario', async (request, reply, sql) => {
        return usuariosController.get_u(request, reply, sql);
    });

    server.post('/usuario', async (request, reply, sql) => {
        return usuariosController.post_u(request, reply, sql);
    });

    server.put('/usuario', async (request, reply, sql) => {
        return usuariosController.put_u(request, reply, sql);
    });

    server.delete('/usuario', async (request, reply, sql) => {
        return usuariosController.delete_u (request, reply, sql);
    })
}