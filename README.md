# Frill-Ersatz — Feedback Hub

Internal Frill.co replacement: Feature Requests + Voting + Roadmap + Changelog + Bug/Feature Reports → Intercom.

## Tech Stack

| Layer     | Tech                              |
| --------- | --------------------------------- |
| Framework | Next.js 16 (App Router)           |
| Language  | TypeScript                        |
| Styling   | Tailwind CSS 4                    |
| ORM       | Prisma 7                          |
| DB        | SQLite (local), Postgres-ready    |
| Auth      | Magic Link (6-digit code)         |
| Adapter   | `@prisma/adapter-better-sqlite3`  |

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Run migrations
npx prisma migrate dev

# 3. Seed the database
npx prisma db seed

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env`:

| Variable                 | Description                                      | Default                   |
| ------------------------ | ------------------------------------------------ | ------------------------- |
| `DATABASE_URL`           | SQLite file path or Postgres URL                 | `file:./dev.db`           |
| `ADMIN_EMAILS`           | Comma-separated admin emails                     | `admin@example.com`       |
| `RESEND_API_KEY`         | Resend API key (empty = console logging)         | `""`                      |
| `EMAIL_FROM`             | Sender email for notifications                   | `noreply@example.com`     |
| `INTERCOM_WEBHOOK_URL`   | Webhook URL for report forwarding                | `""`                      |
| `INTERCOM_FORWARD_EMAIL` | Fallback email for reports                       | `""`                      |
| `APP_BASE_URL`           | Base URL for email links                         | `http://localhost:3000`   |

## Pages

| Route              | Description                                  |
| ------------------ | -------------------------------------------- |
| `/`                | Landing page with stats                      |
| `/requests`        | Feature requests list (filter, sort, search) |
| `/requests/[id]`   | Request detail with votes                    |
| `/requests/new`    | Submit new request (auth required)           |
| `/roadmap`         | Roadmap grouped by quarter                   |
| `/announcements`   | Published changelog                          |
| `/report`          | Bug/Feature report form → Intercom           |
| `/login`           | Magic link sign-in                           |
| `/admin`           | Admin dashboard (admin only)                 |

## Auth

- **Magic Link**: Enter email → 6-digit code → verify → session cookie
- **DEV mode**: Code is printed to the terminal console
- **Admin**: Determined by `ADMIN_EMAILS` environment variable

## Business Rules

| Rule                      | Enforcement              | HTTP Error |
| ------------------------- | ------------------------ | ---------- |
| Max 3 requests/day/user   | DB count + API check     | `429`      |
| Max 1 vote/feature/user   | DB unique constraint     | `409`      |
| Max 3 roadmap items/qtr   | DB count + API check     | `409`      |

## Seed Data

The seed script creates:
- 1 admin + 5 users
- 12 feature requests (mix of BUG/FEATURE types and statuses)
- 18 distributed votes
- 5 roadmap items (3 current quarter, 2 next)
- 4 announcements (2 published, 2 draft)

## MVP Decisions

- **Session**: Base64-encoded cookie (upgrade to `iron-session` for production)
- **Markdown**: Stored raw, rendered as plain text (upgrade with `marked` + `dompurify`)
- **Rate limiting**: Per-user via DB count (add in-memory IP limiting for production)
- **SQLite → Postgres**: Change `DATABASE_URL` and `provider` in schema
