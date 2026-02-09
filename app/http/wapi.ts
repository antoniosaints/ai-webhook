import { env } from "../utils/dotenv";
import { http } from "./axios";

export const sendMessageWpp = async (
  number: string,
  message: string,
  responseTo: string | null = null,
) => {
  try {
    if (!message) {
      throw new Error("Mensagem vazia");
    }
    const response = await http.post(
      `message/send-text?instanceId=${env.INSTANCE_ID}`,
      {
        phone: number,
        message,
        messageId: responseTo,
        delayMessage: 1,
      },
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Erro ao enviar mensagem:",
      error?.response?.data?.message || "Erro desconhecido",
    );
    return error;
  }
};

export const updateWebhookOnReceived = async (url: string) => {
  try {
    const response = await http.put(
      `webhook/update-webhook-received?instanceId=${env.INSTANCE_ID}`,
      { value: url },
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao configurar webhook:", error);
    return error;
  }
};
