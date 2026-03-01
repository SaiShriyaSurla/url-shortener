import express from "express";
import cors from "cors";
import helmet from "helmet";
import { z } from "zod";
import { randomBytes } from "crypto";
import { prisma } from "./prisma";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const shortenSchema = z.object({
  longUrl: z.string().url(),
});

function generateShortCode(length = 7): string {
  return randomBytes(length).toString("base64url").slice(0, length);
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/shorten", async (req, res) => {
  const parsed = shortenSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid URL" });
    return;
  }

  const shortCode = generateShortCode(7);
  const link = await prisma.link.create({
    data: { shortCode, longUrl: parsed.data.longUrl },
  });

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  res.status(201).json({
    shortCode: link.shortCode,
    shortUrl: `${baseUrl}/${link.shortCode}`,
    longUrl: link.longUrl,
  });
  return;
});

app.get("/:code", async (req, res) => {
  const link = await prisma.link.findUnique({
    where: { shortCode: req.params.code },
  });

  if (!link) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  await prisma.link.update({
    where: { id: link.id },
    data: { clickCount: { increment: 1 } },
  });

  res.redirect(302, link.longUrl);
  return;
});
