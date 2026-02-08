import { Request, Response } from "express";
import { WebhookEvent } from "../types/wpp";
import { sendMessageWpp } from "../http/wapi";
import { chatHistoryService } from "../service/chatHistory";
import { generateAIResponse } from "../service/ai";
import { censoService } from "../service/censo";

export const handleWebhook = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const data = req.body as WebhookEvent;
    const chatId = data.chat.id;
    const sender = data.sender.id;
    const connectedLid = data.connectedLid;
    const isGroup = data?.isGroup;

    const messageId = data.messageId;

    // Extração do prompt
    let prompt = isGroup
      ? data.msgContent?.extendedTextMessage?.text
      : data.msgContent?.conversation;

    if (!prompt) {
      return res.status(200).json({ success: true });
    }

    if (isGroup) {
      const ctx = data.msgContent.extendedTextMessage?.contextInfo;
      if (!ctx) return;

      const isReplyToMe =
        ctx.participant === connectedLid || ctx.participant === connectedLid;

      const isMentionToMe =
        ctx.mentionedJid?.includes(connectedLid) ||
        ctx.mentionedJid?.includes(connectedLid);

      if (!isReplyToMe && !isMentionToMe) {
        return res.status(200).json({ success: true });
      }

      if (isMentionToMe && ctx.quotedMessage.conversation) {
        prompt = `mensagem respondida: ${ctx.quotedMessage.conversation}\n${prompt}`;
      }
    }

    //verifica se o usuario é parte da base do censo
    const isActive = await censoService.getUserByNumber(sender);
    if (!isActive) {
      await sendMessageWpp(
        chatId,
        "Não encontrei você na base, fale com alguém do setor de RH da CAS.",
        isGroup ? messageId : null,
      );
      return;
    }

    // 1. Salva a mensagem do usuário imediatamente (Segurança de dados)
    await chatHistoryService.saveMessage(chatId, "user", prompt);

    // 2. Busca histórico (inclui a mensagem que acabamos de salvar)
    const fullHistory = await chatHistoryService.getHistory(
      chatId,
      isGroup ? 6 : 10,
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
      sendMessageWpp(chatId, aiResponse, isGroup ? messageId : null),
    ]);

    res.status(200).json({ success: true, ai_response: aiResponse });
  } catch (error) {
    console.error("Erro no webhook:", error);
    // Mesmo com erro, respondemos 200 pro WhatsApp não ficar tentando reenviar a mensagem infinitamente
    // Mas logamos o erro no servidor.
    res.status(500).json({ error: "Erro interno ao processar mensagem" });
  }
};
