// server/src/utils/email.js
import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function enviarEmailRedefinicaoSenha(destinatario, nome, link) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1e293b;">
      <div style="background: #0d9488; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">AjudaÁudio</h1>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; padding: 24px;">
        <p>Olá, ${nome || ''}!</p>
        <p>Recebemos um pedido para redefinir a senha da sua conta no AjudaÁudio. Clique no botão abaixo para escolher uma nova senha:</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${link}" style="background: #0d9488; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; display: inline-block;">
            Redefinir minha senha
          </a>
        </div>
        <p style="font-size: 13px; color: #64748b;">Esse link é válido por 30 minutos. Se você não pediu essa redefinição, pode ignorar este e-mail com tranquilidade — sua senha continua a mesma.</p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">Se o botão não funcionar, copie e cole este endereço no navegador:<br>${link}</p>
      </div>
    </div>
  `;

  await getTransporter().sendMail({
    from: `"AjudaÁudio" <${process.env.SMTP_EMAIL}>`,
    to: destinatario,
    subject: 'Redefinição de senha — AjudaÁudio',
    html,
  });
}

export async function enviarEmailVerificacao(destinatario, nome, link) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1e293b;">
      <div style="background: #0d9488; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px;">AjudaÁudio</h1>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; padding: 24px;">
        <p>Olá, ${nome || ''}!</p>
        <p>Falta só um passo para ativar sua conta no AjudaÁudio. Clique no botão abaixo para confirmar seu e-mail:</p>
        <div style="text-align: center; margin: 28px 0;">
          <a href="${link}" style="background: #0d9488; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: bold; display: inline-block;">
            Confirmar meu e-mail
          </a>
        </div>
        <p style="font-size: 13px; color: #64748b;">Esse link é válido por 24 horas. Se você não criou uma conta no AjudaÁudio, pode ignorar este e-mail com tranquilidade.</p>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">Se o botão não funcionar, copie e cole este endereço no navegador:<br>${link}</p>
      </div>
    </div>
  `;

  await getTransporter().sendMail({
    from: `"AjudaÁudio" <${process.env.SMTP_EMAIL}>`,
    to: destinatario,
    subject: 'Confirme seu e-mail — AjudaÁudio',
    html,
  });
}
