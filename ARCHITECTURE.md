# Architecture

## Current Shape

DevHub starts as a single Next.js application with server-rendered pages and route handlers.

```txt
Browser
  -> Next.js pages
  -> Route handlers under /api
  -> Prisma
  -> PostgreSQL
```

## Board Flow

```txt
/posts
  -> Server Component reads latest posts

/posts/new
  -> Client form POSTs to /api/posts
  -> Route handler validates session and input
  -> Prisma creates Post

/posts/[postId]
  -> Server Component reads post and comments
  -> Client form POSTs to /api/posts/[postId]/comments
```

## Key Decisions

- Use Next.js App Router so frontend and backend routes live in one deployable app.
- Use Prisma for schema migrations and type-safe database access.
- Use lazy database client initialization in `src/lib/db.ts` so builds do not create database clients at module load time.
- Use signed HTTP-only cookies for the first authentication milestone.
- Re-check authorization in API routes even when UI elements are hidden.

## Future Modules

- Board and comments
- Todo projects
- Product, cart, and order
- Reservation slots
- URL shortener
- File uploads
- Realtime chat
- Finance dashboard
- Admin panel
