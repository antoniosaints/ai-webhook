import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import dotenv from "dotenv";
import { toolsDefinitions, functionsImplementation } from "../tools";
import { env } from "../utils/dotenv";

dotenv.config();

function baseSystemPrompt() {
  return [
    "IDENTIDADE:",
    "Você é Mateus da CAS Internet, funcionário de uma empresa de telecom do Maranhão.",

    "FORMATO:",
    "Responda sempre no formato WhatsApp.",
    "Use listas com marcadores quando fizer sentido.",
    `Data atual: ${new Date().toLocaleDateString("pt-BR")}.`,

    "INTELIGÊNCIA E DECISÃO:",
    "Antes de responder, avalie se a resposta depende de dados externos.",
    "Se depender de dados, use obrigatoriamente uma tool.",
    "Nunca invente dados.",

    "CAPACIDADE TÉCNICA:",
    "Você é especialista em redes, telecom, roteadores, ONU, OLT, Wi-Fi e suporte técnico.",
  ].join(" ");
}

function definitionComportamentalSystem() {
  return [
    "TOM INFORMAL:",
    "Seja simpático, humano e levemente bem-humorado.",
    "Comentários leves sobre café são permitidos.",
    "Nunca comprometa clareza técnica por humor.",

    "POSTURA INFORMAL:",
    "Saiba o momento de brincar e descontrair",
    "Não seja repetitivo",

    "TOM PROFISSIONAL:",
    "Seja profissional, direto e educado.",
    "Não faça piadas.",
    "Priorize clareza, passo a passo e objetividade.",

    "POSTURA PROFISSIONAL:",
    "Assuma postura de técnico experiente.",
    "Explique somente o necessário.",

    "FUTEBOL:",
    "Se perguntarem o maior clube do mundo, responda: Vasco da Gama.",
    "Se o usuário disser Flamengo, zoe de forma leve e rápida e volte ao assunto principal.",
  ].join(" ");
}

function toolsPrompt() {
  return [
    "USO DE TOOLS:",
    "Sempre use tools quando o usuário pedir:",
    "- Consultas",
    "- Listagens",
    "- Status",
    "- Informações específicas ou atualizadas",

    "Se a tool não retornar dados, informe isso claramente.",
    "Jamais gere dados fictícios.",
  ].join(" ");
}

function buildSystemPrompt() {
  const parts = [
    baseSystemPrompt(),
    toolsPrompt(),
    definitionComportamentalSystem(),
  ];

  return parts.join(" ");
}

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite", // Ajuste para o modelo correto se necessário (ex: 2.0-flash ou 1.5-flash)
  systemInstruction: buildSystemPrompt(),
  tools: [{ functionDeclarations: toolsDefinitions }],
});

/**
 * Função auxiliar para garantir que o histórico comece com 'user'.
 * Se a primeira mensagem for 'model' (devido ao corte do banco de dados), ela é removida.
 */
function validateHistory(history: Content[]): Content[] {
  const cleanHistory = [...history]; // Cria uma cópia para não alterar o original

  // Remove mensagens do topo enquanto elas forem do tipo 'model'
  while (cleanHistory.length > 0 && cleanHistory[0].role === "model") {
    cleanHistory.shift();
  }

  return cleanHistory;
}

// Agora aceita 'history' como parâmetro opcional
export const generateAIResponse = async (
  prompt: string,
  history: Content[] = [],
): Promise<string> => {
  try {
    // 1. Aplica a validação no histórico antes de iniciar o chat
    const validHistory = validateHistory(history);

    // 2. Inicia o chat com o histórico higienizado
    const chat = model.startChat({
      history: validHistory,
    });

    let result = await chat.sendMessage(prompt);
    let response = result.response;
    let text = response.text();

    // Lógica de Tools (Function Calling) mantida igual
    const functionCalls = response.functionCalls();
    if (functionCalls && functionCalls.length > 0) {
      const functionResponses = await Promise.all(
        functionCalls.map(async (call) => {
          const func = functionsImplementation[call.name];
          if (func) {
            const execResult = await func(call.args);
            return {
              functionResponse: { name: call.name, response: execResult },
            };
          }
          return {
            functionResponse: { name: call.name, response: { error: "Erro" } },
          };
        }),
      );
      result = await chat.sendMessage(functionResponses);
      text = result.response.text();
    }

    return text;
  } catch (error) {
    console.error("Erro Gemini:", error);
    throw error;
  }
};
