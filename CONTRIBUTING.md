# Contributing to medication-tracker

Thanks for your interest in improving medication-tracker! This project is a lightweight REST API for managing medications, built with **Hono**, **TypeScript**, and **SQLite (`node:sqlite`)**, with a React + Vite UI under `web/`.

## Prerequisites

- Node.js (version matching the environment used, e.g. Node 22+ with `node:sqlite` support)
- npm

## Getting started

Run these commands from the repository root (the `medication-tracker` directory):

```bash
npm install
```

## Development

Two servers are used — the API server and the React UI dev server:

```bash
# API server (Hono + TypeScript, port 3000) — serves /ui, /medications, and /api/medications
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
medication-tracker/
├── package.json   # dependencies, scripts (build / build:web / dev / dev:web / start)
├── tsconfig.json  # TypeScript config (strict, outDir ./dist, includes only src/)
├── vite.config.ts # Vite config for the React UI (root: web/, dev proxy /api -> :3000, host 0.0.0.0)
├── CONTRIBUTING.md
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
    ├── db.ts      # single instance of the SQLite DB (medications.db)
    ├── helpers.ts # request-body JSON helper (readJson)
    ├── index.ts   # Hono app that registers all routes (serves built UI at /ui)
    └── routes/    # one file per route:
        ├── list.ts     (GET /medications)
        ├── create.ts   (POST /medications)
        ├── get.ts      (GET /medications/:id)
        ├── update.ts   (PATCH /medications/:id)
        ├── delete.ts   (DELETE /medications/:id)
        ├── root.ts     (GET /)
        └── ui.ts       (GET /ui -> serves the built React UI)
```

## API

| Method | Path               | Description |
|--------|--------------------|-------------|
| GET    | `/`                | `{"text":"Medication tracking API running"}` |
| GET    | `/medications`     | List all medications (array) |
| POST   | `/medications`     | Create medication; body `{ name?, dosage?, form?, frequency?, schedule?, instructions?, notes? }`. **Name required.** |
| GET    | `/medications/:id` | Get single medication by ID (404 if not found or `id` missing). |
| PATCH  | `/medications/:id` | Update `name` and/or optional medication fields (404 if not found or `id` missing). |
| DELETE | `/medications/:id` | Delete the medication. |

Example:

```bash
curl -X POST http://localhost:3000/medications \
  -H "Content-Type: application/json" \
  -d '{"name":"Aspirin","dosage":"500 mg","form":"tablet","frequency":"once daily","schedule":"08:00"}'
```

Medication UI: visit `http://localhost:3000/ui` (the built React UI served by the API server).

## Contributing

- Keep changes consistent with the existing style and structure.
- TypeScript is compiled with `strict: true` and `noUnusedLocals` / `noUnusedParameters` enabled; make sure `npm run build` passes.
- Add/update docs (AGENTS.md / CONTRIBUTING.md) when behavior or structure changes.
- Commit changes with a clear message (e.g., `"Add README for medication-tracker"`). The git workflow is:

```bash
git add <file>
git commit -m "<message>"
```

- After changes, run the build and dev servers to verify the project still works.

## Code conventions

- One file per route under `src/routes/`, following the existing route handler style (Hono handlers with `(c: Context, next: Next) => R` signature).
- Database access goes through `src/db.ts` (single SQLite instance); do not open new SQLite connections elsewhere.
- UI code lives under `web/` (React 19 + Vite); the built UI is served by the API server at `/ui`.
