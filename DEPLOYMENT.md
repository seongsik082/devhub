# Deployment

## 1. Prepare GitHub

Create a GitHub repository and push this project.

```bash
git add .
git commit -m "Initial DevHub auth milestone"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/devhub.git
git push -u origin main
```

## 2. Prepare PostgreSQL

Use one of these hosted PostgreSQL providers:

- Neon
- Supabase
- Railway

Create a database and copy the production connection string.

## 3. Create Vercel Project

1. Go to Vercel.
2. Import the GitHub repository.
3. Select Next.js as the framework.
4. Add environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET`

## 4. Run Production Migration

For a real production database, migrations should be run intentionally.

```bash
npm run prisma:migrate
```

When the migration files exist, CI/CD should use:

```bash
npx prisma migrate deploy
```

For this learning project, migrations were applied from the local machine with:

```bash
prisma migrate dev --name init
prisma migrate dev --name add_posts_comments
```

## 5. Deploy

With Vercel Git integration, pushing to `main` deploys production automatically.

CLI alternative:

```bash
npm install -g vercel
vercel
vercel --prod
```

## 6. Verify

- Open the Vercel URL.
- Register a new account.
- Confirm that `/dashboard` opens after login.
- Log out and confirm `/dashboard` redirects to `/login`.
