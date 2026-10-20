// server/src/routes/chat.js
import Groq from 'groq-sdk';
import jwt from 'jsonwebtoken';
import { pool } from '../server.js';
import { verificarToken, exigirTipos } from '../middleware/auth.js';

// O chat com IA funciona sem login (uso público, rápido). Se houver um token
// válido de paciente, a conversa passa a ser salva e ligada à conta dele.
function usuarioOpcional(request) {
  const authHeader = request.headers['authorization'] || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

const SYSTEM_PROMPT = `Você é a Zélia, a assistente virtual oficial do **AjudaÁudio**, uma plataforma dedicada a apoiar pacientes e usuários de aparelhos auditivos fornecidos pelo SUS.

Suas diretrizes de atendimento:
1. **Nome:** Você se chama Zélia. Na primeira mensagem de cada conversa, apresente-se como "Zélia, a assistente virtual do AjudaÁudio". Nas mensagens seguintes não precisa repetir o nome toda hora. Nunca use outro nome.
2. **Tom de voz:** Seja extremamente acolhedora, empática, clara e paciente. Lembre-se de que muitos usuários podem ser idosos.
3. **Estilo de resposta:** Use frases curtas, parágrafos bem espaçados e linguagem simples. Evite termos técnicos complexos.
4. **Foco:** Ajude em dúvidas sobre uso diário, limpeza do molde, troca de pilhas, recarga e como evitar o apito (microfonia).
5. **Encaminhamento:** Se o usuário relatar dor, tontura, perda súbita de audição ou se a dúvida persistir após o passo a passo, oriente com carinho para que ele acesse a opção de **Atendimento com Fonoaudiólogo** na plataforma ou procure o posto de saúde do SUS.`;

export async function chatRoutes(server, options) {

  server.post('/api/chat', async (request, reply) => {
    const { message, historico } = request.body || {};

    if (!message) {
      return reply.status(400).send({ error: 'A mensagem é obrigatória.' });
    }

    const usuario = usuarioOpcional(request);
    let sessaoId = null;
    let mensagensContexto = [];

    try {
      if (usuario && usuario.tipo === 'paciente') {
        // Reaproveita a conversa de IA em aberto do paciente, se existir,
        // pra manter o histórico ligado à conta dele.
        const existente = await pool.query(
          `SELECT id FROM sessao WHERE paciente_id = $1 AND iniciado_por = 'ia' ORDER BY criado_em DESC LIMIT 1`,
          [usuario.id]
        );

        if (existente.rows.length > 0) {
          sessaoId = existente.rows[0].id;
          const anteriores = await pool.query(
            `SELECT remetente, conteudo FROM mensagem WHERE sessao_id = $1 ORDER BY enviado_em ASC`,
            [sessaoId]
          );
          mensagensContexto = anteriores.rows.map((m) => ({
            role: m.remetente === 'ia' ? 'assistant' : 'user',
            content: m.conteudo,
          }));
        } else {
          const nova = await pool.query(
            `INSERT INTO sessao (paciente_id, iniciado_por, status) VALUES ($1, 'ia', 'com_ia') RETURNING id`,
            [usuario.id]
          );
          sessaoId = nova.rows[0].id;
        }

        await pool.query(
          `INSERT INTO mensagem (sessao_id, remetente, conteudo) VALUES ($1, 'paciente', $2)`,
          [sessaoId, message]
        );
      } else if (Array.isArray(historico)) {
        // Sem login: mantém contexto só com o que o próprio front já tem em tela.
        mensagensContexto = historico.slice(-10).map((m) => ({
          role: m.sender === 'ia' ? 'assistant' : 'user',
          content: m.text,
        }));
      }

      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        throw new Error('GROQ_API_KEY não configurada no arquivo .env');
      }

      const groq = new Groq({ apiKey });

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...mensagensContexto,
          { role: 'user', content: message },
        ],
        model: 'openai/gpt-oss-20b',
        temperature: 0.5,
        max_tokens: 1024,
      });

      const responseText = completion.choices[0]?.message?.content || 'Não consegui processar a resposta.';

      if (sessaoId) {
        await pool.query(
          `INSERT INTO mensagem (sessao_id, remetente, conteudo) VALUES ($1, 'ia', $2)`,
          [sessaoId, responseText]
        );
      }

      return { text: responseText };

    } catch (error) {
      console.error('❌ ERRO NA GROQ API:', error.message || error);

      return reply.status(500).send({
        error: 'Erro ao processar mensagem com a Inteligência Artificial.'
      });
    }
  });

  // Histórico da conversa de IA do paciente logado (persiste entre sessões/dispositivos)
  server.get('/api/chat/historico', { preHandler: [verificarToken, exigirTipos('paciente')] }, async (request, reply) => {
    try {
      const sessao = await pool.query(
        `SELECT id FROM sessao WHERE paciente_id = $1 AND iniciado_por = 'ia' ORDER BY criado_em DESC LIMIT 1`,
        [request.usuario.id]
      );

      if (sessao.rows.length === 0) {
        return reply.send([]);
      }

      const mensagens = await pool.query(
        `SELECT remetente, conteudo, enviado_em AS criado_em FROM mensagem WHERE sessao_id = $1 ORDER BY enviado_em ASC`,
        [sessao.rows[0].id]
      );

      return reply.send(mensagens.rows);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar histórico da conversa.' });
    }
  });
}
