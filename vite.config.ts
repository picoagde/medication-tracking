import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The React UI lives in `web/` and is served by the Hono API server at `/ui`
// (see src/index.ts). In dev, `npm run dev:web` runs Vite on port 5173 with a
// proxy so the UI can talk to the API on port 3000.
export default defineConfig({
  root: 'web',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
