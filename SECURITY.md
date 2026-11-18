# Security Review — medication-tracker

**Date:** 2026-11-01
**Scope:** All source files of the medication-tracker REST API (`src/`, `web/`) plus build/runtime configuration (`package.json`, `tsconfig.json`, `vite.config.ts`, `Dockerfile`, `.dockerignore`, `.gitignore`).
**Method:** Static code review of every source file; dynamic verification against a locally running server (`npm run build` → `npm start`, port 3000) using `curl` for SQL-injection and path-traversal probes.

## Executive summary

The project is a small POC REST API (Hono + TypeScript + SQLite) with a React/Vite UI. It is **not yet deployable as a secure service**: the API is completely **unauthenticated**, runs over **plain HTTP**, has **no rate limiting or hardening headers**, and binds to **all network interfaces** by default. On the other hand, the most important injection/scripting risks are **already well mitigated**: all SQL input is parameterized, static-file path traversal is blocked, and the UI never uses `dangerouslySetInnerHTML` (so React auto-escaping protects medication content).

No security findings are rated **Critical** or **High**. The notable risks are the exposed, unauthenticated API surface and the absence of transport/hardening protections (Low severity). Details and evidence are below.

## Findings

| ID | Severity | Finding | Status |
|----|----------|---------|--------|
| SEC-01 | Medium | Unauthenticated, unprotected API with no rate limiting and a default bind on all interfaces | Open — needs hardening before deployment |
| SEC-02 | Low | Plain HTTP transport (no TLS) and no reverse-proxy/TLS layer | Open — by design for a local POC, but a risk when deployed |
| SEC-03 | Low | Missing security response headers (CSP, HSTS, `X-Content-Type-Options`) | Open — minor hardening gap |
| SEC-04 | Low | Static file server hardening gaps (no symlink guard, default `text/plain` for unknown extensions) | Open — traversal is already blocked |
| SEC-05 | Info | No input validation/sanitization at the app boundary (title/content stored raw) | Informational — not a vulnerability in this codebase |
| SEC-06 | Info | Unbounded request body size (no body-size limit on JSON parsing) | Informational — minor DoS vector |

### SEC-01 — Unauthenticated, unprotected API + exposed network surface (Medium)

**Location:** `src/index.ts` (server listen, `0.0.0.0` binding default), `package.json` (`dev`/`start` scripts), `Dockerfile` (`EXPOSE 3000`), no authentication/rate-limiting code anywhere.

**Evidence:**
- `src/index.ts` binds the server directly to port 3000 with no interface restriction (only `port` is validated).
- `vite.config.ts` binds the Vite dev server to `host: '0.0.0.0'`.
- A grep for `auth`, `Authorization`, `rateLimit`, `CORS` across `src/` returned no matches.
- `Dockerfile` exposes port 3000 and runs the compiled API directly.

**Impact:** Any network host that can reach the service can read medications (`GET /medications`), create medications (`POST /medications`, title required), update/delete medications, and read the UI. For a local POC this is expected, but the service as shipped is not ready to expose to untrusted networks.

**Recommendation:** Add authentication (e.g., API keys / session) and per-route rate limiting before any public deployment; restrict the server bind to `127.0.0.1` (or place the API behind a network boundary) unless it is intentionally public.

### SEC-02 — Plain HTTP transport (Low)

**Location:** `Dockerfile` (`EXPOSE 3000`, no TLS config), `src/index.ts` (plain `serve` on port 3000).

**Evidence:** No TLS/`https` handling, reverse proxy, or certificate configuration exists anywhere in the repo (grep for `tls`, `https`, `certificate` in `src/`, `Dockerfile` returned no matches).

**Impact:** All medication data and the UI are transmitted in cleartext if the service is reachable from outside the host.

**Recommendation:** Put the API behind a TLS-terminating reverse proxy (e.g., Caddy/nginx) or add TLS termination in the server when the service is deployed publicly.

### SEC-03 — Missing security response headers (Low)

**Location:** `src/index.ts` (serves `/ui` HTML and static assets without headers; no middleware adds security headers).

**Evidence:** Grep for `Security`, `CSP`, `HSTS`, `X-Content-Type-Options` in `src/` returned no matches; the `/ui` response is plain HTML with no security headers.

**Impact:** Minor hardening gap. The only injection vector on the UI is medication content, which is escaped by React (see below), so this is low severity — but missing `Content-Security-Policy` removes any defense-in-depth against future rendering changes.

**Recommendation:** Add a Hono middleware that sets `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and (if TLS is added) HSTS.

### SEC-04 — Static file server hardening gaps (Low)

**Location:** `src/index.ts` (`serveStatic`), `app.get('/ui/*')`, `app.get('/assets/*')`.

**Evidence:** Path traversal is blocked by normalization + a `startsWith(clientDistDir + sep)` containment check. Verified by direct probing against a running server:
- `GET /ui/../../package.json` → `404`
- `GET /ui/../../README.md` → `404`
- `GET /ui/..%2f..%2fpackage.json` → `404`

However, the guard relies on the normalize/`startsWith` check only; it does not resolve symlinks of `clientDistDir`, and unknown file extensions fall back to `text/plain; charset=utf-8` (`contentType` in `src/index.ts`).

**Impact:** Low. Traversal is already prevented; the residual risks are minimal (symlink handling, default MIME).

**Recommendation:** Optionally resolve symlinks when validating static files, and restrict the static handler to an explicit allowlist of built-asset extensions rather than a catch-all.

### SEC-05 — No input validation/sanitization at the app boundary (Info)

**Location:** `src/routes/create.ts`, `src/routes/update.ts`, `src/db.ts`.

**Evidence:** `title` is `NOT NULL` in the schema but otherwise stored as-is; `content` is stored raw (verified: a payload `1;DROP TABLE medications;` was persisted verbatim as the `content` value, and the medications table retained its rows afterward — the queries are parameterized, so this is data, not injection).

**Impact:** Informational. Not a vulnerability in this codebase because every SQL statement uses bound parameters and the UI escapes rendered content. The only residual risk is if medication content is later consumed by unescaped HTML or injected into markup.

**Recommendation:** Consider optional length caps (e.g., 200 chars for title, 20000 for content) and sanitization at the app boundary when the UI is reused by untrusted clients.

### SEC-06 — Unbounded request body size (Info)

**Location:** `src/helpers.ts` (`readJson` → `c.req.json()`), used by `create`/`update`.

**Evidence:** The JSON body is parsed without any size/`Content-Length` check, so a client can send an arbitrarily large body and it will be read into memory.

**Impact:** Informational. A minor DoS vector on a small service; unlikely in normal use.

**Recommendation:** Add an optional request-body size limit (e.g., 1–2 MB) in a Hono middleware for `POST`/`PATCH` before parsing.

## Areas verified to be secure

- **SQL injection:** All identifiers/parameters are passed as bound placeholders (`?`). Verified: `GET /medications/1%20OR%201%3D1` returns `404` (`{"error":"Medication not found"}`); a `1;DROP TABLE medications;` payload in `title`/`content` was stored as literal text and did not alter the schema (verified by the following list still containing the row).
- **Path traversal in static file serving:** blocked by `path.normalize` + `startsWith` containment (see SEC-04 evidence).
- **XSS:** No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, or `child_process`/`require` appears anywhere in `src/` or `web/src/` (verified by grep). medication `title`/`content` are rendered as React text nodes, which auto-escape; therefore medication content is not directly exploitable via the UI.
- **No secrets committed:** `medications.db` (runtime data) is gitignored, and there is no `.env` or credential file in the repo.
- **Build integrity:** `npm run build` (tsc) completes cleanly (exit 0), and the server starts and serves the API and UI as expected.

## Recommendations (priority order)

1. **SEC-01 (Medium):** Add authentication and rate limiting; restrict the bind address to loopback (`127.0.0.1`) unless the service is intended to be public, and move the API behind a network boundary when deployed.
2. **SEC-02 (Low):** Add TLS (via reverse proxy) before exposing the service over the network.
3. **SEC-03 (Low):** Add security response headers (CSP, `X-Content-Type-Options: nosniff`, etc.) as a middleware.
4. **SEC-04 (Low):** Strengthen the static handler (symlink handling, explicit allowlist) — currently traversal is already blocked.
5. **SEC-05/SEC-06 (Info):** Add optional body-size limits and, for hardening, sanitization/length caps on medication fields.

## Conclusion

No Critical or High security flaws were found. The main open risk is that the service is fully unauthenticated, plain-HTTP, and bound to all interfaces, which makes it unsafe to deploy directly to untrusted networks (SEC-01/02). The core injection (SQLi) and cross-site scripting (XSS) vectors are already mitigated by parameterized SQL, React auto-escaping, and absence of dangerous DOM APIs. The report should be reviewed/updated whenever the service is moved beyond local use or after any further code changes.
