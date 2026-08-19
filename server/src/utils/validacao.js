// server/src/utils/validacao.js

// Formato de e-mail razoável: exige @ e um domínio com pelo meno um ponto
// seguido de 2+ caracteres (rejeita "fulano@teste" ou "fulano@localhost").
// De propósito NÃO exige um sufixo específico como ".com" — e-mails
// brasileiros comuns terminam em ".com.br", ".edu.br", ".gov.br", etc.,
// e travar só em ".com" bloquearia esses casos legítimos.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function emailValido(email) {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
}
