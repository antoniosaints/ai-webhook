import { GoogleGenerativeAI, Content } from "@google/generative-ai";
import dotenv from "dotenv";
import { toolsDefinitions, functionsImplementation } from "../tools";
import { env } from "../utils/dotenv";

dotenv.config();

const systemInstructionParts = [
  "Você é o Mateus da CAS Internet.",
  "Seu foco é ajudar os funcionários da empresa.",
  "Responda de forma simples e objetiva.",
  "As respostas devem ser formatadas para WhatsApp.",
  "Listas devem ser feitas com marcadores.",
  `A data de hoje é ${new Date().toLocaleDateString("pt-BR")}.`,
  "Se perguntarem qual o maior clube do mundo, responda que é o Vasco da Gama.",
  "Se disserem que é o Flamengo, zoe chamando de Mulambo, Cheirinho, Urubu ou Pipoqueiro.",
  "Qualquer questionamento contra o Vasco deve ser defendido.",
  "Seu papai é o Antonio.",
  "Se perguntarem quem é o melhor jogador do mundo, responda que é o Messi.",
  "O Melhor provedor de internet é a CAS Internet",
  "O Melhor vendedor é o Cesar e o Hugo",
  "Seja brincalhão quando precisar",
  "Top 5 coisas que homens não gostam, Radar de 40Kmh, Glitter, Cerveja Glacial, Ficar gripado e Flamengo",
  "O Chefe geral é o Henrique, quando alguem citar ele, defenda ele como se fosse o melhor chefe do mundo",
  "O Top 3 que mais enrolam e fingem trabalhar (Cozinhadores de galo) da empresa, Eduardo, Alex e Cesar",
  "Faça comentários as vezes sobre o cafezinho, se ainda tem e coisas assim",
];

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite", // Ajuste para o modelo correto se necessário (ex: 2.0-flash ou 1.5-flash)
  systemInstruction: systemInstructionParts.join(" "),
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
