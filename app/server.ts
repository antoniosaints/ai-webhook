import express from "express";
import dotenv from "dotenv";
import { handleWebhook } from "./controllers/webhook";
import { updateWebhookOnReceived } from "./http/wapi";
// import "./jobs/workers/cronWorker";
import { listCrons } from "./controllers/bullmq";
import {
  getChatHistory,
  getSystemStats,
  getSystemLogs,
  sendMessage,
} from "./controllers/api";
import path from "path";
import { getContratoIXC } from "./controllers/ixc";
import cors from "cors";
import { sendMessageToEficiencia } from "./controllers/sendToCas";
// Carrega variáveis de ambiente
dotenv.config();

// Inicializa o Express
const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["*"],
  }),
);
app.use(express.json());

// Serve arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "../public")));
console.log(
  "Servindo arquivos estáticos de:",
  path.join(__dirname, "../public"),
);

// Inicia a fila de rotinas
// startRotinaQueue();
// Definição das Rotas
app.post("/webhook", handleWebhook);
app.post("/sendToGroup", sendMessageToEficiencia);
app.get("/clienteIXC/:id", getContratoIXC);
app.get("/listCrons", listCrons);
app.post("/setWebhook", updateWebhookOnReceived);

// Rotas da UI
app.get("/api/history", getChatHistory);
app.get("/api/stats", getSystemStats);
app.get("/api/logs", getSystemLogs);
app.post("/api/send", sendMessage);

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Webhook rodando na porta ${PORT}`);
  console.log(`Endpoint disponível em: http://localhost:${PORT}/webhook`);
});
