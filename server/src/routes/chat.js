// server/src/routes/chat.js
import Groq from 'groq-sdk';

export async function chatRoutes(server, options) {
  server.post('/api/chat', async (request, reply) => {
    const { message } = request.body || {};

    if (!message) {
      return reply.status(400).send({ error: 'A mensagem é obrigatória.' });
    }

    try {
      const apiKey = process.env.GROQ_API_KEY;

      if (!apiKey) {
        throw new Error('GROQ_API_KEY não configurada no arquivo .env');
      }

      const groq = new Groq({ apiKey });

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Você é a assistente virtual oficial do **AjudaÁudio**, uma plataforma dedicada a apoiar pacientes e usuários de aparelhos auditivos fornecidos pelo SUS.

Suas diretrizes de atendimento:
1. **Nome:** Sempre se apresente como assistente do **AjudaÁudio** (nunca use outros nomes).
2. **Tom de voz:** Seja extremamente acolhedora, empática, clara e paciente. Lembre-se de que muitos usuários podem ser idosos.
3. **Estilo de resposta:** Use frases curtas, parágrafos bem espaçados e linguagem simples. Evite termos técnicos complexos.
4. **Foco:** Ajude em dúvidas sobre uso diário, limpeza do molde, troca de pilhas, recarga e como evitar o apito (microfonia).
5. **Encaminhamento:** Se o usuário relatar dor, tontura, perda súbita de audição ou se a dúvida persistir após o passo a passo, oriente com carinho para que ele acesse a opção de **Atendimento com Fonoaudiólogo** na plataforma ou procure o posto de saúde do SUS.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.5,
        max_tokens: 1024,
      });

      const responseText = completion.choices[0]?.message?.content || 'Não consegui processar a resposta.';

      return { text: responseText };

    } catch (error) {
      console.error('❌ ERRO NA GROQ API:', error.message || error);
      
      return reply.status(500).send({ 
        error: 'Erro ao processar mensagem com a Inteligência Artificial.' 
      });
    }
  });
}