# syntax=docker/dockerfile:1

# ---------- Build stage ----------
# Compile TypeScript and build the React UI (vite build -> web/dist).
FROM node:24-slim AS build
WORKDIR /app

# Install dependencies first (npm ci installs devDependencies needed for building).
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source and build both artifacts.
COPY . .
RUN npm run build && npm run build:web

# ---------- Runtime stage ----------
# Run only the compiled API + built React UI with production dependencies.
FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only (API runtime deps; no devDeps needed at runtime).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Bring in the compiled API (dist/) and the built React UI (web/dist/), which the
# Hono server serves at /ui (see src/index.ts clientDistDir).
COPY --from=build /app/dist ./dist
COPY --from=build /app/web/dist ./web/dist

EXPOSE 3000
CMD ["node", "dist/index.js"]
