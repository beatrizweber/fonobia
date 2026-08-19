// server/src/utils/logAdmin.js
import { pool } from '../server.js';

// Registra uma ação administrativa de maior impacto — não é log de sistema
// (erros, requests), é rastro de responsabilidade: quem fez o quê e quando.
// Nunca lança erro pra fora: uma falha ao registrar o log não pode derrubar
// a ação principal que já foi concluída com sucesso.
export async function registrarLog(adminId, acao, alvoTipo, alvoId, detalhes) {
  try {
    await pool.query(
      `INSERT INTO log_admin (admin_id, acao, alvo_tipo, alvo_id, detalhes)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, acao, alvoTipo, alvoId != null ? String(alvoId) : null, detalhes || null]
    );
  } catch (err) {
    console.error('Falha ao registrar log de auditoria:', err);
  }
}
