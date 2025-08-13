import fetch from "node-fetch";
import {config} from "dotenv"
config()

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

if (!BEARER_TOKEN) {
  throw new Error("TWITTER_BEARER_TOKEN não configurado no .env");
}

export interface Tweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
}

const STREAM_URL =
  "https://api.twitter.com/2/tweets/search/stream?tweet.fields=created_at,author_id";

async function setStreamRules() {
  const res = await fetch(
    "https://api.twitter.com/2/tweets/search/stream/rules",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        add: [{ value: "@berolab -is:retweet", tag: "Mentions" }],
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Falha ao definir regras: ${res.status}`);
  }
}

export async function startMentionStream(onTweet: (tweet: Tweet) => void) {
  await setStreamRules();

  while (true) {
    try {
      console.log("Conectando ao stream do Twitter...");

      const response = await fetch(STREAM_URL, {
        headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      });

      if (!response.ok || !response.body) {
        throw new Error(`Falha no stream: ${response.status}`);
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      for await (const chunk of response.body) {
        buffer += decoder.decode(chunk as Uint8Array, { stream: true });

        let boundary = buffer.indexOf("\r\n");
        while (boundary !== -1) {
          const part = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);

          if (part) {
            try {
              const data = JSON.parse(part);
              if (data.data) {
                onTweet(data.data as Tweet);
              }
            } catch (err) {
              console.error("Erro ao processar chunk:", err);
            }
          }

          boundary = buffer.indexOf("\r\n");
        }
      }

      console.warn("Stream finalizado, reconectando em 5s...");
      await new Promise((r) => setTimeout(r, 5000));
    } catch (err) {
      console.error("Erro no stream:", err);
      console.warn("Tentando reconectar em 10s...");
      await new Promise((r) => setTimeout(r, 10000));
    }
  }
}
