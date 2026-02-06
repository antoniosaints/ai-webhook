import { getDb } from "../database/db";
import { Content } from "@google/generative-ai";

export const chatHistoryService = {
  // Salva uma mensagem (do usuário ou da IA)
  saveMessage: async (
    phone: string,
    role: "user" | "model",
    content: string,
  ) => {
    const db = await getDb();
    await db.run(
      `INSERT INTO messages (phone_number, role, content) VALUES (?, ?, ?)`,
      [phone, role, content],
    );
  },

  // Busca histórico das últimas 24h formatado para o Gemini
  getHistory: async (phone: string, limit: number = 5): Promise<Content[]> => {
    const db = await getDb();

    // Deleta mensagens antigas desse número (limpeza automática on-read)
    // Opcional: Você pode mover isso para um cronjob se o banco ficar muito grande
    await db.run(
      `DELETE FROM messages WHERE phone_number = ? AND timestamp < datetime('now', '-12 hours')`,
      [phone],
    );

    // Seleciona mensagens recentes
    const rows = await db.all(
      `SELECT role, content FROM (
          SELECT role, content, timestamp 
          FROM messages 
          WHERE phone_number = ? 
          ORDER BY timestamp DESC 
          LIMIT ?
       ) AS sub
       ORDER BY timestamp ASC`,
      [phone, limit],
    );

    // Mapeia para o formato que o Gemini entende (Array de Content)
    return rows.map((row) => ({
      role: row.role,
      parts: [{ text: row.content }],
    }));
  },
};
