// server/src/ws/salas.js
// Salas de chat em memória: uma sala por sessão de atendimento, cada uma
// com os sockets atualmente conectados. Não persiste nada — é só o "quem
// está ouvindo agora" pra distribuir eventos em tempo real (mensagem nova,
// "digitando...", "visto"). A verdade continua sempre no banco.
const salas = new Map(); // sessaoId -> Set<{ socket, usuarioId }>

export function entrar(sessaoId, socket, usuarioId) {
  if (!salas.has(sessaoId)) salas.set(sessaoId, new Set());
  const membro = { socket, usuarioId };
  salas.get(sessaoId).add(membro);
  return membro;
}

export function sair(sessaoId, membro) {
  const sala = salas.get(sessaoId);
  if (!sala) return;
  sala.delete(membro);
  if (sala.size === 0) salas.delete(sessaoId);
}

// Manda pra todo mundo na sala, exceto (opcionalmente) quem originou o evento
export function broadcast(sessaoId, payload, socketOrigem) {
  const sala = salas.get(sessaoId);
  if (!sala) return;
  const texto = JSON.stringify(payload);
  for (const { socket } of sala) {
    if (socket === socketOrigem) continue;
    if (socket.readyState === 1 /* OPEN */) socket.send(texto);
  }
}
