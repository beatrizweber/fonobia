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
