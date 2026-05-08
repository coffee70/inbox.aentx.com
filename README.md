## Aentx Inbox

Private Next.js admin app for intake submissions, with PostgreSQL + Prisma and Auth.js.

## Run with Docker Compose

This project is containerized with:
- `app`: Next.js production server
- `postgres`: PostgreSQL 16

Start everything:

```bash
cp .env.docker.example .env.docker
# edit .env.docker with your real secrets
docker compose up --build
```

App URL:
- [http://localhost:3002](http://localhost:3002)

Default local login:
- Email: `admin@aentx.com`
- Password: `changeme`

The compose setup automatically runs:
- `npm run prisma:generate`
- `prisma db push`
- `next build`
- `next start -- -H 0.0.0.0 -p 3000`

Stop containers:

```bash
docker compose down
```

Stop and remove volumes (reset local DB):

```bash
docker compose down -v
```

## Environment Notes

The `docker-compose.yml` includes development defaults. For production-like runs, replace:
- `NEXTAUTH_SECRET`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- `DATABASE_URL`
- allowed origins / CAPTCHA settings

## Run Without Docker

```bash
npm install
npm run prisma:generate
npx prisma db push
npm run dev -- --port 3002
```
