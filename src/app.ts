import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "./prisma";
import { getCachedLink, setCachedLink } from "./redis";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const shortenSchema = z.object({
  longUrl: z.string().url()
});

const shortenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Try again in a minute." }
});

export function generateShortCode(length = 7): string {
  return randomBytes(length).toString("base64url").slice(0, length);
}

function getIpAddress(req: express.Request): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.ip || null;
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/shorten", shortenLimiter, async (req, res) => {
  const parsed = shortenSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid URL",
      details: parsed.error.flatten()
    });
    return;
  }

  const shortCode = generateShortCode(7);
  const link = await prisma.link.create({
    data: { shortCode, longUrl: parsed.data.longUrl }
  });

  await setCachedLink(link.shortCode, { id: link.id, longUrl: link.longUrl });

  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  res.status(201).json({
    shortCode: link.shortCode,
    shortUrl: `${baseUrl}/${link.shortCode}`,
    longUrl: link.longUrl
  });
});

app.get("/links/:code/stats", async (req, res) => {
  const link = await prisma.link.findUnique({
    where: { shortCode: req.params.code },
    include: {
      clickEvents: {
        orderBy: { clickedAt: "desc" },
        take: 10
      }
    }
  });

  if (!link) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  res.json({
    shortCode: link.shortCode,
    longUrl: link.longUrl,
    createdAt: link.createdAt,
    clickCount: link.clickCount,
    recentClicks: link.clickEvents
  });
});

app.get("/:code", async (req, res) => {
  const code = req.params.code;

  let link = await getCachedLink(code);

  if (!link) {
    const dbLink = await prisma.link.findUnique({
      where: { shortCode: code },
      select: { id: true, longUrl: true, shortCode: true }
    });

    if (!dbLink) {
      res.status(404).json({ error: "Not found" });
      return;
    }

    link = { id: dbLink.id, longUrl: dbLink.longUrl };
    await setCachedLink(dbLink.shortCode, link);
  }

  await prisma.link.update({
    where: { id: link.id },
    data: { clickCount: { increment: 1 } }
  });

  await prisma.clickEvent.create({
    data: {
      linkId: link.id,
      referrer: req.get("referer") || null,
      userAgent: req.get("user-agent") || null,
      ipAddress: getIpAddress(req)
    }
  });

  res.redirect(302, link.longUrl);
});

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});
app.get("/", (_req, res) => {
  res.json({
    name: "URL Shortener API",
    endpoints: ["/health", "/shorten", "/links/:code/stats", "/:code"]
  });
});
