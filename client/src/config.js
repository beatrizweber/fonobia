// client/src/config.js
// URL base do backend. Em desenvolvimento cai pro localhost padrão; em
// produção (Render, etc.) vem da variável de ambiente VITE_API_URL,
// configurada no serviço do frontend — nunca hardcoded no código.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Mesma origem do backend, mas com o protocolo de WebSocket — troca
// http(s) por ws(s) automaticamente, então funciona tanto local quanto
// atrás de HTTPS em produção (senão o navegador bloqueia WS inseguro
// numa página servida por HTTPS).
export const WS_URL = API_URL.replace(/^http/, 'ws');
