import dotenv from "dotenv";
import { zod } from "./zod";

dotenv.config({
  path: [".env"],
  debug: process.env.NODE_ENV === "development",
});

const envSchema = zod.object({
  GEMINI_API_KEY: zod.string().min(1, "GEMINI_API_KEY é obrigatório"),
  WAPI_KEY: zod.string().min(1, "WAPI_KEY é obrigatório"),
  INSTANCE_ID: zod.string().min(1, "INSTANCE_ID é obrigatório"),
  CENSO_MYSQL_HOST: zod.string().min(1, "CENSO_MYSQL_HOST é obrigatório"),
  CENSO_MYSQL_USER: zod.string().min(1, "CENSO_MYSQL_USER é obrigatório"),
  CENSO_MYSQL_PASSWORD: zod
    .string()
    .min(1, "CENSO_MYSQL_PASSWORD é obrigatório"),
  CENSO_MYSQL_DATABASE: zod
    .string()
    .min(1, "CENSO_MYSQL_DATABASE é obrigatório"),
  IXC_MYSQL_HOST: zod.string().min(1, "IXC_MYSQL_HOST é obrigatório"),
  IXC_MYSQL_USER: zod.string().min(1, "IXC_MYSQL_USER é obrigatório"),
  IXC_MYSQL_PASSWORD: zod.string().min(1, "IXC_MYSQL_PASSWORD é obrigatório"),
  IXC_MYSQL_DATABASE: zod.string().min(1, "IXC_MYSQL_DATABASE é obrigatório"),
  REDIS_HOST: zod.string().optional().nullable(),
  REDIS_PORT: zod.string().optional().nullable(),
  REDIS_PASS: zod.string().optional().nullable(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.issues.map((issue) => ({
    campo: issue.path.join("."),
    mensagem: issue.message,
  }));
  console.error(errors);
  process.exit(1);
}

export const env = parsed.data;
