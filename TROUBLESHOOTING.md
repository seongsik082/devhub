# Troubleshooting

## `npm` is not recognized

Install Node.js 20.9 or newer from the official Node.js website, then open a new terminal and run:

```bash
node --version
npm --version
```

## Prisma cannot connect

Check that `DATABASE_URL` exists in `.env` and points to a running PostgreSQL database.

## `AUTH_SECRET must be set`

Set a long random string in `.env`:

```bash
AUTH_SECRET="replace-this-with-a-long-random-string"
```

## Dashboard redirects even after login

Confirm the login request succeeded and the browser accepted the `devhub_session` cookie.
