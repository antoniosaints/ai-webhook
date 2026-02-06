import { Request, Response } from "express";
import { updateWebhookOnReceived } from "../http/wapi";

export const setWebhook = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      res.status(400).json({ error: "URL do webhook não fornecida" });
      return;
    }
    await updateWebhookOnReceived(url);
    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao configurar webhook:", error);
    res.status(500).json({ error: "Erro interno ao configurar webhook" });
  }
};
