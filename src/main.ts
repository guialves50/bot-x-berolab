import express from "express"
import { config } from "dotenv"
import { connectMongoDB } from "../src/database/mongo.connection.ts"
import { startTwitterBot } from "./service/twitter.service.ts";
config()

const port = process.env.PORT || 3000
const app = express()
app.use(express.json())

async function start() {
connectMongoDB()

  // Rodar a cada 30s
  setInterval(startTwitterBot, 30000);

  app.listen(port, () => console.log(`Server rodando na porta ${port}`));
}

start();

// TODO Detectar menções/replies sobre @berolab
// TODO Extrair texto relevante
// TODO Enviar via POST para sua API
// TODO Rodar 24/7, então API precisa ser estável