# URL Shortener (Day 1 MVP)

A backend URL shortener built with Node.js, TypeScript, Express, Prisma, and PostgreSQL.

## What’s implemented so far

- TypeScript Express server
- PostgreSQL database via Docker
- Prisma ORM + migrations
- `POST /shorten` to create short URLs
- `GET /:code` to redirect to original URL
- `GET /health` health endpoint
- Click tracking (`clickCount` increments on redirect)
- Environment-based configuration

## Tech Stack

- Node.js (v22+ recommended)
- TypeScript
- Express
- Prisma
- PostgreSQL (Docker)
- Zod (request validation)
- Helmet + CORS (basic security)

## Project Structure

```txt
.
├── docker-compose.yml
├── package.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app.ts
│   ├── index.ts
│   └── prisma.ts
├── .env
└── tsconfig.json
