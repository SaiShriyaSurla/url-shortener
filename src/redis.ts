import { createClient, type RedisClientType } from "redis";

type CachedLink = { id: string; longUrl: string };

let client: RedisClientType | null = null;
let initialized = false;

function getRedisUrl(): string {
  return process.env.REDIS_URL || "redis://localhost:6379";
}

export async function connectRedis(): Promise<void> {
  if (initialized) return;
  initialized = true;

  try {
    client = createClient({ url: getRedisUrl() });
    client.on("error", (err) => {
      console.error("Redis error:", err.message);
    });
    await client.connect();
    console.log("Redis connected");
  } catch (err) {
    console.error("Redis unavailable, continuing without cache");
    client = null;
  }
}

export async function getCachedLink(code: string): Promise<CachedLink | null> {
  if (!client) return null;
  try {
    const raw = await client.get(`link:${code}`);
    if (!raw) return null;
    return JSON.parse(raw) as CachedLink;
  } catch {
    return null;
  }
}

export async function setCachedLink(code: string, value: CachedLink): Promise<void> {
  if (!client) return;
  const ttl = Number(process.env.CACHE_TTL_SECONDS || "3600");
  try {
    await client.setEx(`link:${code}`, ttl, JSON.stringify(value));
  } catch {
    // no-op
  }
}
