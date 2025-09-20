import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.EMAIL_USER && process.env.EMAIL_PASS ? {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  } : undefined,
});

export async function sendMail({ to, subject, text, html }) {
  const from = process.env.EMAIL_USER;
  if (!from) throw new Error('EMAIL_USER must be set');
  return transporter.sendMail({ from, to, subject, text, html });
}

export default { sendMail };
