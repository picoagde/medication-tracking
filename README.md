# medication-tracker

A lightweight **Medication tracking** app REST API that lets you list, create, read, update, and delete medications. It ships with a React + Vite UI for managing medication entries.

Built with:
- **Hono** — a fast web framework for TypeScript
- **TypeScript** — type-safe development
- **SQLite (`node:sqlite`)** — local file database (`medications.db`)

## Description

A small HTTP API serving medication entries. It provides CRUD operations on the `medications` table and a simple root endpoint. Each medication tracks a name plus optional dosage, form, frequency, schedule, instructions, and notes.

### Endpoints

| Method | Path               | Description |
|--------|--------------------|-------------|
| GET    | `/`                | Simple info endpoint → `{"text":"Medication tracking API running"}` |
| GET    | `/medications`     | List all medications (array) |
| POST   | `/medications`     | Create a medication. Body: `{ name?, dosage?, form?, frequency?, schedule?, instructions?, notes? }`. **Name is required.** |
| GET    | `/medications/:id` | Get a single medication by ID. Returns 404 if not found or `id` param missing. |
| PATCH  | `/medications/:id` | Update `name` and/or the optional medication fields. Returns 404 if not found or `id` param missing. |
| DELETE | `/medications/:id` | Delete the medication with the given ID. |

### Example Requests

**Create a medication**
```bash
curl -X POST http://localhost:3000/medications \
  -H "Content-Type: application/json" \
  -d '{"name":"Aspirin","dosage":"500 mg","form":"tablet","frequency":"once daily","schedule":"08:00"}'
```

**List medications**
```bash
curl http://localhost:3000/medications
```

**Get a single medication**
```bash
curl http://localhost:3000/medications/<id>
```

**Update a medication (PATCH)**
```bash
curl -X PATCH http://localhost:3000/medications/<id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Aspirin","dosage":"81 mg"}'
```

**Delete a medication**
```bash
curl -X DELETE http://localhost:3000/medications/<id>
```

## Quick Start

### Prerequisites
- Node.js ≥ 22.5 (Node 24+ recommended — the project uses `node:sqlite`, which requires a recent Node version)
- npm or yarn

### Build the project
```bash
npm run build   # runs `tsc` → outputs to `dist/`
```

### Run the dev server
```bash
npm run dev     # runs `node dist/index.js` (defaults to port 3000)
# or
npm start       # same as `dev`
```

The API will be available at **`http://localhost:3000`**.

## Medication Tracking UI

Visit **`http://localhost:3000/ui`** to see the Google Keep-style HTML page. It renders the medication list from `http://localhost:3000/medications` and lets you create, edit, and delete medications.

## Database

Medications are persisted in a local SQLite file named **`medications.db`**, created automatically on the first run.

## Project Structure

```
medication-tracker/
├── package.json   # dependencies, scripts (build / build:web / dev / dev:web / start)
├── tsconfig.json  # TypeScript config (strict, outDir ./dist, includes only src/)
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
    ├── db.ts      # single instance of the SQLite DB (medications.db)
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
```

## License

MIT — feel free to use and modify.
