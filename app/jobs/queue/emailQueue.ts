import { Queue } from "bullmq";
import { redis } from "../../service/redis";

export const emailQueue = new Queue("emails", {
  connection: redis,
});

export const addEmailQueue = async (data: {
  to: string;
  subject: string;
  html: string;
}) => {
  await emailQueue.add("enviar-email", data, {
    delay: 1000 * 60 * 5,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000 * 60 * 5,
    },
  });
};
