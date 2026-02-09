import { Request, Response } from "express";
import { listAllCronJobs } from "../jobs/queue/cronQueue";
import { listAllEmailJobs } from "../jobs/queue/emailQueue";

export const listCrons = async (req: Request, res: Response): Promise<any> => {
  try {
    const [cronJobs, emailJobs] = await Promise.all([
      listAllCronJobs(),
      listAllEmailJobs(),
    ]);
    return res.json({ filaCron: cronJobs, filaEmail: emailJobs });
  } catch (error) {
    console.error("Erro ao listar jobs:", error);
    return res.status(500).json({ error: "Erro ao listar jobs" });
  }
};
