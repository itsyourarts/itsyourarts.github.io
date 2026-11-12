import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages serves this repository at /ShadowHtml/, not at the domain root.
// Vite's local dev server and other hosts continue to use / by default.
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true' || process.env.GITHUB_PAGES === 'true';

export default defineConfig({
  base: isGitHubPages ? '/ShadowHtml/' : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
