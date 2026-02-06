import { Request, Response } from "express";
import { WebhookEvent } from "../types/wpp";
import { sendMessageWpp } from "../http/wapi";
import { chatHistoryService } from "../service/chatHistory";
import { generateAIResponse } from "../service/ai";
import { censoService } from "../service/censo";

export const handleWebhook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = req.body as WebhookEvent;
    const chatId = data.chat.id;
    const sender = data.sender.id;

    //verifica se o usuario é parte da base do censo
    const isActive = await censoService.getUserByNumber(sender);
    if (!isActive) {
      await sendMessageWpp(
        chatId,
        "Não encontrei você na base, fale com alguém do setor de RH da CAS.",
        null,
      );
      return;
    }

    const isGroup = data?.isGroup;
    // Extração do prompt
    const prompt = isGroup
      ? data.msgContent?.extendedTextMessage?.text
      : data.msgContent?.conversation;

    const messageId = data.messageId;

    if (!prompt) {
      res.status(400).json({ error: "Mensagem vazia ou formato inválido" });
      return;
    }

    // 1. Salva a mensagem do usuário imediatamente (Segurança de dados)
    await chatHistoryService.saveMessage(chatId, "user", prompt);

    // 2. Busca histórico (inclui a mensagem que acabamos de salvar)
    const fullHistory = await chatHistoryService.getHistory(
      chatId,
      isGroup ? 4 : 8,
    );

    // 3. Remove a última mensagem para não duplicar no prompt do Gemini
    // O Gemini recebe: Contexto (History slice) + Prompt Atual (sendMessage)
    const contextForGemini = fullHistory.slice(0, -1);

    console.log(
      `Contexto: ${contextForGemini.length} mensagens | Prompt: "${prompt}"`,
    );

    // 4. Gera a resposta da IA
    const aiResponse = await generateAIResponse(prompt, contextForGemini);
    console.log("Resposta da IA:", aiResponse);

    // 5. Otimização: Salva no banco e Envia no WPP em paralelo
    // O usuário recebe a resposta mais rápido sem esperar o banco gravar
    await Promise.all([
      chatHistoryService.saveMessage(chatId, "model", aiResponse),
      sendMessageWpp(chatId, aiResponse, messageId),
    ]);

    res.json({ success: true, ai_response: aiResponse });
  } catch (error) {
    console.error("Erro no webhook:", error);
    // Mesmo com erro, respondemos 200 pro WhatsApp não ficar tentando reenviar a mensagem infinitamente
    // Mas logamos o erro no servidor.
    res.status(500).json({ error: "Erro interno ao processar mensagem" });
  }
};
