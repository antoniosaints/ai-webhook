import { Request, Response } from "express";
import { generateAIResponse } from "../service/ai";
import { sendMessageWpp } from "../http/wapi";

export const sendMessageToEficiencia = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const data = req.body;
    if (!data || !data?.to || !data?.message) {
      return res.status(400).json({
        error: "Dados inválidos, informe o destinatário e a mensagem",
      });
    }

    const messageIA = await generateAIResponse(`
            Gere uma mensagem profissional para anunciar os ganhadores do sorteio
            "Cliente Premiado" (Dê enfase que o sorteio é do CLIENTE PREMIADO), os clientes são esses: ${JSON.stringify(data.message)},
            Formate com marcadores a lista dos ganhadores, mostrando nome e ID e formate a mensagem para WhatsApp, pode usar emojis caso ache
            necessário.   
        `);

    await sendMessageWpp(data.to, messageIA);

    return res.status(200).json({ message: "Mensagem enviada com sucesso" });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
};
