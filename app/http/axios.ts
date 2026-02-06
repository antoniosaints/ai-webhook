import axios from "axios";
import { env } from "../utils/dotenv";

export const http = axios.create({
  baseURL: "https://api.w-api.app/v1/",
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
    "User-Agent": "PostmanRuntime/7.51.1",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    Authorization: `Bearer ${env.WAPI_KEY}`,
  },
});
