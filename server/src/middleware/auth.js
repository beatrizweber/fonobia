// server/src/middleware/auth.js
import jwt from 'jsonwebtoken';

// Verifica o token do header "Authorization: Bearer <token>" e preenche
// request.usuario com { id, tipo } — nunca confia em nada que o cliente
// declare por conta própria (body, headers customizados, etc).
export async function verificarToken(request, reply) {
  const authHeader = request.headers['authorization'] || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return reply.status(401).send({ error: 'Token de autenticação ausente.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    request.usuario = payload; // { id, tipo }
  } catch (err) {
    return reply.status(401).send({ error: 'Token inválido ou expirado. Faça login novamente.' });
  }
}

// Uso: { preHandler: [verificarToken, exigirTipos('admin')] }
export function exigirTipos(...tiposPermitidos) {
  return async function (request, reply) {
    if (!request.usuario || !tiposPermitidos.includes(request.usuario.tipo)) {
      return reply.status(403).send({ error: 'Acesso negado para este perfil.' });
    }
  };
}

export function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, tipo: usuario.tipo },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Token de redefinição de senha: de propósito, curto (30min) e sem precisar
// de tabela nova no banco. Inclui um pedaço do hash da senha ATUAL — se a
// senha já foi trocada (por esse link ou por qualquer outro meio), o pedaço
// não bate mais e o link vira automaticamente inválido (uso único de fato).
export function gerarTokenReset(usuario) {
  return jwt.sign(
    { id: usuario.id, proposito: 'reset-senha', fp: usuario.senha_hash.slice(0, 12) },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  );
}

export function verificarTokenReset(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Token de confirmação de e-mail: mais longo (24h, dá tempo da pessoa
// achar o e-mail) e sem fingerprint — confirmar duas vezes não tem
// problema nenhum, então não precisa de uso único de fato.
export function gerarTokenVerificacao(usuario) {
  return jwt.sign(
    { id: usuario.id, proposito: 'verificar-email' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verificarTokenVerificacao(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
