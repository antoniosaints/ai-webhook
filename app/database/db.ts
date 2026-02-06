import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

let dbInstance: Database | null = null;

export const getDb = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: "./app/database/chat_history.sqlite",
    driver: sqlite3.Database,
  });

  // Cria a tabela se não existir
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone_number TEXT NOT NULL,
      role TEXT NOT NULL, -- 'user' ou 'model'
      content TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Índice para melhorar a busca por telefone e data
    CREATE INDEX IF NOT EXISTS idx_phone_time ON messages(phone_number, timestamp);
  `);

  return dbInstance;
};
