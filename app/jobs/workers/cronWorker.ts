import { Worker, Job } from "bullmq";
import { redis } from "../../service/redis";
import { getAniversariantesDoDia } from "../../service/functions/getAniversariantes";
import { generateAIResponse } from "../../service/ai";
import { sendMessageWpp } from "../../http/wapi";
import { env } from "../../utils/dotenv";

async function rotinaDiaria(job: Job) {
  console.log(`[ROTINA] Iniciando rotina diária | Job: ${job.id}`);

  const aniversariantes = await getAniversariantesDoDia();

  if (!aniversariantes.length) {
    console.log("[ROTINA] Nenhum aniversariante encontrado");
    return;
  }

  await Promise.all(
    aniversariantes.map(async ({ nome }) => {
      try {
        const prompt = `Crie uma mensagem curta e legal de feliz aniversário para ${nome}, 
        com no máximo 3 linhas, parabenize seu esforço na CAS também.`;
        const resposta = await generateAIResponse(prompt);

        if (!resposta) {
          console.warn(`[ROTINA] Resposta vazia da IA para ${nome}`);
          return;
        }

        await sendMessageWpp(env.GRUPO_PARABENS, resposta);
      } catch (error) {
        console.error(
          `[ROTINA] Erro ao processar aniversariante ${nome}`,
          error,
        );
      }
    }),
  );

  console.log("[ROTINA] Rotina diária finalizada");
}

const workerCron = new Worker(
  "rotinas",
  async (job) => {
    if (job.name === "rotina-diaria") {
      await rotinaDiaria(job);
    }
  },
  {
    connection: redis,
  },
);

export function pauseCronWorker() {
  workerCron.pause();
}

export function resumeCronWorker() {
  workerCron.resume();
}
