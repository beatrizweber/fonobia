// server/src/routes/faq.js
import { pool } from '../server.js';
import { verificarToken, exigirTipos } from '../middleware/auth.js';
import { registrarLog } from '../utils/logAdmin.js';

export async function faqRoutes(server, options) {
  // 1. LISTAR FAQ (público — a página /duvidas não exige login)
  server.get('/api/faq', async (request, reply) => {
    try {
      const categorias = await pool.query(
        'SELECT id, nome FROM faq_categoria ORDER BY ordem ASC, id ASC'
      );
      const itens = await pool.query(
        'SELECT id, categoria_id, titulo, descricao, resposta FROM faq_item ORDER BY ordem ASC, id ASC'
      );

      const resultado = categorias.rows.map((cat) => ({
        id: cat.id,
        category: cat.nome,
        items: itens.rows
          .filter((item) => item.categoria_id === cat.id)
          .map((item) => ({
            id: item.id,
            title: item.titulo,
            description: item.descricao,
            answer: item.resposta
          }))
      }));

      return reply.send(resultado);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao buscar perguntas frequentes.' });
    }
  });

  // A partir daqui, só admin — gestão do conteúdo do FAQ
  server.register(async function (adminFaq) {
    adminFaq.addHook('preHandler', verificarToken);
    adminFaq.addHook('preHandler', exigirTipos('admin'));

    // 2. CRIAR CATEGORIA
    adminFaq.post('/api/admin/faq/categorias', async (request, reply) => {
      const { nome } = request.body || {};
      if (!nome || !nome.trim()) {
        return reply.status(400).send({ error: 'Nome da categoria é obrigatório.' });
      }

      try {
        const ordemResult = await pool.query('SELECT COALESCE(MAX(ordem), 0) + 1 AS proxima FROM faq_categoria');
        const result = await pool.query(
          'INSERT INTO faq_categoria (nome, ordem) VALUES ($1, $2) RETURNING id, nome, ordem',
          [nome.trim(), ordemResult.rows[0].proxima]
        );
        registrarLog(request.usuario.id, 'criar_categoria_faq', 'faq_categoria', result.rows[0].id, result.rows[0].nome);
        return reply.status(201).send(result.rows[0]);
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({ error: 'Erro ao criar categoria.' });
      }
    });

    // 3. RENOMEAR CATEGORIA
    adminFaq.patch('/api/admin/faq/categorias/:id', async (request, reply) => {
      const { id } = request.params;
      const { nome } = request.body || {};
      if (!nome || !nome.trim()) {
        return reply.status(400).send({ error: 'Nome da categoria é obrigatório.' });
      }

      try {
        const result = await pool.query(
          'UPDATE faq_categoria SET nome = $1 WHERE id = $2 RETURNING id, nome, ordem',
          [nome.trim(), id]
        );
        if (result.rows.length === 0) {
          return reply.status(404).send({ error: 'Categoria não encontrada.' });
        }
        registrarLog(request.usuario.id, 'renomear_categoria_faq', 'faq_categoria', id, result.rows[0].nome);
        return reply.send(result.rows[0]);
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({ error: 'Erro ao renomear categoria.' });
      }
    });

    // 4. APAGAR CATEGORIA (apaga as perguntas dela junto — CASCADE)
    adminFaq.delete('/api/admin/faq/categorias/:id', async (request, reply) => {
      const { id } = request.params;

      try {
        const result = await pool.query('DELETE FROM faq_categoria WHERE id = $1 RETURNING id, nome', [id]);
        if (result.rows.length === 0) {
          return reply.status(404).send({ error: 'Categoria não encontrada.' });
        }
        registrarLog(request.usuario.id, 'apagar_categoria_faq', 'faq_categoria', id, result.rows[0].nome);
        return reply.send({ message: 'Categoria removida.' });
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({ error: 'Erro ao remover categoria.' });
      }
    });

    // 5. CRIAR PERGUNTA
    adminFaq.post('/api/admin/faq/itens', async (request, reply) => {
      const { categoria_id, titulo, descricao, resposta } = request.body || {};
      if (!categoria_id || !titulo?.trim() || !resposta?.trim()) {
        return reply.status(400).send({ error: 'Categoria, título e resposta são obrigatórios.' });
      }

      try {
        const ordemResult = await pool.query(
          'SELECT COALESCE(MAX(ordem), 0) + 1 AS proxima FROM faq_item WHERE categoria_id = $1',
          [categoria_id]
        );
        const result = await pool.query(
          `INSERT INTO faq_item (categoria_id, titulo, descricao, resposta, ordem)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, categoria_id, titulo, descricao, resposta, ordem`,
          [categoria_id, titulo.trim(), descricao?.trim() || null, resposta.trim(), ordemResult.rows[0].proxima]
        );
        registrarLog(request.usuario.id, 'criar_pergunta_faq', 'faq_item', result.rows[0].id, result.rows[0].titulo);
        return reply.status(201).send(result.rows[0]);
      } catch (error) {
        if (error.code === '23503') { // foreign_key_violation
          return reply.status(400).send({ error: 'Categoria inválida.' });
        }
        server.log.error(error);
        return reply.status(500).send({ error: 'Erro ao criar pergunta.' });
      }
    });

    // 6. EDITAR PERGUNTA
    adminFaq.patch('/api/admin/faq/itens/:id', async (request, reply) => {
      const { id } = request.params;
      const { titulo, descricao, resposta } = request.body || {};
      if (!titulo?.trim() || !resposta?.trim()) {
        return reply.status(400).send({ error: 'Título e resposta são obrigatórios.' });
      }

      try {
        const result = await pool.query(
          `UPDATE faq_item SET titulo = $1, descricao = $2, resposta = $3
           WHERE id = $4
           RETURNING id, categoria_id, titulo, descricao, resposta, ordem`,
          [titulo.trim(), descricao?.trim() || null, resposta.trim(), id]
        );
        if (result.rows.length === 0) {
          return reply.status(404).send({ error: 'Pergunta não encontrada.' });
        }
        registrarLog(request.usuario.id, 'editar_pergunta_faq', 'faq_item', id, result.rows[0].titulo);
        return reply.send(result.rows[0]);
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({ error: 'Erro ao editar pergunta.' });
      }
    });

    // 7. APAGAR PERGUNTA
    adminFaq.delete('/api/admin/faq/itens/:id', async (request, reply) => {
      const { id } = request.params;

      try {
        const result = await pool.query('DELETE FROM faq_item WHERE id = $1 RETURNING id, titulo', [id]);
        if (result.rows.length === 0) {
          return reply.status(404).send({ error: 'Pergunta não encontrada.' });
        }
        registrarLog(request.usuario.id, 'apagar_pergunta_faq', 'faq_item', id, result.rows[0].titulo);
        return reply.send({ message: 'Pergunta removida.' });
      } catch (error) {
        server.log.error(error);
        return reply.status(500).send({ error: 'Erro ao remover pergunta.' });
      }
    });
  });
}
