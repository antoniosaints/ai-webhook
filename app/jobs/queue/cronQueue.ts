import { Queue } from "bullmq";
import { redis } from "../../service/redis";

export const rotinaQueue = new Queue("rotinas", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true, // Remove do Redis se deu sucesso (economiza memória)
    removeOnFail: 100, // Mantém os últimos 100 falhados para debug
    attempts: 3, // Tenta 3 vezes se der erro
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});

export const startRotinaQueue = async () => {
  try {
    await rotinaQueue.obliterate({ force: true });
    console.log("Fila de rotinas limpa");
    // Adiciona o novo agendamento
    await rotinaQueue.add(
      "rotina-diaria",
      {
        tipo: "notificacoes",
        criadoEm: new Date(), // Útil para debug
      },
      {
        jobId: "rotina-diaria-id", // (Opcional) Ajuda a garantir unicidade
        repeat: {
          pattern: "0 8 * * *", // Todo dia às 08:00
          tz: "America/Sao_Paulo",
        },
      },
    );

    console.log("Job de cron iniciado");
  } catch (error) {
    console.error("Erro ao iniciar a fila de rotinas:", error);
  }
};

export const listAllCronJobs = async () => {
  const [crons, jobs] = await Promise.all([
    rotinaQueue.getJobSchedulers(),
    rotinaQueue.getJobs(["waiting", "active", "delayed", "failed"]),
  ]);

  return {
    crons,
    jobs,
  };
};
