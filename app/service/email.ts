import nodemailer from "nodemailer";

export const smtpPrincipal = nodemailer.createTransport({
  host: "mail.seudominio.com.br",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
