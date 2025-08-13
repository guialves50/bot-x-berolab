import { Router } from "express";
import { startTwitterBot } from "../service/twitter.service.ts";

const router = Router();

router.get("/run", async (req, res) => {
  await startTwitterBot();
  res.send("Mentions processed");
});

export default router;