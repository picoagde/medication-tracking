# Deployment Guide — medication-tracker

## Overview

`medication-tracker` is a lightweight REST API for managing medications, built with **Hono**, **TypeScript**, and **SQLite (`node:sqlite`)**. It exposes CRUD operations on the `medications` table and ships a React + Vite UI at `http://localhost:3000/ui`.

## Prerequisites

- Node.js (v24 or newer)
- Docker (for `docker-compose`)
- Kubernetes client (for `kubectl`) — optional
- nginx (for reverse proxy)

## Build the project

```bash
cd /home/opencode/Projects/medication-tracker
npm run build   # tsc → dist/
npm run build:web  # vite → web/dist/
```

The API runs at `http://localhost:3000` and serves `/ui` (React UI).

## Run locally with Docker Compose

```bash
docker compose up --build
```

- The container exposes port **3000** (API).
- The built React UI is served by the same container at `/ui`.

## Run locally (direct)

```bash
npm run dev   # API on :3000, Vite UI on :5173 proxies /api → :3000
```

## Deploy to Kubernetes

### 1. Build the image

Build the Docker image from the source:

```bash
docker build -t medication-tracker:latest .
```

### 2. Apply the Kubernetes deployment manifest

Create `kubernetes/deployment.yaml` (see below) and apply it:

```bash
kubectl apply -f kubernetes/deployment.yaml
```

The deployment creates **N replicas** (default 2). Adjust `replicas` as needed.

### 3. Expose the service

Option A — via a Service:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: medication-tracker-svc
spec:
  selector:
    app: medication-tracker
  ports:
    - port: 80
      targetPort: 3000
```

Apply the service alongside the deployment.

Option B — use the Ingress (see nginx reverse proxy instructions).

## Docker Compose

Use `docker-compose.yml` to run both the API and the UI in one container:

```bash
docker compose up --build
```

| Service | Port |
|---|---|
| medication-tracker | 3000 |

## Reverse Proxy with Nginx

### Step 1 — Install nginx on the host

```bash
sudo apt-get update && sudo apt-get install -y nginx
```

### Step 2 — Create an Ingress file (or use a config block)

Create `/etc/nginx/sites-available/medication-tracker`:

```nginx
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://localhost:3000/;   # API routes
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ui {
        proxy_pass http://localhost:3000/ui;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/medication-tracker /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### Step 3 — Update Docker Compose (optional)

Add an `nginx` service to `docker-compose.yml`:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/conf.d/default.conf:/etc/nginx/conf.d/default.conf:ro
```

Then run:

```bash
docker compose up --build
```

### Step 4 — Verify

- `curl http://localhost` → API info (`{"text":"Medication tracking API running"}`).
- `curl http://localhost/api/medications` → list medications.
- `curl http://localhost/ui` → React UI.

## Files added / updated

| File | Purpose |
|---|---|
| `docker-compose.yml` | Local compose stack (API on port 3000) |
| `kubernetes/deployment.yaml` | Kubernetes Deployment manifest |
| `DEPLOYMENT.md` | This deployment guide |
| `nginx-reverse-proxy.md` | Detailed nginx reverse proxy instructions |
