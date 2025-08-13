import { startMentionStream } from "../integrations/twitter.client.ts";
import type { Tweet } from "../integrations/twitter.client.ts";

const API_URL = process.env.FEEDBACK_API_URL || "";

export async function startTwitterBot() {
  console.log("Iniciando bot do Twitter...");

  await startMentionStream(async (tweet: Tweet) => {
    const textoLimpo = tweet.text.replace(/@\w+/g, "").trim();

    console.log(`Novo tweet detectado: ${textoLimpo}`);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ text: textoLimpo, user: tweet.author_id }),
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeout);
      console.log(`Enviado para API: ${textoLimpo}`);
    } catch (err) {
      console.error("Erro no POST:", err);
    }
  });
}