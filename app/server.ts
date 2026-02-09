import express from "express";
import dotenv from "dotenv";
import { handleWebhook } from "./controllers/webhook";
import { listAllCronJobs, startRotinaQueue } from "./jobs/queue/cronQueue";
import { updateWebhookOnReceived } from "./http/wapi";
import "./jobs/workers/cronWorker";
import { listCrons } from "./controllers/bullmq";
import { getChatHistory, getSystemStats } from "./controllers/api";
import path from "path";

// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o Express
const app = express();
app.use(express.json());

// Serve arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "../public")));

// Inicia a fila de rotinas
startRotinaQueue();
// Definição das Rotas
app.post("/webhook", handleWebhook);
app.get("/listCrons", listCrons);
app.post("/setWebhook", updateWebhookOnReceived);

// Rotas da UI
app.get("/api/history", getChatHistory);
app.get("/api/stats", getSystemStats);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook rodando na porta ${PORT}`);
  console.log(`Endpoint disponível em: http://localhost:${PORT}/webhook`);
});
