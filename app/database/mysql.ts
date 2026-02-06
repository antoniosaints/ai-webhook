import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Configuração do Pool (coloque isso no seu .env depois)
const poolCenso = mysql.createPool({
  host: process.env.CENSO_MYSQL_HOST || "localhost",
  user: process.env.CENSO_MYSQL_USER || "root",
  password: process.env.CENSO_MYSQL_PASSWORD || "senha123",
  database: process.env.CENSO_MYSQL_DATABASE || "radius_db", // Exemplo de DB de provedor
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
const poolIXC = mysql.createPool({
  host: process.env.IXC_MYSQL_HOST || "localhost",
  user: process.env.IXC_MYSQL_USER || "root",
  password: process.env.IXC_MYSQL_PASSWORD || "senha123",
  database: process.env.IXC_MYSQL_DATABASE || "radius_db", // Exemplo de DB de provedor
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Função genérica para executar queries de forma segura
 */
export const runQueryCenso = async (sql: string, params: any[] = []) => {
  try {
    // O mysql2 retorna [rows, fields], pegamos apenas as linhas (rows)
    const [rows] = await poolCenso.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("Erro no MySQL:", error);
    throw new Error("Falha ao consultar banco de dados.");
  }
};
export const runQueryIXC = async (sql: string, params: any[] = []) => {
  try {
    // O mysql2 retorna [rows, fields], pegamos apenas as linhas (rows)
    const [rows] = await poolIXC.execute(sql, params);
    return rows;
  } catch (error) {
    console.error("Erro no MySQL:", error);
    throw new Error("Falha ao consultar banco de dados.");
  }
};
