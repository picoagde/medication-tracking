# Reverse Proxy with Nginx — medication-tracker

This guide shows how to expose the `medication-tracker` API behind an nginx reverse proxy so that external clients reach the app via plain HTTP (port 80) instead of directly hitting port 3000.

## Prerequisites

- Docker (optional, for local testing)
- Nginx installed on the host (`apt-get install nginx`)
- The project built and running locally at `http://localhost:3000` (API) and `http://localhost:5173/ui` (Vite UI).

## 1. Create an Ingress / site config

Create `/etc/nginx/sites-available/medication-tracker`:

```nginx
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://localhost:3000/;
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

## 2. (Optional) Add an Nginx service to Docker Compose

Edit `docker-compose.yml` and add:

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/conf.d/default.conf:/etc/nginx/conf.d/default.conf:ro
```

Then run `docker compose up --build`.

## 3. Verify

```bash
curl http://localhost/api/medications   # API list
curl http://localhost/ui                # React UI
```

The `/api/...` paths are forwarded to the API on port 3000; everything else (including `/ui`) is served by the same container.

## Notes

- The Vite dev server already proxies `/api` → `http://localhost:3000`. Nginx can do the same or simply expose port 80.
- If you use the Kubernetes Ingress resource, point it at this nginx configuration (see k8s deployment manifest).
