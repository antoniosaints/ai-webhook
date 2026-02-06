import { env } from "../utils/dotenv";
import { http } from "./axios";

export const sendMessageWpp = async (
  number: string,
  message: string,
  responseTo: string | null = null,
) => {
  try {
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
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return error;
  }
};
