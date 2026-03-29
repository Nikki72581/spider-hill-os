# Spider Hill OS

Personal productivity and knowledge management system. Built with Next.js 14, Prisma, and Neon Postgres. Deployed on Vercel.

---

## Features

- **Dashboard** — At-a-glance stats, open tasks, writing pipeline, and recent ideas
- **Tasks** — Priority-grouped task list with inline complete toggle, categories, due dates
- **Ideas** — Capture and develop ideas with a RAW → DEVELOPING → READY status flow
- **Writing Pipeline** — Kanban board tracking articles from Idea → Outline → Drafting → Editing → Published
- **Knowledge Base** — Searchable markdown wiki organized by domain (Tech / Work / Home / Personal)
- **Quick Capture** — `/capture` — fast mobile-friendly entry point for tasks, ideas, and KB notes

---

## Stack

| Layer      | Tool                        |
|------------|-----------------------------|
| Framework  | Next.js 14 (App Router)     |
| Database   | Neon Postgres               |
| ORM        | Prisma                      |
| Deployment | Vercel                      |
| Fonts      | Syne (display), Space Mono  |

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/spider-hill-os.git
cd spider-hill-os
npm install
```

### 2. Database — Neon

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project called `spider-hill-os`
3. Copy the connection string from the dashboard

### 3. Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="postgresql://user:password@host/spider-hill-os?sslmode=require"
NEXTAUTH_SECRET="your-secret"   # openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database setup

```bash
npm run db:push       # Push schema to Neon
npm run db:generate   # Generate Prisma client
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/dashboard`.

---

## Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B — GitHub + Vercel Dashboard

1. Push to GitHub
2. Import repo at [vercel.com/new](https://vercel.com/new)
3. Add environment variables in the Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` → set to your Vercel URL (e.g. `https://spider-hill-os.vercel.app`)
4. Deploy

> **Important**: After deploy, update `NEXTAUTH_URL` to your actual Vercel domain.

---

## Add to Phone Home Screen

Navigate to `https://your-domain.vercel.app/capture` in Safari (iOS) or Chrome (Android) and use "Add to Home Screen". The capture page is designed as a minimal PWA-style entry point.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── tasks/         # GET all, POST; [id]/ PATCH, DELETE
│   │   ├── ideas/         # GET all, POST
│   │   ├── articles/      # GET all, POST
│   │   └── kb/            # GET with search, POST
│   ├── dashboard/         # Main dashboard
│   ├── tasks/             # Task list + new task form
│   ├── ideas/             # Idea list + capture form
│   ├── articles/          # Kanban writing pipeline + new form
│   ├── kb/                # KB search grid + new entry form
│   ├── capture/           # Quick capture (mobile-optimized)
│   └── globals.css        # Design system + CSS variables
├── components/
│   └── layout/
│       ├── Sidebar.tsx    # Navigation
│       └── Topbar.tsx     # Search + date
├── lib/
│   └── prisma.ts          # Prisma client singleton
└── types/
    └── index.ts           # TypeScript interfaces
prisma/
└── schema.prisma          # Database schema
```

---

## Extending Spider Hill OS

### Add a new section

1. Add a route folder under `src/app/your-section/`
2. Add the nav item to `src/components/layout/Sidebar.tsx`
3. Add a Prisma model to `prisma/schema.prisma`
4. Run `npm run db:push && npm run db:generate`
5. Add an API route under `src/app/api/your-section/`

### Add due date calendar view

Install `react-calendar` or use the native date input grouping by week in the tasks API route with `groupBy: 'week'` query param.

### Add tags-based filtering to KB

The `tags` field uses Postgres arrays. The KB API already supports `hasSome` — extend the filter bar with tag pills pulled from a `GET /api/kb/tags` route.

---

## Design System

Colors are defined as CSS variables in `globals.css`. The neon palette:

| Variable          | Value     | Usage              |
|-------------------|-----------|--------------------|
| `--neon-pink`     | `#f72585` | Tasks / writing    |
| `--neon-purple`   | `#9b5de5` | Ideas              |
| `--neon-blue`     | `#4361ee` | Work category      |
| `--neon-cyan`     | `#4cc9f0` | Nav / system       |
| `--neon-green`    | `#06d6a0` | Done / KB / home   |
| `--neon-amber`    | `#f4a261` | Writing pipeline   |

Background layers: `--bg-base` → `--bg-surface` → `--bg-elevated` → `--bg-overlay`
