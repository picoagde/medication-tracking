# Contributing to notes-app

Thanks for your interest in improving notes-app! This project is a lightweight REST API for managing notes, built with **Hono**, **TypeScript**, and **SQLite (`node:sqlite`)**, with a React + Vite UI under `web/`.

## Prerequisites

- Node.js (version matching the environment used, e.g. Node 22+ with `node:sqlite` support)
- npm

## Getting started

Run these commands from the repository root (the `notes-app` directory):

```bash
npm install
```

## Development

Two servers are used — the API server and the React UI dev server:

```bash
# API server (Hono + TypeScript, port 3000) — serves /ui, /notes, and /api/notes
npm run dev          # runs node dist/index.js
# or:
npm start            # same as dev

# React UI (Vite dev server, port 5173, proxies /api to :3000)
npm run dev:web
```

The API server should be running before opening the UI, since the UI is served by the API server at `/ui` (built React app) and the Vite dev server serves the React source directly.

### Building

```bash
npm run build       # tsc -> outputs to dist/
npm run build:web   # vite build -> outputs to web/dist/ (built UI)
```

## Project structure

```
notes-app/
├── package.json   # dependencies, scripts (build / build:web / dev / dev:web / start)
├── tsconfig.json  # TypeScript config (strict, outDir ./dist, includes only src/)
├── vite.config.ts # Vite config for the React UI (root: web/, dev proxy /api -> :3000, host 0.0.0.0)
├── CONTRIBUTING.md
└── web/           # React + Vite UI (create/edit/delete notes)
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── App.css
        ├── api.ts
        ├── types.ts
        └── components/
            └── NoteItem.tsx
└── src/
    ├── db.ts      # single instance of the SQLite DB (notes.db)
    ├── helpers.ts # request-body JSON helper (readJson)
    ├── index.ts   # Hono app that registers all routes (serves built UI at /ui)
    └── routes/    # one file per route:
        ├── list.ts     (GET /notes)
        ├── create.ts   (POST /notes)
        ├── get.ts      (GET /notes/:id)
        ├── update.ts   (PATCH /notes/:id)
        ├── delete.ts   (DELETE /notes/:id)
        ├── root.ts     (GET /)
        └── ui.ts       (GET /ui -> serves the built React UI)
```

## API

| Method | Path               | Description |
|--------|--------------------|-------------|
| GET    | `/`                | `{"text":"Notes API running"}` |
| GET    | `/notes`           | List all notes (array) |
| POST   | `/notes`           | Create note; body `{ title?, content? }`. **Title required.** Content defaults to trimmed body value. |
| GET    | `/notes/:id`       | Get single note by ID (404 if not found or `id` missing). |
| PATCH  | `/notes/:id`       | Update `title` and/or `content` (404 if not found or `id` missing). |
| DELETE | `/notes/:id`       | Delete the note. |

Example:

```bash
curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"My first note","content":"Hello world!"}'
```

Notes UI: visit `http://localhost:3000/ui` (the built React UI served by the API server).

## Contributing

- Keep changes consistent with the existing style and structure.
- TypeScript is compiled with `strict: true` and `noUnusedLocals` / `noUnusedParameters` enabled; make sure `npm run build` passes.
- Add/update docs (AGENTS.md / CONTRIBUTING.md) when behavior or structure changes.
- Commit changes with a clear message (e.g., `"Add README for notes-app"`). The git workflow is:

```bash
git add <file>
git commit -m "<message>"
```

- After changes, run the build and dev servers to verify the project still works.

## Code conventions

- One file per route under `src/routes/`, following the existing route handler style (Hono handlers with `(c: Context, next: Next) => R` signature).
- Database access goes through `src/db.ts` (single SQLite instance); do not open new SQLite connections elsewhere.
- UI code lives under `web/` (React 18 + Vite); the built UI is served by the API server at `/ui`.
