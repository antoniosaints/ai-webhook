import { Request, Response } from "express";
import { getDb } from "../database/db";
import { listAllCronJobs } from "../jobs/queue/cronQueue";

export const getChatHistory = async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const { phone } = req.query;

    let query = `SELECT * FROM messages ORDER BY timestamp DESC LIMIT 100`;
    let params: any[] = [];

    if (phone) {
      query = `SELECT * FROM messages WHERE phone_number = ? ORDER BY timestamp DESC LIMIT 100`;
      params = [phone];
    }

    const rows = await db.all(query, params);

    // Group messages by conversation if needed, or just return flat list
    // For now, returning flat list sorted by time
    res.json({ success: true, history: rows });
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ success: false, error: "Erro ao buscar histórico" });
  }
};

export const getSystemStats = async (req: Request, res: Response) => {
  try {
    const db = await getDb();

    // Count total messages
    const msgCount = await db.get("SELECT COUNT(*) as count FROM messages");

    // Get unique users count
    const userCount = await db.get(
      "SELECT COUNT(DISTINCT phone_number) as count FROM messages",
    );

    // Get cron jobs
    const jobs = await listAllCronJobs();

    res.json({
      success: true,
      stats: {
        totalMessages: msgCount?.count || 0,
        totalUsers: userCount?.count || 0,
        activeJobs: jobs.crons.length,
      },
      jobs,
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    res
      .status(500)
      .json({ success: false, error: "Erro ao buscar estatísticas" });
  }
};
