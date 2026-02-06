import { Worker, Job } from "bullmq";
import { redis } from "../../service/redis";
import { getAniversariantesDoDia } from "../../service/functions/getAniversariantes";
import { generateAIResponse } from "../../service/ai";
import { sendMessageWpp } from "../../http/wapi";

const GRUPO_WPP_ID = "120363167085811861@g.us";

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
        const prompt = `Crie uma mensagem curta e legal de feliz aniversário para ${nome}, com no máximo 2 linhas.`;
        const resposta = await generateAIResponse(prompt);

        if (!resposta) {
          console.warn(`[ROTINA] Resposta vazia da IA para ${nome}`);
          return;
        }

        await sendMessageWpp(GRUPO_WPP_ID, resposta);
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

new Worker(
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
