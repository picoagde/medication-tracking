# notes-app

A lightweight **Notes** app REST API that lets you list, create, read, update, and delete notes.

Built with:
- **Hono** — a fast web framework for TypeScript
- **TypeScript** — type-safe development
- **SQLite (`node:sqlite`)** — local file database (`notes.db`)

## Description

A small HTTP API serving note entries. It provides CRUD operations on the `notes` table and a simple root endpoint.

### Endpoints

| Method | Path               | Description |
|--------|--------------------|-------------|
| GET    | `/`                | Simple info endpoint → `{"text":"Notes API running"}` |
| GET    | `/notes`           | List all notes (array of `{id, title, content, createdAt}`) |
| POST   | `/notes`           | Create a new note. Body: `{ title?, content? }`. **Title is required.** Content defaults to the trimmed body value. |
| GET    | `/notes/:id`       | Get a single note by ID. Returns 404 if not found or `id` param missing. |
| PATCH  | `/notes/:id`       | Update `title` and/or `content`. Returns 404 if not found or `id` param missing. |
| DELETE | `/notes/:id`       | Delete the note with the given ID. |

### Example Requests

**Create a note**
```bash
curl -X POST http://localhost:3000/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"My first note","content":"Hello world!"}'
```

**List notes**
```bash
curl http://localhost:3000/notes
```

**Get a single note**
```bash
curl http://localhost:3000/notes/<id>
```

**Update a note (PATCH)**
```bash
curl -X PATCH http://localhost:3000/notes/<id> \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title"}'
```

**Delete a note**
```bash
curl -X DELETE http://localhost:3000/notes/<id>
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

> Note: The `/ui` route fetches notes from `http://localhost:3000/notes`, so the server must be running before visiting it.

### Database
Notes are persisted in a local SQLite file named **`notes.db`**, created automatically on the first run.

## Project Structure

```
notes-app/
├── package.json   # dependencies, scripts (build / dev / start)
├── tsconfig.json  # TypeScript config (outDir: ./dist)
└── src/
        ├── db.ts      # single instance of the SQLite DB (`notes.db`)
        ├── helpers.ts # request-body JSON helper (`readJson`)
        ├── index.ts   # Hono app that registers all routes
        └── routes/    # one file per route:
            ├── list.ts     (GET /notes)
            ├── create.ts   (POST /notes)
            ├── get.ts      (GET /notes/:id)
            ├── update.ts   (PATCH /notes/:id)
            ├── delete.ts   (DELETE /notes/:id)
            ├── root.ts     (GET /)
            └── ui.ts       (GET /ui)
```

## Notes UI

The `/ui` route renders a Google Keep-style HTML page. It loads the notes list from `http://localhost:3000/notes` and displays them in an unordered list:

```html
<!DOCTYPE html>
<html lang="en"><head>...<title>Notes</title></head>
<body style="font-family: sans-serif; max-width: 600px; margin: 2rem auto;">
  <h1>Notes (Google Keep style)</h1>
  <p>A list of your notes. Click a note to view details.</p>
  <ul id="notes-list"></ul>
  <script>...</script></body></html>
```

Visit **`http://localhost:3000/ui`** to see it.

## License

MIT — feel free to use and modify.
