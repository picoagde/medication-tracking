# AGENTS.md — medication-tracker

Project: **medication-tracker** — a lightweight REST API for managing medications.
Location: `/home/opencode/Projects/medication-tracker`
Branch: `master`

## Overview

A small HTTP API built with **Hono**, **TypeScript**, and **SQLite (`node:sqlite`)**. It exposes CRUD operations on the `medications` table plus a simple root endpoint. Each medication tracks a `name` plus optional `dosage`, `form`, `frequency`, `schedule`, `instructions`, and `notes`.

| Feature | Detail |
|---|---|
| Framework | Hono (v4.13.14) |
| Language | TypeScript 7 |
| Database | SQLite file `medications.db` (created automatically on first run) |
| Build tool | `tsc` via `npm run build` → outputs to `dist/` |

## Quick Start

```bash
cd /home/opencode/Projects/medication-tracker

# 1. Build the project
npm run build   # runs `tsc`

# 2. Run the dev server (defaults to port 3000)
npm run dev     # runs `node dist/index.js`
# or
npm start       # same as `dev`

# API is available at http://localhost:3000
```

The `/ui` route fetches medications from `http://localhost:3000/medications`, so the server must be running before visiting it.

## Project Structure

```
medication-tracker/
├── package.json   # dependencies, scripts (build / build:web / dev / dev:web / start)
├── tsconfig.json  # TypeScript config (outDir: ./dist, includes only src/)
├── vite.config.ts # Vite config for the React UI (root: web/, dev proxy /api -> :3000, host 0.0.0.0)
├── Dockerfile    # Docker build/runtime config for the project
├── .dockerignore
├── LICENSE
└── web/           # React + Vite UI (create/edit/delete medications)
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── App.css
        ├── api.ts
        ├── types.ts
        └── components/
            └── MedicationItem.tsx
└── src/
    ├── db.ts      # single instance of the SQLite DB (`medications.db`)
    ├── helpers.ts # request-body JSON helper (`readJson`)
    ├── index.ts   # Hono app that registers all routes (serves built UI at /ui)
    └── routes/    # one file per route:
        ├── list.ts     (GET /medications)
        ├── create.ts   (POST /medications)
        ├── get.ts      (GET /medications/:id)
        ├── update.ts   (PATCH /medications/:id)
        ├── delete.ts   (DELETE /medications/:id)
        ├── root.ts     (GET /)
        └── ui.ts       (GET /ui -> serves the built React UI)

## API Endpoints

| Method | Path               | Description |
|--------|--------------------|-------------|
| GET    | `/`                | `{"text":"Medication tracking API running"}` |
| GET    | `/medications`     | List all medications (array) |
| POST   | `/medications`     | Create medication; body `{ name?, dosage?, form?, frequency?, schedule?, instructions?, notes? }`. **Name required.** |
| GET    | `/medications/:id` | Get single medication by ID (404 if not found or `id` missing). |
| PATCH  | `/medications/:id` | Update `name` and/or optional medication fields (404 if not found or `id` missing). |
| DELETE | `/medications/:id` | Delete the medication. |

### Examples

```bash
# Create a medication
curl -X POST http://localhost:3000/medications \
  -H "Content-Type: application/json" \
  -d '{"name":"Aspirin","dosage":"500 mg","form":"tablet","frequency":"once daily","schedule":"08:00"}'

# List medications
curl http://localhost:3000/medications

# Get /update /delete a medication
curl http://localhost:3000/medications/<id>   # GET
curl -X PATCH http://localhost:3000/medications/<id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Aspirin","dosage":"81 mg"}'
curl -X DELETE http://localhost:3000/medications/<id>
```

## React UI

- Created with **React 19 + Vite 6** in `web/`; see `npm run build:web` and `npm run dev:web`.
- The API server (`/ui` route in `src/index.ts`) serves the built UI from `web/dist` and proxies `/api/medications` to the API so the UI talks to the server same-origin. The POC `src/routes/ui.tsx` was removed.
- Dev workflow: `npm run build && npm run dev` (API on :3000), plus `npm run dev:web`
  for the Vite dev server on :5173 (which proxies `/api` to :3000).

## API

| Method | Path               | Description |
|--------|--------------------|-------------|
| GET    | `/`                | `{"text":"Medication tracking API running"}` |
| GET    | `/medications`     | List all medications (array) |
| POST   | `/medications`     | Create medication; body `{ name?, dosage?, form?, frequency?, schedule?, instructions?, notes? }`. **Name required.** |
| GET    | `/medications/:id` | Get single medication by ID (404 if not found or `id` missing). |
| PATCH  | `/medications/:id` | Update `name` and/or optional medication fields (404 if not found or `id` missing). |
| DELETE | `/medications/:id` | Delete the medication. |

## Medication UI

Visit **`http://localhost:3000/ui`** to see the Google Keep-style HTML page. It renders a medication list and lets you create, edit, and delete medications.

## Git Workflow

- Commits are made with messages like `"Add README for medication-tracker"`.
- `git status --short` shows untracked files (e.g., new docs).
- Run `git add <file>` and `git commit -m "..."` to record changes.
