// server/src/routes/chat.js
import { pool } from '../server.js';

export async function chatRoutes(server, options) {
  server.post('/api/chat', async (request, reply) => {
    const { message } = request.body || {};

    if (!message) {
      return reply.status(400).send({ error: 'A mensagem é obrigatória.' });
    }

    try {
      // Simulando a resposta temporária (depois integramos com a API da IA)
      const mockResponse = `Recebi sua dúvida: "${message}". Lembre-se de verificar se o aparelho está bem encaixado na orelha e limpo.`;

      return { text: mockResponse };
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao processar mensagem no servidor.' });
    }
  });
}