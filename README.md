# DevHub

DevHub is a staged backend practice project. The first milestone builds a deployable authentication foundation, then later milestones add boards, todos, orders, reservations, file uploads, realtime chat, analytics, and admin tools.

## Milestone 1

- Next.js App Router
- PostgreSQL schema with Prisma
- Email/password registration
- Login/logout
- HTTP-only cookie session
- Protected dashboard

## Milestone 2

- Board list and detail pages
- Authenticated post creation
- Authenticated comment creation
- Author or admin delete permissions
- Prisma relations between `User`, `Post`, and `Comment`

## Milestone 3

- User-scoped todo projects
- Todo task creation
- Status workflow: todo, in progress, done
- Status filtering
- Ownership checks for nested task mutations

## Current Add-ons

- Seoul weather widget powered by Open-Meteo
- Admin dashboard protected by `ADMIN` role
- Rule-based chat widget ready for a future LLM integration

## Local Setup

Install Node.js 20.9 or newer first. The current machine has a Node binary available to Codex, but `npm` is not on the system PATH yet.

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Set these values in `.env`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
AUTH_SECRET="use-a-long-random-string-at-least-24-characters"
```

## Deployment

The target deployment path is Vercel for the app and Neon or Supabase for PostgreSQL. See `DEPLOYMENT.md` for the full checklist.
