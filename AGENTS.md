# AGENTS.md — notes-app

Project: **notes-app** — a lightweight REST API for managing notes.
Location: `/home/opencode/Projects/notes-app`
Branch: `master`

## Overview

A small HTTP API built with **Hono**, **TypeScript**, and **SQLite (`node:sqlite`)**. It exposes CRUD operations on the `notes` table plus a simple root endpoint.

| Feature | Detail |
|---|---|
| Framework | Hono (v4.13.14) |
| Language | TypeScript 7 |
| Database | SQLite file `notes.db` (created automatically on first run) |
| Build tool | `tsc` via `npm run build` → outputs to `dist/` |

## Quick Start

```bash
cd /home/opencode/Projects/notes-app

# 1. Build the project
npm run build   # runs `tsc`

# 2. Run the dev server (defaults to port 3000)
npm run dev     # runs `node dist/index.js`
# or
npm start       # same as `dev`

# API is available at http://localhost:3000
```

The `/ui` route fetches notes from `http://localhost:3000/notes`, so the server must be running before visiting it.

## Project Structure

```
notes-app/
├── package.json   # dependencies, scripts (build / dev / start)
├── tsconfig.json  # TypeScript config (outDir: ./dist)
    └── src/
     ├── db.ts      # single instance of the SQLite DB (`notes.db`)
     ├── index.ts   # Hono app that registers all routes
     └── routes/    # one file per route:
         ├── list.ts     (GET /notes)
         ├── create.ts   (POST /notes)
         ├── get.ts      (GET /notes/:id)
         ├── update.ts   (PATCH /notes/:id)
         ├── delete.ts   (DELETE /notes/:id)
         ├── root.ts     (GET /)
         └── ui.ts       (GET /ui)

## API Endpoints

| Method | Path               | Description |
|--------|--------------------|-------------|
| GET    | `/`                | `{"text":"Notes API running"}` |
| GET    | `/notes`           | List all notes (array) |
| POST   | `/notes`           | Create note; body `{ title?, content? }`. **Title required.** Content defaults to trimmed body value. |
| GET    | `/notes/:id`       | Get single note by ID (404 if not found or `id` missing). |
| PATCH  | `/notes/:id`       | Update `title` and/or `content` (404 if not found or `id` missing). |
| DELETE | `/notes/:id`       | Delete the note. |

### Examples

```bash
# Create a note
curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"My first note","content":"Hello world!"}'

# List notes
curl http://localhost:3000/notes

# Get /update /delete a note
curl http://localhost:3000/notes/<id>   # GET
curl -X PATCH http://localhost:3000/notes/<id> \
  -H "Content-Type: application/json" \
  -d '{"title":"New title"}'
curl -X DELETE http://localhost:3000/notes/<id>
```

## Notes UI

Visit **`http://localhost:3000/ui`** to see the Google Keep-style HTML page. It renders an unordered list of notes fetched from `/notes`.

## Git Workflow

- Commits are made with messages like `"Add README for notes-app"`.
- `git status --short` shows untracked files (e.g., new docs).
- Run `git add <file>` and `git commit -m "..."` to record changes.
