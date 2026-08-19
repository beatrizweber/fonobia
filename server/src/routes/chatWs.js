// server/src/routes/chatWs.js
import jwt from 'jsonwebtoken';
import { buscarSessaoBasica, ehParticipanteOuAdmin } from './atendimentos.js';
import { entrar, sair, broadcast } from '../ws/salas.js';

// Registrada fora do plugin de atendimentos.js de propósito: o navegador não
// consegue mandar header Authorization no handshake de WebSocket, então a
// autenticação aqui é feita por token na querystring — não pode herdar o
// hook de verificarToken (que só olha o header) usado no resto da API.
export async function chatWsRoutes(server, options) {
  server.get('/ws/atendimentos/:id', { websocket: true }, async (socket, request) => {
    const { id } = request.params;
    const token = request.query?.token;

    let usuario;
    try {
      usuario = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      socket.close(4001, 'Token inválido ou ausente');
      return;
    }

    const sessao = await buscarSessaoBasica(id);
    if (!sessao || !ehParticipanteOuAdmin(usuario, sessao)) {
      socket.close(4003, 'Sem acesso a este atendimento');
      return;
    }

    const membro = entrar(id, socket, usuario.id);

    socket.on('message', (raw) => {
      let evento;
      try {
        evento = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (evento.tipo === 'digitando') {
        broadcast(id, { tipo: 'digitando', usuarioId: usuario.id }, socket);
      }
    });

    socket.on('close', () => sair(id, membro));
  });
}
