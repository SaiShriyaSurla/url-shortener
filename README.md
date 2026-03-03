# URL Shortener (Day 1 + Day 2)

A production-style URL shortener backend built with Node.js, TypeScript, Express, Prisma, PostgreSQL, and Redis.

## What’s implemented so far

- TypeScript Express server
- PostgreSQL database via Docker
- Prisma ORM + migrations
- `POST /shorten` to create short URLs
- `GET /:code` to redirect to original URL
- `GET /health` health endpoint
- Click tracking (`clickCount` increments on redirect)

### Day 2 additions

- Redis cache for redirect lookups (`code -> longUrl`) to reduce DB reads
- Rate limiting on `POST /shorten` to protect write path
- Click event analytics model (`ClickEvent`) with metadata:
  - `referrer`
  - `userAgent`
  - `ipAddress`
  - `clickedAt`
- `GET /links/:code/stats` endpoint for link analytics
- Graceful Redis fallback (app continues if Redis is unavailable)
- CI workflow (build + Prisma generate/migrate + tests)

## Tech Stack

- Node.js (v22+ recommended)
- TypeScript
- Express
- Prisma
- PostgreSQL (Docker)
- Redis
- Zod (request validation)
- Helmet + CORS (basic security)
- Jest + Supertest (testing)
- GitHub Actions (CI)

## Project Structure

```txt
.
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
├── package.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.ts
│   ├── app.test.ts
│   ├── index.ts
│   ├── prisma.ts
│   └── redis.ts
├── .env
└── tsconfig.json
