import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import { connectRedis } from "./redis";

async function start(): Promise<void> {
  await connectRedis();
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
