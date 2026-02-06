import express from "express";
import dotenv from "dotenv";
import { handleWebhook } from "./controllers/webhook";
import { startRotinaQueue } from "./jobs/queue/cronQueue";

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o Express
const app = express();
app.use(express.json());

// Inicia a fila de rotinas
startRotinaQueue();

// Definição das Rotas
app.post("/webhook", handleWebhook);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook rodando na porta ${PORT}`);
  console.log(`Endpoint disponível em: http://localhost:${PORT}/webhook`);
});
