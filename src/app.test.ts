import request from "supertest";
import { app, generateShortCode } from "./app";
import { prisma } from "./prisma";

describe("Unit: generateShortCode", () => {
  it("generates the requested length", () => {
    const code = generateShortCode(7);
    expect(code).toHaveLength(7);
  });
});

describe("Integration: URL shortener API", () => {
  beforeEach(async () => {
    await prisma.link.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("returns 400 for invalid URL", async () => {
    const res = await request(app).post("/shorten").send({ longUrl: "not-a-url" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid URL");
  });

  it("creates a short URL", async () => {
    const res = await request(app)
      .post("/shorten")
      .send({ longUrl: "https://example.com" });

    expect(res.status).toBe(201);
    expect(res.body.shortCode).toBeDefined();
    expect(res.body.longUrl).toBe("https://example.com");
  });

  it("redirects and increments click count", async () => {
    const createRes = await request(app)
      .post("/shorten")
      .send({ longUrl: "https://example.com" });

    const code = createRes.body.shortCode;

    const redirectRes = await request(app).get(`/${code}`).redirects(0);
    expect(redirectRes.status).toBe(302);
    expect(redirectRes.headers.location).toBe("https://example.com");

    const row = await prisma.link.findUnique({ where: { shortCode: code } });
    expect(row?.clickCount).toBe(1);
  });
});
