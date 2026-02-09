import { getDb } from "../database/db";

export const logger = {
  info: async (message: string, details?: any) => {
    await log("INFO", message, details);
  },
  warn: async (message: string, details?: any) => {
    await log("WARN", message, details);
  },
  error: async (message: string, details?: any) => {
    await log("ERROR", message, details);
  },
};

async function log(level: string, message: string, details?: any) {
  try {
    const db = await getDb();
    const detailsString = details ? JSON.stringify(details) : null;

    await db.run(
      `INSERT INTO system_logs (level, message, details) VALUES (?, ?, ?)`,
      [level, message, detailsString],
    );

    // Também loga no console para debug em tempo real
    const consoleMsg = `[${level}] ${message}`;
    if (level === "ERROR") console.error(consoleMsg, details || "");
    else if (level === "WARN") console.warn(consoleMsg, details || "");
    else console.log(consoleMsg, details || "");
  } catch (error) {
    console.error("Falha ao salvar log no banco:", error);
  }
}
