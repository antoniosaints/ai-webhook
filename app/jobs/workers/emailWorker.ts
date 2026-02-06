import { Worker } from "bullmq";
import { smtpPrincipal } from "../../service/email";

new Worker("emails", async (job) => {
  await smtpPrincipal.sendMail({
    from: '"ERP" <email@seudominio.com.br>',
    to: job.data.to,
    subject: job.data.subject,
    html: job.data.html,
  });
});
